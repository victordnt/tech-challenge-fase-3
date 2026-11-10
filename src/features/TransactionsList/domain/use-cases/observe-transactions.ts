import type { Transaction } from "../entities/transaction";
import type {
  TransactionRepository,
  Unsubscribe,
} from "../repositories/transaction-repository";

export class ObserveTransactionsUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  execute(
    userId: string,
    pageSize: number,
    callback: (transactions: Transaction[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    if (!userId) {
      callback([]);
      return () => {};
    }
    return this.repository.observe(userId, pageSize, callback, onError);
  }
}
