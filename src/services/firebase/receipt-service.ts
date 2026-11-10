import type { Receipt } from "@/features/TransactionsList/types/finance";
import { firebaseReceiptStorage } from "@/features/TransactionsList/data/repositories/firebase-receipt-storage";

export async function uploadReceiptFile(
  userId: string,
  receiptId: string,
  fileUri: string,
  fileName?: string,
): Promise<Receipt> {
  return firebaseReceiptStorage.uploadReceipt(userId, receiptId, fileUri, {
    fileName,
  });
}

export async function resolveReceiptUrl(storagePath: string): Promise<string> {
  return firebaseReceiptStorage.getReceiptUrl(storagePath);
}

export async function removeReceiptFile(storagePath: string): Promise<void> {
  return firebaseReceiptStorage.deleteReceipt(storagePath);
}

// Deprecated helper kept for backwards compatibility if needed
export function createReceipt(dataUri: string, receiptId: string): Receipt {
  return {
    id: receiptId,
    url: "",
    fileName: "recibo.jpg",
    contentType: "image/jpeg",
    uploadedAt: new Date().toISOString(),
  };
}
