import type { TransactionRepository } from "../repositories/transaction-repository";

export class DeleteTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(userId: string, transactionId: string): Promise<void> {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }
    if (!transactionId) {
      throw new Error("ID da transação não fornecido.");
    }
    return this.repository.delete(userId, transactionId);
  }
}
