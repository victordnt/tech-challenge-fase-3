import type { Transaction } from "../../domain/entities/transaction";

export interface TransactionMemoryCache {
  get(userId: string): Transaction[] | null;
  set(userId: string, transactions: Transaction[]): void;
  remove(userId: string): void;
  clear(): void;
}

export class InMemoryTransactionCache implements TransactionMemoryCache {
  private readonly cache = new Map<string, Transaction[]>();

  get(userId: string): Transaction[] | null {
    if (!userId) return null;
    const items = this.cache.get(userId);
    return items ? [...items] : null;
  }

  set(userId: string, transactions: Transaction[]): void {
    if (!userId) return;
    this.cache.set(userId, [...transactions]);
  }

  remove(userId: string): void {
    if (!userId) return;
    this.cache.delete(userId);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const transactionMemoryCache: TransactionMemoryCache =
  new InMemoryTransactionCache();
