import type { Receipt } from '@/features/TransactionsList/types/finance';
import { storage } from '@/services/firebase/config';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const extensionFromType = (contentType?: string) => contentType?.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';

export async function uploadReceipt(
  userId: string,
  localUri: string,
  receiptId: string,
  fileName?: string,
  contentType?: string,
): Promise<Receipt> {
  const response = await fetch(localUri);
  if (!response.ok) throw new Error('Não foi possível ler o anexo selecionado.');
  const blob = await response.blob();
  const resolvedType = contentType || blob.type || 'image/jpeg';
  const resolvedName = fileName || `recibo.${extensionFromType(resolvedType)}`;
  const storagePath = `receipts/${userId}/${receiptId}/${resolvedName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob, { contentType: resolvedType });
  const url = await getDownloadURL(storageRef);

  return {
    id: receiptId,
    url,
    storagePath,
    fileName: resolvedName,
    contentType: resolvedType,
    size: blob.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function deleteReceipt(storagePath?: string): Promise<void> {
  if (!storagePath) return;
  await deleteObject(ref(storage, storagePath));
}
