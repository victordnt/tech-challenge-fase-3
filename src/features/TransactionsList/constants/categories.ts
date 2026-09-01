export const INCOME_CATEGORIES = [
    'Salário',
    'Freelance & Projetos',
    'Investimentos & Dividendos',
    'Vendas & Negócios',
    'Presentes & Reembolsos',
    'Outras Entradas',
] as const;

export const EXPENSE_CATEGORIES = [
    'Alimentação & Supermercado',
    'Restaurantes & Bares',
    'Moradia & Contas',
    'Transporte & Combustível',
    'Entretenimento & Lazer',
    'Serviços & Assinaturas',
    'Saúde & Cuidados',
    'Educação',
    'Outras Saídas',
] as const;

export const FIXED_CATEGORIES = [
    ...INCOME_CATEGORIES,
    ...EXPENSE_CATEGORIES,
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type FixedCategory = (typeof FIXED_CATEGORIES)[number];
