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

export function calculateDashboardSummary(
  transactions: Transaction[],
): DashboardSummary {
  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const categories = transactions.reduce<
    { category: Transaction["category"]; total: number }[]
  >((acc, item) => {
    const existing = acc.find((entry) => entry.category === item.category);

    if (existing) {
      existing.total += item.amount;
    } else {
      acc.push({ category: item.category, total: item.amount });
    }

    return acc;
  }, []);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categories,
  };
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  return transactions.filter((transaction) => {
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    if (filters.search) {
      const normalizedSearch = filters.search.toLowerCase();
      const searchableText =
        `${transaction.description} ${transaction.category}`.toLowerCase();

      if (!searchableText.includes(normalizedSearch)) {
        return false;
      }
    }

    const transactionDay = transaction.date.slice(0, 10);
    if (filters.startDate && transactionDay < filters.startDate) return false;
    if (filters.endDate && transactionDay > filters.endDate) return false;

    return true;
  });
}
