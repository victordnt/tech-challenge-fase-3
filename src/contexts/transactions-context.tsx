import React, { createContext, useContext, useMemo, useState } from 'react';

import type { Transaction, TransactionFilters } from '@/types/finance';
import { getTransactionsByUser, addTransactionToFirebase } from '@/services/firebase/transactions-service';

interface TransactionsContextValue {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    filters: TransactionFilters;
    setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
    addTransaction: (transaction: Transaction) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
    loadUserTransactions: (userId: string) => Promise<void>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [loading, setLoading] = useState(false);

    const loadUserTransactions = async (userId: string) => {
        setLoading(true);
        try {
            const firebaseTransactions = await getTransactionsByUser(userId);
            setTransactions(firebaseTransactions);
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transaction: Transaction) => {
        try {
            // Salvar no Firebase
            const newId = await addTransactionToFirebase(transaction);
            // Atualizar o estado local com o ID do Firebase
            const updatedTransaction = { ...transaction, id: newId };
            setTransactions((current) => [updatedTransaction, ...current]);
        } catch (error) {
            console.error('Erro ao adicionar transação:', error);
            throw error;
        }
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
            loadUserTransactions,
            loading,
            setLoading,
        }),
        [transactions, filters, loading],
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
