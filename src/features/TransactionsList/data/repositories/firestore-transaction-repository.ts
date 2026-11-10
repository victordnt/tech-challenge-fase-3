import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/services/firebase/config";
import type { Receipt, Transaction } from "../../domain/entities/transaction";
import type {
  TransactionRepository,
  Unsubscribe,
} from "../../domain/repositories/transaction-repository";

function sanitizeReceipt(
  receipt: Receipt | null | undefined,
): Omit<Receipt, "url" | "dataUri"> | null {
  if (!receipt || !receipt.storagePath) return null;
  return {
    id: receipt.id,
    storagePath: receipt.storagePath,
    fileName: receipt.fileName,
    contentType: receipt.contentType || "image/jpeg",
    size: receipt.size ?? 0,
    uploadedAt: receipt.uploadedAt || new Date().toISOString(),
  };
}

export class FirestoreTransactionRepository implements TransactionRepository {
  constructor(private readonly firestore: Firestore = db) {}

  private mapDocument(
    docSnapshot: QueryDocumentSnapshot<DocumentData>,
    fallbackUserId: string,
  ): Transaction {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      userId: data.userId || fallbackUserId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      receipt: data.receipt || null,
    };
  }

  async create(
    userId: string,
    transaction: Omit<Transaction, "id" | "userId">,
  ): Promise<Transaction> {
    const payload = {
      userId,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      receipt: sanitizeReceipt(transaction.receipt),
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(this.firestore, "transactions"),
      payload,
    );
    return {
      id: docRef.id,
      userId,
      ...transaction,
      receipt: sanitizeReceipt(transaction.receipt)
        ? {
            ...sanitizeReceipt(transaction.receipt)!,
            url: "",
          }
        : null,
    };
  }

  async update(
    _userId: string,
    transactionId: string,
    updates: Partial<Transaction>,
  ): Promise<void> {
    const ref = doc(this.firestore, "transactions", transactionId);
    const payload: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if ("receipt" in updates) {
      payload.receipt = sanitizeReceipt(updates.receipt);
    }

    await updateDoc(ref, payload);
  }

  async delete(_userId: string, transactionId: string): Promise<void> {
    const ref = doc(this.firestore, "transactions", transactionId);
    await deleteDoc(ref);
  }

  observe(
    userId: string,
    pageSize: number,
    callback: (transactions: Transaction[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    try {
      if (!userId) {
        callback([]);
        return () => {};
      }

      const q = query(
        collection(this.firestore, "transactions"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(pageSize),
      );

      return onSnapshot(
        q,
        (querySnapshot) => {
          const transactions: Transaction[] = [];
          querySnapshot.forEach((docSnapshot) => {
            transactions.push(this.mapDocument(docSnapshot, userId));
          });
          callback(transactions);
        },
        (error) => {
          onError?.(error);
        },
      );
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error("Erro ao consultar transações."),
      );
      return () => {};
    }
  }
}
