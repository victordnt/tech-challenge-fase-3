import type { Transaction } from '@/types/finance';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './config';

export async function addTransactionToFirebase(transaction: Transaction): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transaction,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar transação no Firebase:', error);
    throw error;
  }
}

export async function getTransactionsByUser(userId: string): Promise<Transaction[]> {
  try {
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({
        ...doc.data(),
        id: doc.id,
      } as Transaction);
    });
    
    // Ordenar por data decrescente
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao buscar transações do Firebase:', error);
    throw error;
  }
}

export async function updateTransactionInFirebase(
  transactionId: string,
  updates: Partial<Transaction>,
): Promise<void> {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar transação no Firebase:', error);
    throw error;
  }
}

export async function deleteTransactionFromFirebase(transactionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
  } catch (error) {
    console.error('Erro ao deletar transação do Firebase:', error);
    throw error;
  }
}
