export const FIXED_CATEGORIES = [
    'Alimentação',
    'Restaurantes & Bares',
    'Moradia',
    'Transporte',
    'Entretenimento',
    'Salário & Rendimentos',
    'Serviços & Assinaturas',
    'Saúde & Bem-estar',
    'Outros',
] as const;

export type FixedCategory = (typeof FIXED_CATEGORIES)[number];
