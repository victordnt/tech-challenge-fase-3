import { FirestoreTransactionRepository } from "../data/repositories/firestore-transaction-repository";
import type { TransactionRepository } from "../domain/repositories/transaction-repository";
import { CreateTransactionUseCase } from "../domain/use-cases/create-transaction";
import { DeleteTransactionUseCase } from "../domain/use-cases/delete-transaction";
import { ObserveTransactionsUseCase } from "../domain/use-cases/observe-transactions";
import { UpdateTransactionUseCase } from "../domain/use-cases/update-transaction";

export interface TransactionsContainer {
  repository: TransactionRepository;
  observeTransactions: ObserveTransactionsUseCase;
  createTransaction: CreateTransactionUseCase;
  updateTransaction: UpdateTransactionUseCase;
  deleteTransaction: DeleteTransactionUseCase;
}

export function createTransactionsContainer(
  customRepository?: TransactionRepository,
): TransactionsContainer {
  const repository = customRepository || new FirestoreTransactionRepository();

  return {
    repository,
    observeTransactions: new ObserveTransactionsUseCase(repository),
    createTransaction: new CreateTransactionUseCase(repository),
    updateTransaction: new UpdateTransactionUseCase(repository),
    deleteTransaction: new DeleteTransactionUseCase(repository),
  };
}

export const defaultTransactionsContainer = createTransactionsContainer();
