import { FieldValue } from 'firebase/firestore';

// --- Perfis e Autenticação ---

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  companyId?: string; // Referência ao ID da empresa que o usuário representa
  subscriptionTier: 'free' | 'professional';
  preferences?: {
    searchRadiusKm: number;
    businessMode: 'buy' | 'sell' | 'both'; // Modo de interesse principal
  };
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

// --- Dados das Empresas ---

export interface Company {
  id: string; // ID do documento
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnaePrincipal: {
    code: string;
    description: string;
  };
  cnaesSecundarios: {
    code: string;
    description: string;
  }[];
  bioInstitucional: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    pais: string;
  };
  latitude: number;
  longitude: number;
  geohash: string; // Para queries geoespaciais eficientes
  tagsOperacionais: string[];
  fotos: string[]; // URLs das imagens
  ownerId: string; // UID do usuário que criou a empresa
  createdAt: FieldValue;
  updatedAt: FieldValue;
}


// --- Conexões e Interações ---

export interface Connection {
  id: string; // ID do documento
  requesterCompanyId: string;
  targetCompanyId: string;
  targetCompany?: Company; // Embed company data for recommendations
  status: 'requested' | 'connected' | 'dismissed';
  compatibilityScore?: number; // Opcional, pode ser calculado pela IA
  compatibilityReason?: string; // Opcional, justificativa da IA
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface Interaction {
  id: string; // ID do documento
  userId: string; // UID do usuário que realizou a ação
  companyId: string; // ID da empresa que sofreu a ação (target)
  action: 'connection_request' | 'dismiss';
  timestamp: FieldValue;
}


// --- Tipos existentes (mantidos para compatibilidade) ---

/**
 * Perfil da empresa como retornado pela BrasilAPI.
 */
export type CompanyProfile = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal_descricao: string;
  cnae_fiscal: number;
  uf: string;
  municipio: string;
  bairro: string;
  logradouro: string;
  numero: string;
  cep: string;
  cnaes_secundarios: {
    codigo: number;
    descricao: string;
  }[];
  ddd_telefone_1: string;
  descricao_porte: string;
  natureza_juridica: string;
};

/**
 * Estrutura para uma recomendação de parceria (pode ser mock ou gerado pela IA).
 */
export type PartnershipRecommendation = {
  company: Company;
  synergy_score: number;
  key_factors: string[];
};
