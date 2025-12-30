'use server';

import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import ngeohash from 'ngeohash';
import { db } from './firebase';
import type { Company, Interaction, UserProfile } from './types';

// Mapeia um setor (prefixo do CNAE) para outros setores compatíveis
const CONNECTION_MATRIX: Record<string, string[]> = {
    // Indústria (10-33)
    'C': ['G', 'H', 'M'], // Indústria -> Comércio, Transporte, Serviços Profissionais
    // Construção (41-43)
    'F': ['C', 'G', 'L'], // Construção -> Indústria, Comércio, Imobiliário
    // Comércio (45-47)
    'G': ['C', 'H', 'I'], // Comércio -> Indústria, Transporte, Alojamento/Alimentação
    // Transporte (49-53)
    'H': ['C', 'G', 'J'], // Transporte -> Indústria, Comércio, Informação/Comunicação
    // Informação e Comunicação (58-63)
    'J': ['M', 'N', 'P'], // TI -> Serv. Profissionais, Administrativos, Educação
    // Atividades Financeiras (64-66)
    'K': ['M', 'L', 'K'], // Financeiro -> Serv. Profissionais, Imobiliário, Financeiro
    // Atividades Imobiliárias (68)
    'L': ['F', 'K', 'N'], // Imobiliário -> Construção, Financeiro, Serv. Administrativos
    // Atividades Profissionais, Científicas e Técnicas (69-75)
    'M': ['J', 'K', 'P'], // Serv. Profissionais -> TI, Financeiro, Educação
};

// Mapeia o prefixo do código CNAE para a letra da seção
function getCnaeSection(cnaeCode: string): string | null {
    const code = parseInt(cnaeCode.substring(0, 2), 10);
    if (code >= 1 && code <= 3) return 'A'; // Agricultura
    if (code >= 5 && code <= 9) return 'B'; // Indústrias Extrativas
    if (code >= 10 && code <= 33) return 'C'; // Indústrias de Transformação
    if (code >= 35 && code <= 39) return 'E'; // Água, Esgoto, etc.
    if (code >= 41 && code <= 43) return 'F'; // Construção
    if (code >= 45 && code <= 47) return 'G'; // Comércio
    if (code >= 49 && code <= 53) return 'H'; // Transporte
    if (code >= 55 && code <= 56) return 'I'; // Alojamento e Alimentação
    if (code >= 58 && code <= 63) return 'J'; // Informação e Comunicação
    if (code >= 64 && code <= 66) return 'K'; // Atividades Financeiras
    if (code === 68) return 'L'; // Atividades Imobiliárias
    if (code >= 69 && code <= 75) return 'M'; // Atividades Profissionais, Científicas e Técnicas
    if (code >= 77 && code <= 82) return 'N'; // Atividades Administrativas
    if (code === 85) return 'P'; // Educação
    if (code >= 86 && code <= 88) return 'Q'; // Saúde Humana e Serviços Sociais
    // Outras seções podem ser adicionadas aqui
    return null;
}

/**
 * Calcula a caixa delimitadora (bounding box) para uma consulta geográfica.
 * @param latitude - Latitude do ponto central.
 * @param longitude - Longitude do ponto central.
 * @param radiusInKm - Raio da busca em quilômetros.
 * @returns Um objeto com as latitudes e longitudes mínimas e máximas.
 */
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

export async function findConnections(userId: string, userProfile: UserProfile, userCompany: Company): Promise<Company[]> {
    const searchRadiusKm = userProfile.preferences?.searchRadiusKm || 10;
    const limitResults = 5;

    // 1. Get user's interactions (dismissed/requested companies)
    const interactionsQuery = query(collection(db, 'interactions'), where('userId', '==', userId));
    const interactionsSnap = await getDocs(interactionsQuery);
    const excludedCompanyIds = interactionsSnap.docs.map(doc => (doc.data() as Interaction).companyId);
    excludedCompanyIds.push(userCompany.id); // Exclude user's own company

    // 2. Determine compatible CNAE sections
    const userCnaeSection = getCnaeSection(userCompany.cnaePrincipal.code);
    if (!userCnaeSection) {
        console.warn("User's company CNAE section not found in matrix.");
        return [];
    }
    const compatibleCnaeSections = CONNECTION_MATRIX[userCnaeSection] || [];
    if (compatibleCnaeSections.length === 0) {
        console.warn(`No compatible CNAE sections found for section ${userCnaeSection}.`);
        return [];
    }

    // 3. Perform geographic query
    const { minLat, maxLat, minLon, maxLon } = getBoundingBox(userCompany.latitude, userCompany.longitude, searchRadiusKm);
    
    const lower = ngeohash.encode(minLat, minLon);
    const upper = ngeohash.encode(maxLat, maxLon);

    // 4. Build and execute Firestore query
    let companiesQuery = query(
        collection(db, 'companies'),
        where('geohash', '>=', lower),
        where('geohash', '<=', upper),
    );
    
    const querySnapshot = await getDocs(companiesQuery);
    
    const potentialMatches: Company[] = [];
    querySnapshot.forEach(doc => {
        const company = doc.data() as Company;

        // Post-query filtering
        const isWithinBounds = company.latitude >= minLat && company.latitude <= maxLat && company.longitude >= minLon && company.longitude <= maxLon;
        const isNotExcluded = !excludedCompanyIds.includes(company.id);
        const targetCnaeSection = getCnaeSection(company.cnaePrincipal.code);
        const isCnaeCompatible = targetCnaeSection && compatibleCnaeSections.includes(targetCnaeSection);

        if (isWithinBounds && isNotExcluded && isCnaeCompatible) {
            potentialMatches.push(company);
        }
    });

    // 5. Return limited results
    return potentialMatches.slice(0, limitResults);
}
