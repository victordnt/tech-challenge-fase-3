export type TransactionType = "income" | "expense";

export type TransactionCategory = string;

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  url: string;
  dataUri?: string;
  fileName: string;
  uploadedAt: string;
  storagePath?: string;
  contentType?: string;
  size?: number;
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
  categories: {
    category: TransactionCategory;
    total: number;
  }[];
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  period?: "week" | "month" | "year";
  search?: string;
  startDate?: string;
  endDate?: string;
}
