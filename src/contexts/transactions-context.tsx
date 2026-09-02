import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { addTransactionToFirebase, subscribeToUserTransactions } from '@/services/firebase/transactions-service';
import type { Transaction, TransactionFilters } from '@/types/finance';

interface TransactionsContextValue {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    filters: TransactionFilters;
    setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
    addTransaction: (transaction: Transaction) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.uid) {
            setTransactions([]);
            setFilters({});
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = subscribeToUserTransactions(
            user.uid,
            (firebaseTransactions) => {
                setTransactions(firebaseTransactions);
                setLoading(false);
            },
            (error) => {
                console.error('Erro ao carregar transações:', error);
                setTransactions([]);
                setLoading(false);
            },
        );

        return unsubscribe;
    }, [user?.uid]);

    const addTransaction = async (transaction: Transaction) => {
        try {
            // Salvar no Firebase
            await addTransactionToFirebase(transaction);
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
