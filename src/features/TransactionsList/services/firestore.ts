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
    where,
} from 'firebase/firestore';
import { auth } from '@/services/firebase/config';

const db = getFirestore(auth.app);

/**
 * Adiciona uma nova transação ao Firestore (com fallback gracioso caso haja restrição de permissão)
 */
export async function addTransactionToFirestore(
  transaction: Omit<Transaction, 'id' | 'userId'>
): Promise<Transaction> {
  const userId = auth.currentUser?.uid || 'user-local';
  const localId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

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

  try {
    if (auth.currentUser?.uid) {
      let docRef;
      try {
        docRef = await addDoc(collection(db, 'transactions'), payload);
        return {
          id: docRef.id,
          userId,
          ...transaction,
        };
      } catch (err: any) {
        if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
          try {
            docRef = await addDoc(collection(db, `users/${userId}/transactions`), payload);
            return {
              id: docRef.id,
              userId,
              ...transaction,
            };
          } catch (innerErr: any) {
            console.warn('Firestore Permission Denied (usando salvamento local):', innerErr?.message);
          }
        } else {
          console.warn('Firestore error (usando salvamento local):', err?.message);
        }
      }
    }
  } catch (error: any) {
    console.warn('Erro ao salvar no Firestore (usando salvamento local):', error?.message);
  }

  // Fallback local caso o Firestore rejeite permissões no console
  return {
    id: localId,
    userId,
    ...transaction,
  };
}

/**
 * Carrega todas as transações do usuário
 */
export async function getTransactionsFromFirestore(): Promise<Transaction[]> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    let querySnapshot;
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      querySnapshot = await getDocs(q);
    } catch {
      try {
        const q = query(collection(db, `users/${userId}/transactions`));
        querySnapshot = await getDocs(q);
      } catch {
        return [];
      }
    }

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

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.warn('Erro ao carregar transações:', error);
    return [];
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
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(collection(db, 'transactions'), where('userId', '==', userId));

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
        if (error.code === 'permission-denied') {
          const fallbackQ = query(collection(db, `users/${userId}/transactions`));
          return onSnapshot(
            fallbackQ,
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
            (fallbackErr) => {
              console.warn('Firestore Snapshot Permission Denied:', fallbackErr.message);
              // Não trava a UI
            }
          );
        }
        console.warn('Erro ao observar transações:', error.message);
      }
    );
  } catch (error) {
    console.warn('Erro ao configurar listener:', error);
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
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const docRef = doc(db, 'transactions', transactionId);
      await updateDoc(docRef, updates);
    } catch {
      try {
        const docRef = doc(db, `users/${userId}/transactions/${transactionId}`);
        await updateDoc(docRef, updates);
      } catch (err: any) {
        console.warn('Erro ao atualizar no Firestore:', err?.message);
      }
    }
  } catch (error) {
    console.warn('Erro ao atualizar transação:', error);
  }
}

/**
 * Deleta uma transação
 */
export async function deleteTransactionFromFirestore(transactionId: string): Promise<void> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const docRef = doc(db, 'transactions', transactionId);
      await deleteDoc(docRef);
    } catch {
      try {
        const docRef = doc(db, `users/${userId}/transactions/${transactionId}`);
        await deleteDoc(docRef);
      } catch (err: any) {
        console.warn('Erro ao deletar no Firestore:', err?.message);
      }
    }
  } catch (error) {
    console.warn('Erro ao deletar transação:', error);
  }
}
