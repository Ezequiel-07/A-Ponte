export type CompanyProfile = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal_descricao: string;
  uf: string;
  municipio: string;
  ddd_telefone_1: string;
  descricao_porte: string;
  natureza_juridica: string;
};

export type PartnershipRecommendation = {
  company: CompanyProfile;
  synergy_score: number;
  key_factors: string[];
};
