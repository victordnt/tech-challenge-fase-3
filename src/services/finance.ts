import type { DashboardSummary, Transaction, TransactionFilters } from '@/types/finance';

export function calculateDashboardSummary(transactions: Transaction[]): DashboardSummary {
  const totalIncome = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const categories = transactions.reduce<Array<{ category: Transaction['category']; total: number }>>(
    (acc, item) => {
      const existing = acc.find((entry) => entry.category === item.category);

      if (existing) {
        existing.total += item.amount;
      } else {
        acc.push({ category: item.category, total: item.amount });
      }

      return acc;
    },
    [],
  );

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categories,
  };
}

export function filterTransactions(transactions: Transaction[], filters: TransactionFilters) {
  return transactions.filter((transaction) => {
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    if (filters.search) {
      const normalizedSearch = filters.search.toLowerCase();
      const searchableText = `${transaction.description} ${transaction.category}`.toLowerCase();

      if (!searchableText.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });
}
