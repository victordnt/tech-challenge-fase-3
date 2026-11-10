import type {
  Transaction,
  TransactionFilters,
} from "../domain/entities/transaction";

export interface TransactionsState {
  transactions: Transaction[];
  filters: TransactionFilters;
  currentPage: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  queryLimit: number;
  activeUserId: string | null;
  backupTransactions: Transaction[] | null;
}

export const initialTransactionsState: TransactionsState = {
  transactions: [],
  filters: {},
  currentPage: 1,
  itemsPerPage: 10,
  loading: true,
  error: null,
  hasMore: true,
  queryLimit: 20,
  activeUserId: null,
  backupTransactions: null,
};

export type TransactionsAction =
  | {
      type: "INIT_USER";
      userId: string;
      cachedTransactions: Transaction[] | null;
    }
  | { type: "START_LOADING" }
  | {
      type: "SNAPSHOT_RECEIVED";
      userId: string;
      transactions: Transaction[];
      queryLimit: number;
    }
  | { type: "SNAPSHOT_ERROR"; userId: string; error: string }
  | {
      type: "SET_FILTERS";
      filters:
        | TransactionFilters
        | ((prev: TransactionFilters) => TransactionFilters);
    }
  | {
      type: "SET_CURRENT_PAGE";
      page: number | ((prev: number) => number);
    }
  | { type: "INCREMENT_QUERY_LIMIT"; delta: number }
  | { type: "OPTIMISTIC_ADD"; transaction: Transaction }
  | {
      type: "OPTIMISTIC_UPDATE";
      id: string;
      updates: Partial<Transaction>;
    }
  | { type: "OPTIMISTIC_DELETE"; id: string }
  | { type: "MUTATION_SUCCESS" }
  | { type: "MUTATION_ROLLBACK"; error: string }
  | { type: "RESET_SESSION" };

export function transactionsReducer(
  state: TransactionsState,
  action: TransactionsAction,
): TransactionsState {
  switch (action.type) {
    case "INIT_USER": {
      const hasCache =
        action.cachedTransactions !== null &&
        action.cachedTransactions.length > 0;
      return {
        ...state,
        activeUserId: action.userId,
        transactions: action.cachedTransactions || [],
        loading: !hasCache,
        error: null,
        queryLimit: 20,
        hasMore: true,
        backupTransactions: null,
      };
    }

    case "START_LOADING":
      return {
        ...state,
        loading: state.transactions.length === 0,
        error: null,
      };

    case "SNAPSHOT_RECEIVED": {
      if (action.userId !== state.activeUserId) {
        return state;
      }
      return {
        ...state,
        transactions: action.transactions,
        hasMore: action.transactions.length >= action.queryLimit,
        loading: false,
        error: null,
        backupTransactions: null,
      };
    }

    case "SNAPSHOT_ERROR": {
      if (action.userId !== state.activeUserId) {
        return state;
      }
      return {
        ...state,
        hasMore: false,
        loading: false,
        error: action.error,
      };
    }

    case "SET_FILTERS": {
      const nextFilters =
        typeof action.filters === "function"
          ? action.filters(state.filters)
          : action.filters;
      return {
        ...state,
        filters: nextFilters,
      };
    }

    case "SET_CURRENT_PAGE": {
      const nextPage =
        typeof action.page === "function"
          ? action.page(state.currentPage)
          : action.page;
      return {
        ...state,
        currentPage: nextPage,
      };
    }

    case "INCREMENT_QUERY_LIMIT":
      return {
        ...state,
        queryLimit: state.queryLimit + action.delta,
      };

    case "OPTIMISTIC_ADD": {
      const alreadyExists = state.transactions.some(
        (t) => t.id === action.transaction.id,
      );
      if (alreadyExists) return state;

      return {
        ...state,
        backupTransactions: state.backupTransactions ?? state.transactions,
        transactions: [action.transaction, ...state.transactions],
        error: null,
      };
    }

    case "OPTIMISTIC_UPDATE": {
      return {
        ...state,
        backupTransactions: state.backupTransactions ?? state.transactions,
        transactions: state.transactions.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item,
        ),
        error: null,
      };
    }

    case "OPTIMISTIC_DELETE": {
      return {
        ...state,
        backupTransactions: state.backupTransactions ?? state.transactions,
        transactions: state.transactions.filter(
          (item) => item.id !== action.id,
        ),
        error: null,
      };
    }

    case "MUTATION_SUCCESS":
      return {
        ...state,
        backupTransactions: null,
        error: null,
      };

    case "MUTATION_ROLLBACK":
      return {
        ...state,
        transactions: state.backupTransactions ?? state.transactions,
        backupTransactions: null,
        error: action.error,
      };

    case "RESET_SESSION":
      return {
        ...initialTransactionsState,
        loading: false,
      };

    default:
      return state;
  }
}
