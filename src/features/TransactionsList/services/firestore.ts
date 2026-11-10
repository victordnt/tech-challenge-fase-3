import { auth } from "@/services/firebase/config";
import { defaultTransactionsContainer } from "../di/transactions-container";
import type { Transaction } from "../types/finance";

export async function addTransactionToFirestore(
  transaction: Omit<Transaction, "id" | "userId">,
): Promise<Transaction> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado.");
  return defaultTransactionsContainer.createTransaction.execute(
    userId,
    transaction,
  );
}

export function onTransactionsSnapshot(
  pageSize: number,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void,
) {
  const userId = auth.currentUser?.uid || "";
  return defaultTransactionsContainer.observeTransactions.execute(
    userId,
    pageSize,
    callback,
    onError,
  );
}

export async function updateTransactionInFirestore(
  transactionId: string,
  updates: Partial<Transaction>,
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado.");
  return defaultTransactionsContainer.updateTransaction.execute(
    userId,
    transactionId,
    updates,
  );
}

export async function deleteTransactionFromFirestore(
  transactionId: string,
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado.");
  return defaultTransactionsContainer.deleteTransaction.execute(
    userId,
    transactionId,
  );
}
