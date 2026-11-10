import type { Transaction } from "../entities/transaction";
import type { TransactionRepository } from "../repositories/transaction-repository";

export class UpdateTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(
    userId: string,
    transactionId: string,
    updates: Partial<Transaction>,
  ): Promise<void> {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }
    if (!transactionId) {
      throw new Error("ID da transação não fornecido.");
    }
    return this.repository.update(userId, transactionId, updates);
  }
}
