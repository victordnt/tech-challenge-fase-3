import type { Transaction } from "../entities/transaction";

export type Unsubscribe = () => void;

export interface TransactionRepository {
  create(
    userId: string,
    transaction: Omit<Transaction, "id" | "userId">,
  ): Promise<Transaction>;
  update(
    userId: string,
    transactionId: string,
    updates: Partial<Transaction>,
  ): Promise<void>;
  delete(userId: string, transactionId: string): Promise<void>;
  observe(
    userId: string,
    pageSize: number,
    callback: (transactions: Transaction[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe;
}
