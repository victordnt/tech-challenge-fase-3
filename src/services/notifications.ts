import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function notificationsEnabled(userId: string) {
  const saved = await AsyncStorage.getItem(`mavi.notifications.${userId}`);
  if (saved !== 'true') return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

export async function setNotificationsEnabled(userId: string, enabled: boolean) {
  const identifier = `mavi-reminder-${userId}`;
  if (enabled) {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', { name: 'Lembretes financeiros', importance: Notifications.AndroidImportance.DEFAULT });
    }
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) throw new Error('Permissão negada. Ative as notificações nas configurações do aparelho e tente novamente.');
    await Notifications.cancelScheduledNotificationAsync(identifier);
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: { title: 'Seu momento Mavi', body: 'Reserve um minuto para atualizar suas entradas e saídas.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0, channelId: 'reminders' },
    });
  } else {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
  await AsyncStorage.setItem(`mavi.notifications.${userId}`, String(enabled));
}

export async function notifyTransactionSaved(_userId: string) {
  // Native notifications are daily reminders, without financial details.
}

export async function clearAccountNotifications(userId: string) {
  await setNotificationsEnabled(userId, false);
}
