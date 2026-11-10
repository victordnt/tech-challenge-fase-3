import type { Transaction } from "../entities/transaction";
import type { TransactionRepository } from "../repositories/transaction-repository";

export class CreateTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(
    userId: string,
    transaction: Omit<Transaction, "id" | "userId">,
  ): Promise<Transaction> {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }
    return this.repository.create(userId, transaction);
  }
}
