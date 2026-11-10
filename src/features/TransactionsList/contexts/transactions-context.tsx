import { notifyTransactionSaved } from "@/services/notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

import { useAuth } from "@/features/UserProfile/contexts/auth-context";
import { transactionMemoryCache } from "../data/cache/transaction-memory-cache";
import { firebaseReceiptStorage } from "../data/repositories/firebase-receipt-storage";
import {
  defaultTransactionsContainer,
  type TransactionsContainer,
} from "../di/transactions-container";
import type {
  Transaction,
  TransactionFilters,
} from "../domain/entities/transaction";
import {
  initialTransactionsState,
  transactionsReducer,
} from "./transactions-reducer";

export interface TransactionsStateContextValue {
  transactions: Transaction[];
  filters: TransactionFilters;
  currentPage: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  queryLimit: number;
}

export interface TransactionsActionsContextValue {
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "userId">,
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadMore: () => void;
  retry: () => void;
}

export interface CombinedTransactionsContextValue
  extends TransactionsStateContextValue,
    TransactionsActionsContextValue {}

const TransactionsStateContext = createContext<
  TransactionsStateContextValue | undefined
>(undefined);

const TransactionsActionsContext = createContext<
  TransactionsActionsContextValue | undefined
>(undefined);

interface TransactionsProviderProps {
  children: React.ReactNode;
  container?: TransactionsContainer;
}

export function TransactionsProvider({
  children,
  container = defaultTransactionsContainer,
}: TransactionsProviderProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(
    transactionsReducer,
    initialTransactionsState,
  );

  // Observa sessão e subscreve em tempo real
  useEffect(() => {
    if (!user) {
      dispatch({ type: "RESET_SESSION" });
      return;
    }

    const userId = user.uid;
    // Hidratação a partir do cache em memória (evita flash de loading)
    const cached = transactionMemoryCache.get(userId);
    dispatch({
      type: "INIT_USER",
      userId,
      cachedTransactions: cached,
    });

    const unsubscribe = container.observeTransactions.execute(
      userId,
      state.queryLimit,
      (loadedTransactions) => {
        transactionMemoryCache.set(userId, loadedTransactions);
        dispatch({
          type: "SNAPSHOT_RECEIVED",
          userId,
          transactions: loadedTransactions,
          queryLimit: state.queryLimit,
        });
      },
      (err) => {
        dispatch({
          type: "SNAPSHOT_ERROR",
          userId,
          error: err.message.includes("requires an index")
            ? "As transações aguardam a criação do índice no Firebase. Tente novamente após a ativação do índice."
            : err.message,
        });
      },
    );

    return () => {
      unsubscribe();
    };
  }, [user, state.queryLimit, container]);

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "userId">) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const userId = user.uid;
      const optimisticId = `temp-${Date.now()}`;
      const optimisticTx: Transaction = {
        id: optimisticId,
        userId,
        ...transaction,
      };

      dispatch({ type: "OPTIMISTIC_ADD", transaction: optimisticTx });

      try {
        const created = await container.createTransaction.execute(
          userId,
          transaction,
        );
        dispatch({ type: "MUTATION_SUCCESS" });
        void notifyTransactionSaved(userId).catch(() => undefined);
        transactionMemoryCache.set(userId, [created, ...state.transactions]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao adicionar transação";
        dispatch({ type: "MUTATION_ROLLBACK", error: msg });
        throw err;
      }
    },
    [user, container, state.transactions],
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const userId = user.uid;

      dispatch({ type: "OPTIMISTIC_UPDATE", id, updates });

      try {
        await container.updateTransaction.execute(userId, id, updates);
        dispatch({ type: "MUTATION_SUCCESS" });
        const updatedList = state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        );
        transactionMemoryCache.set(userId, updatedList);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao atualizar transação";
        dispatch({ type: "MUTATION_ROLLBACK", error: msg });
        throw err;
      }
    },
    [user, container, state.transactions],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const userId = user.uid;
      const targetTx = state.transactions.find((t) => t.id === id);

      dispatch({ type: "OPTIMISTIC_DELETE", id });

      try {
        await container.deleteTransaction.execute(userId, id);
        // Excluir recibo associado no Firebase Storage se existir
        if (targetTx?.receipt?.storagePath) {
          await firebaseReceiptStorage
            .deleteReceipt(targetTx.receipt.storagePath)
            .catch(() => undefined);
        }
        dispatch({ type: "MUTATION_SUCCESS" });
        const filteredList = state.transactions.filter((t) => t.id !== id);
        transactionMemoryCache.set(userId, filteredList);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao deletar transação";
        dispatch({ type: "MUTATION_ROLLBACK", error: msg });
        throw err;
      }
    },
    [user, container, state.transactions],
  );

  const setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>> =
    useCallback((action) => {
      dispatch({ type: "SET_FILTERS", filters: action });
    }, []);

  const setCurrentPage: React.Dispatch<React.SetStateAction<number>> =
    useCallback((action) => {
      dispatch({ type: "SET_CURRENT_PAGE", page: action });
    }, []);

  const setTransactions: React.Dispatch<
    React.SetStateAction<Transaction[]>
  > = useCallback(() => {
    // Camada de compatibilidade
  }, []);

  const loadMore = useCallback(() => {
    dispatch({ type: "INCREMENT_QUERY_LIMIT", delta: 20 });
  }, []);

  const retry = useCallback(() => {
    if (user) {
      dispatch({ type: "START_LOADING" });
    }
  }, [user]);

  const stateValue: TransactionsStateContextValue = {
    transactions: state.transactions,
    filters: state.filters,
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    queryLimit: state.queryLimit,
  };

  const actionsValue: TransactionsActionsContextValue = {
    setFilters,
    setCurrentPage,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadMore,
    retry,
  };

  return (
    <TransactionsStateContext.Provider value={stateValue}>
      <TransactionsActionsContext.Provider value={actionsValue}>
        {children}
      </TransactionsActionsContext.Provider>
    </TransactionsStateContext.Provider>
  );
}

export function useTransactionsState(): TransactionsStateContextValue {
  const context = useContext(TransactionsStateContext);
  if (!context) {
    throw new Error(
      "useTransactionsState must be used within a TransactionsProvider",
    );
  }
  return context;
}

export function useTransactionsActions(): TransactionsActionsContextValue {
  const context = useContext(TransactionsActionsContext);
  if (!context) {
    throw new Error(
      "useTransactionsActions must be used within a TransactionsProvider",
    );
  }
  return context;
}

export function useTransactions(): CombinedTransactionsContextValue {
  const state = useTransactionsState();
  const actions = useTransactionsActions();
  return { ...state, ...actions };
}
