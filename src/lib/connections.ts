'use server';

import { collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import ngeohash from 'ngeohash';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase/client';
import type { Company, Connection, Interaction, UserProfile } from './types';
import { explainRecommendation } from '@/ai/flows';

// Mapeia uma seção do CNAE (letra) para outras seções compatíveis.
// Chave: Seção do CNAE da empresa do usuário.
// Valor: Array de seções do CNAE de empresas candidatas.
const CONNECTION_MATRIX: Record<string, string[]> = {
    // Indústrias de Transformação (C) podem FORNECER para:
    'C_sell': ['G', 'F', 'C'], // Comércio, Construção, Outras Indústrias
    // Comércio (G) pode COMPRAR de:
    'G_buy': ['C', 'A', 'B'], // Indústria, Agricultura, Indústrias Extrativas

    // Construção (F) pode FORNECER para:
    'F_sell': ['L', 'M', 'N'], // Atividades Imobiliárias, Profissionais, Administrativas
    // Atividades Imobiliárias (L) podem COMPRAR de:
    'L_buy': ['F', 'M', 'K'], // Construção, Serviços Profissionais, Financeiros

    // Transporte (H) pode FORNECER para:
    'H_sell': ['C', 'G', 'E'], // Indústria, Comércio, Água/Esgoto
    // Comércio (G) pode COMPRAR de (transporte):
    'G_buy_transport': ['H'],

    // TI (J) pode FORNECER para:
    'J_sell': ['M', 'K', 'Q', 'P'], // Serviços Profissionais, Financeiros, Saúde, Educação
    // Qualquer setor pode COMPRAR de TI:
    'all_buy_J': ['J'],

    // Serviços Profissionais (M) podem FORNECER para:
    'M_sell': ['C', 'F', 'J', 'K', 'L', 'N'], // A maioria dos outros setores
};

function getCnaeSection(cnaeCode: string): string | null {
    if (!cnaeCode) return null;
    const code = parseInt(cnaeCode.substring(0, 2), 10);
    if (code >= 1 && code <= 3) return 'A'; // Agricultura, Pecuária, Produção Florestal, Pesca e Aquicultura
    if (code >= 5 && code <= 9) return 'B'; // Indústrias Extrativas
    if (code >= 10 && code <= 33) return 'C'; // Indústrias de Transformação
    if (code === 35) return 'D'; // Eletricidade e Gás
    if (code >= 36 && code <= 39) return 'E'; // Água, Esgoto, Atividades de Gestão de Resíduos e Descontaminação
    if (code >= 41 && code <= 43) return 'F'; // Construção
    if (code >= 45 && code <= 47) return 'G'; // Comércio; Reparação de Veículos Automotores e Motocicletas
    if (code >= 49 && code <= 53) return 'H'; // Transporte, Armazenagem e Correio
    if (code >= 55 && code <= 56) return 'I'; // Alojamento e Alimentação
    if (code >= 58 && code <= 63) return 'J'; // Informação e Comunicação
    if (code >= 64 && code <= 66) return 'K'; // Atividades Financeiras, de Seguros e Serviços Relacionados
    if (code === 68) return 'L'; // Atividades Imobiliárias
    if (code >= 69 && code <= 75) return 'M'; // Atividades Profissionais, Científicas e Técnicas
    if (code >= 77 && code <= 82) return 'N'; // Atividades Administrativas e Serviços Complementares
    if (code === 84) return 'O'; // Administração Pública, Defesa e Seguridade Social
    if (code === 85) return 'P'; // Educação
    if (code >= 86 && code <= 88) return 'Q'; // Saúde Humana e Serviços Sociais
    if (code >= 90 && code <= 93) return 'R'; // Artes, Cultura, Esporte e Recreação
    if (code >= 94 && code <= 96) return 'S'; // Outras Atividades de Serviços
    if (code === 97) return 'T'; // Serviços Domésticos
    return null;
}

function getCompatibleCnaeSections(userCnaeSection: string, businessMode: 'buy' | 'sell'): string[] {
    if (businessMode === 'buy') {
        // Se quero comprar, busco por setores que FORNECEM o que preciso.
        // A lógica da matriz é "setor_vende para". Então invertemos a busca.
        const compatibleSections: string[] = [];
        for (const key in CONNECTION_MATRIX) {
            if (CONNECTION_MATRIX[key].includes(userCnaeSection)) {
                const supplierSection = key.split('_')[0];
                if (supplierSection) {
                    compatibleSections.push(supplierSection);
                }
            }
        }
        // Adiciona regra especial de TI
        if (CONNECTION_MATRIX['all_buy_J']) {
            compatibleSections.push(...CONNECTION_MATRIX['all_buy_J']);
        }
        return [...new Set(compatibleSections)]; // Remove duplicados
    } else { // 'sell'
        // Se quero vender, busco por setores para os quais meu setor FORNECE.
        const key = `${userCnaeSection}_sell`;
        return CONNECTION_MATRIX[key] || [];
    }
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
    const searchRadiusKm = userProfile.preferences?.searchRadiusKm || 50;
    const businessMode = userProfile.preferences?.businessMode || 'sell'; // Default to selling
    const limitResults = 5;

    const interactionsQuery = query(collection(db, 'interactions'), where('userId', '==', userId));
    const interactionsSnap = await getDocs(interactionsQuery);
    const excludedCompanyIds = interactionsSnap.docs.map(doc => (doc.data() as Interaction).companyId);
    excludedCompanyIds.push(userCompany.id);

    const userCnaeSection = getCnaeSection(userCompany.cnaePrincipal.code);
    if (!userCnaeSection) return [];
    
    const compatibleCnaeSections = getCompatibleCnaeSections(userCnaeSection, businessMode as 'buy' | 'sell');
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
