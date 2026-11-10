import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface ReactNativeAsyncStorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const CHUNK_SIZE = 1800;

/**
 * Adaptador de persistência segura para Firebase Auth no React Native (Android / iOS).
 * Utiliza o SecureStore (Keychain no iOS e EncryptedSharedPreferences / Keystore no Android).
 * Não faz fallback para AsyncStorage não protegido e nunca registra tokens em logs.
 */
export const secureAuthStorage: ReactNativeAsyncStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return null;
    }

    try {
      const chunksCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunksCountStr) {
        const count = parseInt(chunksCountStr, 10);
        if (Number.isFinite(count) && count > 0) {
          const chunks: string[] = [];
          for (let i = 0; i < count; i += 1) {
            const part = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
            if (part === null) {
              return null;
            }
            chunks.push(part);
          }
          return chunks.join("");
        }
      }

      return await SecureStore.getItemAsync(key);
    } catch {
      console.warn("Falha ao recuperar sessão segura do dispositivo.");
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      return;
    }

    try {
      if (value.length > CHUNK_SIZE) {
        const chunkCount = Math.ceil(value.length / CHUNK_SIZE);
        for (let i = 0; i < chunkCount; i += 1) {
          const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
        }
        await SecureStore.setItemAsync(`${key}_chunks`, String(chunkCount));
        // Remove legacy non-chunked key if it existed
        await SecureStore.deleteItemAsync(key).catch(() => undefined);
      } else {
        await SecureStore.setItemAsync(key, value);
        // Clear any old chunks if previously chunked
        const oldChunksStr = await SecureStore.getItemAsync(
          `${key}_chunks`,
        ).catch(() => null);
        if (oldChunksStr) {
          const count = parseInt(oldChunksStr, 10);
          for (let i = 0; i < count; i += 1) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(
              () => undefined,
            );
          }
          await SecureStore.deleteItemAsync(`${key}_chunks`).catch(
            () => undefined,
          );
        }
      }
    } catch {
      console.warn("Falha ao persistir sessão segura do dispositivo.");
      throw new Error(
        "Não foi possível salvar a sessão no armazenamento seguro.",
      );
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      return;
    }

    try {
      const chunksCountStr = await SecureStore.getItemAsync(
        `${key}_chunks`,
      ).catch(() => null);
      if (chunksCountStr) {
        const count = parseInt(chunksCountStr, 10);
        for (let i = 0; i < count; i += 1) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(
            () => undefined,
          );
        }
        await SecureStore.deleteItemAsync(`${key}_chunks`).catch(
          () => undefined,
        );
      }
      await SecureStore.deleteItemAsync(key).catch(() => undefined);
    } catch {
      console.warn("Falha ao limpar sessão segura do dispositivo.");
      throw new Error(
        "Não foi possível remover a sessão do armazenamento seguro.",
      );
    }
  },
};
