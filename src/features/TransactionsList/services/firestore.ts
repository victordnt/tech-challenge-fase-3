import type { Transaction } from '@/features/TransactionsList/types/finance';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    onSnapshot,
    query,
    Timestamp,
    Unsubscribe,
    updateDoc,
} from 'firebase/firestore';
import { auth } from '@/services/firebase/config';

const db = getFirestore(auth.app);

/**
 * Adiciona uma nova transação ao Firestore
 */
export async function addTransactionToFirestore(
  transaction: Omit<Transaction, 'id' | 'userId'>
): Promise<Transaction> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const docRef = await addDoc(collection(db, `users/${userId}/transactions`), {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      receipt: transaction.receipt || null,
      createdAt: Timestamp.now(),
    });

    return {
      id: docRef.id,
      userId,
      ...transaction,
    };
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    throw error;
  }
}

/**
 * Carrega todas as transações do usuário
 */
export async function getTransactionsFromFirestore(): Promise<Transaction[]> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const q = query(collection(db, `users/${userId}/transactions`));
    const querySnapshot = await getDocs(q);

    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        userId,
        type: doc.data().type,
        amount: doc.data().amount,
        category: doc.data().category,
        description: doc.data().description,
        date: doc.data().date,
        receipt: doc.data().receipt || null,
      });
    });

    // Ordenar por data decrescente (mais recentes primeiro)
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    throw error;
  }
}

/**
 * Observa transações em tempo real
 */
export function onTransactionsSnapshot(
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const q = query(collection(db, `users/${userId}/transactions`));

    return onSnapshot(
      q,
      (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactions.push({
            id: doc.id,
            userId,
            type: doc.data().type,
            amount: doc.data().amount,
            category: doc.data().category,
            description: doc.data().description,
            date: doc.data().date,
            receipt: doc.data().receipt || null,
          });
        });
        // Ordenar por data decrescente
        transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(transactions);
      },
      (error) => {
        console.error('Erro ao observar transações:', error);
        onError?.(error as Error);
      }
    );
  } catch (error) {
    console.error('Erro ao configurar listener:', error);
    onError?.(error as Error);
    return () => {}; // retorna unsubscribe vazio
  }
}

/**
 * Atualiza uma transação existente
 */
export async function updateTransactionInFirestore(
  transactionId: string,
  updates: Partial<Transaction>
): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const docRef = doc(db, `users/${userId}/transactions/${transactionId}`);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    throw error;
  }
}

/**
 * Deleta uma transação
 */
export async function deleteTransactionFromFirestore(transactionId: string): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Usuário não autenticado');

    const docRef = doc(db, `users/${userId}/transactions/${transactionId}`);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    throw error;
  }
}
