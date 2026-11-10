import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from "firebase/storage";
import { storage as defaultStorage } from "@/services/firebase/config";
import type { Receipt } from "../../domain/entities/transaction";

export interface ReceiptFileMetadata {
  fileName: string;
  contentType: string;
  size?: number;
}

export interface ReceiptStorageService {
  uploadReceipt(
    userId: string,
    receiptId: string,
    fileUri: string,
    metadata?: Partial<ReceiptFileMetadata>,
  ): Promise<Receipt>;
  getReceiptUrl(storagePath: string): Promise<string>;
  deleteReceipt(storagePath: string): Promise<void>;
}

const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class FirebaseReceiptStorage implements ReceiptStorageService {
  constructor(private readonly storage: FirebaseStorage = defaultStorage) {}

  private extractExtension(fileName?: string, contentType?: string): string {
    if (fileName && fileName.includes(".")) {
      return fileName.split(".").pop()?.toLowerCase() || "jpg";
    }
    if (contentType) {
      return contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    }
    return "jpg";
  }

  async uploadReceipt(
    userId: string,
    receiptId: string,
    fileUri: string,
    metadata?: Partial<ReceiptFileMetadata>,
  ): Promise<Receipt> {
    if (!userId) throw new Error("Usuário não autenticado para envio do recibo.");
    if (!receiptId) throw new Error("ID do recibo não fornecido.");
    if (!fileUri) throw new Error("URI do recibo não fornecida.");

    const response = await fetch(fileUri);
    const blob = await response.blob();

    const contentType =
      metadata?.contentType ||
      blob.type ||
      "image/jpeg";

    if (!contentType.startsWith("image/")) {
      throw new Error("O anexo precisa ser uma imagem válida.");
    }

    const size = metadata?.size ?? blob.size;
    if (size > MAX_RECEIPT_SIZE_BYTES) {
      throw new Error("A imagem é grande demais. O limite máximo é 5 MB.");
    }

    const ext = this.extractExtension(metadata?.fileName, contentType);
    const fileName = metadata?.fileName || `recibo.${ext}`;
    const storagePath = `receipts/${userId}/${receiptId}/${fileName}`;

    const storageRef = ref(this.storage, storagePath);
    await uploadBytes(storageRef, blob, { contentType });

    return {
      id: receiptId,
      storagePath,
      fileName,
      contentType,
      size,
      uploadedAt: new Date().toISOString(),
      url: "", // Not stored in Firestore; resolved on demand
    };
  }

  async getReceiptUrl(storagePath: string): Promise<string> {
    if (!storagePath) return "";
    const storageRef = ref(this.storage, storagePath);
    return getDownloadURL(storageRef);
  }

  async deleteReceipt(storagePath: string): Promise<void> {
    if (!storagePath) return;
    try {
      const storageRef = ref(this.storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      // If object already does not exist, consider it deleted
      const isNotFound =
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "storage/object-not-found";
      if (!isNotFound) {
        throw error;
      }
    }
  }
}

export const firebaseReceiptStorage = new FirebaseReceiptStorage();
