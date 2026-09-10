import type { Transaction } from '@/features/TransactionsList/types/finance';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getFirestore,
    limit,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    Unsubscribe,
    updateDoc,
    where,
} from 'firebase/firestore';
import { auth } from '@/services/firebase/config';

const db = getFirestore(auth.app);

/**
 * Adiciona uma nova transação ao Firestore.
 */
export async function addTransactionToFirestore(
  transaction: Omit<Transaction, 'id' | 'userId'>
): Promise<Transaction> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Usuário não autenticado.');

  const payload = {
    userId,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    receipt: transaction.receipt || null,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'transactions'), payload);
  return {
    id: docRef.id,
    userId,
    ...transaction,
  };
}

/**
 * Observa transações em tempo real
 */
export function onTransactionsSnapshot(
  pageSize: number,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(pageSize),
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactions.push({
            id: doc.id,
            userId: doc.data().userId || userId,
            type: doc.data().type,
            amount: doc.data().amount,
            category: doc.data().category,
            description: doc.data().description,
            date: doc.data().date,
            receipt: doc.data().receipt || null,
          });
        });
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(transactions);
      },
      (error) => {
        onError?.(error);
      }
    );
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error('Erro ao consultar transações.'));
    return () => {};
  }
}

/**
 * Atualiza uma transação existente
 */
export async function updateTransactionInFirestore(
  transactionId: string,
  updates: Partial<Transaction>
): Promise<void> {
  if (!auth.currentUser?.uid) throw new Error('Usuário não autenticado.');
  await updateDoc(doc(db, 'transactions', transactionId), { ...updates, updatedAt: Timestamp.now() });
}

/**
 * Deleta uma transação
 */
export async function deleteTransactionFromFirestore(transactionId: string): Promise<void> {
  if (!auth.currentUser?.uid) throw new Error('Usuário não autenticado.');
  await deleteDoc(doc(db, 'transactions', transactionId));
}
