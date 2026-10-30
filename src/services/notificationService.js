import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const notificationService = {
  requestPermission: async () => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  scheduleDailyReminder: async (hour = 20, minute = 0) => {
    try {
      await notificationService.cancelDailyReminder();
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Progres 100',
          body: 'Cum a fost ziua ta? Marchează progresul tău de azi.',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      return id;
    } catch (e) {
      console.warn('scheduleDailyReminder error:', e);
      return null;
    }
  },

  cancelDailyReminder: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // ignore
    }
  },

  parseTimeString: (timeStr = '20:00') => {
    const [hourStr, minuteStr] = timeStr.split(':');
    return { hour: parseInt(hourStr, 10) || 20, minute: parseInt(minuteStr, 10) || 0 };
  },
};

export default notificationService;
