import React, { createContext, useContext, useMemo, useState } from 'react';

import type { Transaction, TransactionFilters } from '@/types/finance';

interface TransactionsContextValue {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    filters: TransactionFilters;
    setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

const initialTransactions: Transaction[] = [
    {
        id: 'tx-1',
        userId: 'user-1',
        type: 'income',
        amount: 3200,
        category: 'Salary',
        description: 'Salary payment',
        date: '2026-07-01',
    },
    {
        id: 'tx-2',
        userId: 'user-1',
        type: 'expense',
        amount: 180,
        category: 'Food',
        description: 'Groceries',
        date: '2026-07-04',
    },
];

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [filters, setFilters] = useState<TransactionFilters>({});

    const addTransaction = (transaction: Transaction) => {
        setTransactions((current) => [transaction, ...current]);
    };

    const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
        setTransactions((current) =>
            current.map((item) => (item.id === id ? { ...item, ...transaction } : item)),
        );
    };

    const value = useMemo(
        () => ({
            transactions,
            setTransactions,
            filters,
            setFilters,
            addTransaction,
            updateTransaction,
        }),
        [transactions, filters],
    );

    return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
    const context = useContext(TransactionsContext);

    if (!context) {
        throw new Error('useTransactions must be used within a TransactionsProvider');
    }

    return context;
}
