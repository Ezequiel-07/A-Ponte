'use server';

import { collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import ngeohash from 'ngeohash';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase/client';
import type { Company, Connection, Interaction, UserProfile } from './types';
import { explainRecommendation } from '@/ai/flows';

// Mapeia um setor (prefixo do CNAE) para outros setores compatíveis
const CONNECTION_MATRIX: Record<string, string[]> = {
    'C': ['G', 'H', 'M'], // Indústria -> Comércio, Transporte, Serviços Profissionais
    'F': ['C', 'G', 'L'], // Construção -> Indústria, Comércio, Imobiliário
    'G': ['C', 'H', 'I'], // Comércio -> Indústria, Transporte, Alojamento/Alimentação
    'H': ['C', 'G', 'J'], // Transporte -> Indústria, Comércio, Informação/Comunicação
    'J': ['M', 'N', 'P'], // TI -> Serv. Profissionais, Administrativos, Educação
    'K': ['M', 'L', 'K'], // Financeiro -> Serv. Profissionais, Imobiliário, Financeiro
    'L': ['F', 'K', 'N'], // Imobiliário -> Construção, Financeiro, Serv. Administrativos
    'M': ['J', 'K', 'P'], // Serv. Profissionais -> TI, Financeiro, Educação
};

function getCnaeSection(cnaeCode: string): string | null {
    if (!cnaeCode) return null;
    const code = parseInt(cnaeCode.substring(0, 2), 10);
    if (code >= 1 && code <= 3) return 'A';
    if (code >= 5 && code <= 9) return 'B';
    if (code >= 10 && code <= 33) return 'C';
    if (code >= 35 && code <= 39) return 'E';
    if (code >= 41 && code <= 43) return 'F';
    if (code >= 45 && code <= 47) return 'G';
    if (code >= 49 && code <= 53) return 'H';
    if (code >= 55 && code <= 56) return 'I';
    if (code >= 58 && code <= 63) return 'J';
    if (code >= 64 && code <= 66) return 'K';
    if (code === 68) return 'L';
    if (code >= 69 && code <= 75) return 'M';
    if (code >= 77 && code <= 82) return 'N';
    if (code === 85) return 'P';
    if (code >= 86 && code <= 88) return 'Q';
    return null;
}

function getBoundingBox(latitude: number, longitude: number, radiusInKm: number) {
  const kmInDegree = 111;
  const latDelta = radiusInKm / kmInDegree;
  const lonDelta = radiusInKm / (kmInDegree * Math.cos(latitude * (Math.PI / 180)));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
  };
}

export async function findConnections(userId: string, userProfile: UserProfile, userCompany: Company): Promise<Connection[]> {
    const searchRadiusKm = userProfile.preferences?.searchRadiusKm || 10;
    const limitResults = 5;

    const interactionsQuery = query(collection(db, 'interactions'), where('userId', '==', userId));
    const interactionsSnap = await getDocs(interactionsQuery);
    const excludedCompanyIds = interactionsSnap.docs.map(doc => (doc.data() as Interaction).companyId);
    excludedCompanyIds.push(userCompany.id);

    const userCnaeSection = getCnaeSection(userCompany.cnaePrincipal.code);
    if (!userCnaeSection) return [];
    
    const compatibleCnaeSections = CONNECTION_MATRIX[userCnaeSection] || [];
    if (compatibleCnaeSections.length === 0) return [];

    const { minLat, maxLat, minLon, maxLon } = getBoundingBox(userCompany.latitude, userCompany.longitude, searchRadiusKm);
    
    const lower = ngeohash.encode(minLat, minLon);
    const upper = ngeohash.encode(maxLat, maxLon);

    let companiesQuery = query(
        collection(db, 'companies'),
        where('geohash', '>=', lower),
        where('geohash', '<=', upper),
    );
    
    const querySnapshot = await getDocs(companiesQuery);
    
    const potentialMatches: Company[] = [];
    querySnapshot.forEach(doc => {
        const company = doc.data() as Company;

        const isWithinBounds = company.latitude >= minLat && company.latitude <= maxLat && company.longitude >= minLon && company.longitude <= maxLon;
        const isNotExcluded = !excludedCompanyIds.includes(company.id);
        const targetCnaeSection = getCnaeSection(company.cnaePrincipal.code);
        const isCnaeCompatible = targetCnaeSection && compatibleCnaeSections.includes(targetCnaeSection);

        if (isWithinBounds && isNotExcluded && isCnaeCompatible) {
            potentialMatches.push(company);
        }
    });

    const limitedMatches = potentialMatches.slice(0, limitResults);
    
    const connectionPromises = limitedMatches.map(async (candidateCompany) => {
        const { compatibilityScore, compatibilityReason } = await explainRecommendation({
            userCompanyProfile: JSON.stringify(userCompany),
            candidateCompanyProfile: JSON.stringify(candidateCompany),
        });

        const connection: Connection = {
            id: uuidv4(),
            requesterCompanyId: userCompany.id,
            targetCompanyId: candidateCompany.id,
            targetCompany: candidateCompany,
            status: 'requested', // This is a virtual status for recommendation
            compatibilityScore,
            compatibilityReason,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        return connection;
    });

    return Promise.all(connectionPromises);
}
