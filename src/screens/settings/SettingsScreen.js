import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors, useTheme } from '../../context/ThemeContext';
import notificationService from '../../services/notificationService';
import habitService from '../../services/habitService';
import { REMINDER_TIMES } from '../../constants/reminderTimes';
import Card from '../../components/Card';
import { getHabitName, getHabitIcon } from '../../utils/habitUtils';

const THEMES = [
  { id: 'dark', label: 'Întunecat', emoji: '🌙' },
  { id: 'light', label: 'Luminos', emoji: '☀️' },
  { id: 'system', label: 'Sistem', emoji: '📱' },
];

export default function SettingsScreen({ navigation }) {
  const { habits, resetHabitProgress, resetAllProgress } = useApp();
  const colors = useColors();
  const { theme, setTheme } = useTheme();

  const [reminders, setReminders] = useState({});

  useEffect(() => {
    const map = {};
    habits.forEach((habit) => {
      map[habit.id] = {
        enabled: habit.reminder?.enabled ?? false,
        time: habit.reminder?.time ?? '19:00',
      };
    });
    setReminders(map);
  }, [habits]);

  async function handleToggle(habitId, enabled) {
    const current = reminders[habitId] || { enabled: false, time: '19:00' };
    const updated = { ...current, enabled };
    setReminders((prev) => ({ ...prev, [habitId]: updated }));
    await habitService.update(habitId, { reminder: updated });
    if (enabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        const { hour, minute } = notificationService.parseTimeString(updated.time);
        await notificationService.scheduleDailyReminder(hour, minute);
      } else {
        Alert.alert('Permisiune refuzată', 'Activează notificările din Setări iOS → Progres 100 → Notificări.');
        setReminders((prev) => ({ ...prev, [habitId]: { ...updated, enabled: false } }));
        await habitService.update(habitId, { reminder: { ...updated, enabled: false } });
      }
    } else {
      await notificationService.cancelDailyReminder();
    }
  }

  async function handleTimeChange(habitId, time) {
    const current = reminders[habitId] || { enabled: false, time: '19:00' };
    const updated = { ...current, time };
    setReminders((prev) => ({ ...prev, [habitId]: updated }));
    await habitService.update(habitId, { reminder: updated });
    if (updated.enabled) {
      const { hour, minute } = notificationService.parseTimeString(time);
      await notificationService.scheduleDailyReminder(hour, minute);
    }
  }

  function handleResetSingle() {
    if (habits.length === 0) {
      Alert.alert('Niciun obicei', 'Nu ai obiceiuri de resetat.');
      return;
    }
    if (habits.length === 1) {
      confirmResetSingle(habits[0]);
      return;
    }
    Alert.alert(
      'Alege obiceiul',
      'Selectează obiceiul al cărui progres vrei să îl resetezi:',
      [
        ...habits.map((h) => ({
          text: `${h.habitIcon || '🎯'} ${h.habitName || h.name}`,
          onPress: () => confirmResetSingle(h),
        })),
        { text: 'Anulează', style: 'cancel' },
      ]
    );
  }

  function confirmResetSingle(habit) {
    Alert.alert(
      'Resetează progresul',
      `Ești sigur că vrei să resetezi tot progresul pentru "${getHabitName(habit)}"?\n\nAceastă acțiune nu poate fi anulată.`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Resetează',
          style: 'destructive',
          onPress: () => resetHabitProgress(habit.id),
        },
      ]
    );
  }

  function handleResetAll() {
    Alert.alert(
      'Resetează tot progresul',
      'Această acțiune va șterge TOATE obiceiurile, statisticile, check-in-urile și datele de progres.\n\nAcțiunea nu poate fi anulată.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge tot',
          style: 'destructive',
          onPress: () => resetAllProgress(),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Setări</Text>

        {/* Theme */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TEMĂ VIZUALĂ</Text>
        <Card>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Alege tema aplicației</Text>
          <View style={styles.themeRow}>
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTheme(t.id)}
                  style={[
                    styles.themeCard,
                    { backgroundColor: active ? colors.primaryFaded : colors.surface,
                      borderColor: active ? colors.primary : colors.border },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.themeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.themeLabel, { color: active ? colors.primary : colors.textSecondary }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Per-habit reminders */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>REMINDER ZILNIC</Text>
        {habits.length === 0 ? (
          <Card>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nu ai niciun obicei adăugat.</Text>
          </Card>
        ) : (
          habits.map((habit) => {
            const reminder = reminders[habit.id] || { enabled: false, time: '19:00' };
            return (
              <Card key={habit.id} style={styles.habitCard}>
                <View style={styles.habitRow}>
                  <Text style={styles.habitIcon}>{getHabitIcon(habit)}</Text>
                  <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>
                    {getHabitName(habit)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleToggle(habit.id, !reminder.enabled)}
                    style={[styles.toggle, { backgroundColor: reminder.enabled ? colors.primary : colors.border }]}
                  >
                    <View style={[styles.toggleDot, { backgroundColor: colors.white }, reminder.enabled && styles.toggleDotOn]} />
                  </TouchableOpacity>
                </View>
                {reminder.enabled && (
                  <>
                    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
                    <Text style={[styles.timePickerLabel, { color: colors.textSecondary }]}>
                      Ora: <Text style={{ color: colors.primary, fontWeight: '800' }}>{reminder.time}</Text>
                    </Text>
                    <View style={styles.timesRow}>
                      {REMINDER_TIMES.map((t) => {
                        const active = reminder.time === t.value;
                        return (
                          <TouchableOpacity
                            key={t.value}
                            onPress={() => handleTimeChange(habit.id, t.value)}
                            style={[
                              styles.timeCard,
                              { backgroundColor: active ? colors.primaryFaded : colors.surface,
                                borderColor: active ? colors.primary : colors.border },
                            ]}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.timeEmoji}>{t.emoji}</Text>
                            <Text style={[styles.timeValue, { color: active ? colors.primary : colors.textSecondary }]}>
                              {t.value}
                            </Text>
                            <Text style={[styles.timeLabel, { color: colors.textMuted }]}>{t.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </Card>
            );
          })
        )}

        {/* Reset progress */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PROGRES & DATE</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.menuRow} onPress={handleResetSingle} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>🔄</Text>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Resetează un obicei</Text>
              <Text style={[styles.menuSub, { color: colors.textMuted }]}>Șterge progresul unui singur obicei</Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />
          <TouchableOpacity style={styles.menuRow} onPress={handleResetAll} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>🗑️</Text>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.danger }]}>Resetează tot progresul</Text>
              <Text style={[styles.menuSub, { color: colors.textMuted }]}>Șterge toate obiceiurile și datele</Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>INFORMAȚII</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('About')} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>ℹ️</Text>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Despre aplicație</Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('PrivacyPolicy')} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>🔒</Text>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Politica de confidențialitate</Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />
          <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Terms')} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>📄</Text>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: colors.text }]}>Termeni și Condiții</Text>
            </View>
            <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: -4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  themeRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  themeCard: { flex: 1, alignItems: 'center', borderRadius: 12, padding: 12, borderWidth: 2, gap: 4 },
  themeEmoji: { fontSize: 22 },
  themeLabel: { fontSize: 12, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 4 },
  habitCard: { gap: 0 },
  habitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  habitIcon: { fontSize: 22 },
  habitName: { flex: 1, fontSize: 15, fontWeight: '700' },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, alignSelf: 'flex-start' },
  toggleDotOn: { alignSelf: 'flex-end' },
  divider: { height: 1, marginVertical: 14 },
  timePickerLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  timesRow: { flexDirection: 'row', gap: 8 },
  timeCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2, gap: 3 },
  timeEmoji: { fontSize: 20 },
  timeValue: { fontSize: 12, fontWeight: '700' },
  timeLabel: { fontSize: 10 },

  menuCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuEmoji: { fontSize: 20, width: 26, textAlign: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  menuSub: { fontSize: 12, marginTop: 1 },
  menuArrow: { fontSize: 22, fontWeight: '300' },
  menuDivider: { height: 1, marginLeft: 54 },
});
