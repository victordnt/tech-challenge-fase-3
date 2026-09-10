import AsyncStorage from '@react-native-async-storage/async-storage';

export async function notificationsEnabled(userId: string) {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
    && await AsyncStorage.getItem(`mavi.notifications.${userId}`) === 'true';
}

export async function setNotificationsEnabled(userId: string, enabled: boolean) {
  if (enabled) {
    if (typeof Notification === 'undefined' || !globalThis.isSecureContext) {
      throw new Error('Este navegador não oferece notificações. Use um navegador compatível em HTTPS ou localhost.');
    }
    if (await Notification.requestPermission() !== 'granted') {
      throw new Error('Permissão negada. Libere as notificações nas configurações deste site para ativar.');
    }
    // Some mobile browsers expose permission APIs but require a service worker to display.
    try { new Notification('Mavi Finance', { body: 'Avisos de transações ativados neste navegador.' }); }
    catch { throw new Error('Este navegador não permite avisos com o app aberto. Use o aplicativo no celular para lembretes.'); }
  }
  await AsyncStorage.setItem(`mavi.notifications.${userId}`, String(enabled));
}

export async function notifyTransactionSaved(userId: string) {
  if (await notificationsEnabled(userId)) {
    new Notification('Mavi Finance', { body: 'Sua transação foi salva com sucesso.' });
  }
}

export async function clearAccountNotifications(userId: string) {
  await setNotificationsEnabled(userId, false);
}
