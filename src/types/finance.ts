export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Salary'
  | 'Food'
  | 'Transport'
  | 'Utilities'
  | 'Health'
  | 'Entertainment'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  receipt?: Receipt | null;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categories: Array<{
    category: TransactionCategory;
    total: number;
  }>;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  period?: 'week' | 'month' | 'year';
  search?: string;
}
