import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
    addTransactionToFirestore,
    deleteTransactionFromFirestore,
    onTransactionsSnapshot,
    updateTransactionInFirestore,
} from '@/features/TransactionsList/services/firestore';
import type { Transaction, TransactionFilters } from '@/features/TransactionsList/types/finance';
import { useAuth } from '@/features/UserProfile/contexts/auth-context';

interface TransactionsContextValue {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    filters: TransactionFilters;
    setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    itemsPerPage: number;
    loading: boolean;
    error: string | null;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const itemsPerPage = 10;

    // Carregar transações ao autenticar
    useEffect(() => {
        if (!user) {
            // Limpar estado quando usuário fizer logout
            const timer = setTimeout(() => {
                setTransactions([]);
                setError(null);
            }, 0);
            return () => clearTimeout(timer);
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);

        // Usar listener em tempo real
        const unsubscribe = onTransactionsSnapshot(
            (loadedTransactions) => {
                setTransactions(loadedTransactions);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
        try {
            setError(null);
            const created = await addTransactionToFirestore(transaction);
            setTransactions((prev) => {
                if (prev.some((t) => t.id === created.id)) return prev;
                return [created, ...prev];
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar transação';
            setError(errorMessage);
            throw err;
        }
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        try {
            setError(null);
            setTransactions((prev) =>
                prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
            );
            await updateTransactionInFirestore(id, updates);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar transação';
            setError(errorMessage);
            throw err;
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            setError(null);
            setTransactions((prev) => prev.filter((item) => item.id !== id));
            await deleteTransactionFromFirestore(id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar transação';
            setError(errorMessage);
            throw err;
        }
    };

    const value = useMemo(
        () => ({
            transactions,
            setTransactions,
            filters,
            setFilters,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            currentPage,
            setCurrentPage,
            itemsPerPage,
            loading,
            error,
        }),
        [transactions, filters, currentPage, loading, error]
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
