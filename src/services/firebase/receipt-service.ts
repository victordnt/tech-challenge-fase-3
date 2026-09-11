import type { Receipt } from "@/features/TransactionsList/types/finance";

const extensionFromType = (contentType: string) =>
  contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";

const MAX_RECEIPT_DATA_URI_LENGTH = 700_000;

export function createReceipt(dataUri: string, receiptId: string): Receipt {
  const match = dataUri.match(/^data:(image\/[\w.+-]+);base64,/);
  if (!match) throw new Error("O anexo precisa ser uma imagem válida.");
  if (dataUri.length > MAX_RECEIPT_DATA_URI_LENGTH) {
    throw new Error("A imagem é grande demais para salvar no Firestore.");
  }

  const contentType = match[1];
  const fileName = `recibo.${extensionFromType(contentType)}`;
  const base64 = dataUri.slice(match[0].length);
  const size = Math.floor((base64.length * 3) / 4);

  return {
    id: receiptId,
    url: dataUri,
    fileName,
    contentType,
    size,
    uploadedAt: new Date().toISOString(),
  };
}
