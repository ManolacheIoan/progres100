import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import notificationService from '../../services/notificationService';
import { REMINDER_TIMES } from '../../constants/reminderTimes';
import { getSeverityLabel, getSeverityColor } from '../../components/SeverityBadge';
import Button from '../../components/Button';

export default function OnboardingReminderScreen({ navigation, route }) {
  const params = route.params || {};
  const { completeOnboarding } = useApp();
  const colors = useColors();

  const [selectedTime, setSelectedTime] = useState('19:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (reminderEnabled) {
        const granted = await notificationService.requestPermission();
        if (!granted) {
          Alert.alert(
            'Permisiune refuzată',
            'Activează notificările din Setări iOS → Progres 100 → Notificări, apoi revino.',
          );
          setLoading(false);
          return;
        }
        const { hour, minute } = notificationService.parseTimeString(selectedTime);
        await notificationService.scheduleDailyReminder(hour, minute);
      }
      await completeOnboarding({
        ...params,
        reminder: { enabled: reminderEnabled, time: selectedTime },
      });
    } catch {
      Alert.alert('Atenție', 'Configurarea s-a finalizat cu unele erori, dar poți continua.');
      try {
        await completeOnboarding({ ...params, reminder: { enabled: false, time: '19:00' } });
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.progressDot, { backgroundColor: colors.primary }]} />
          ))}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Reminder zilnic</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          O notificare zilnică te ajută să rămâi constant.
        </Text>

        <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Activează reminder-ul</Text>
            <Text style={[styles.toggleSub, { color: colors.textMuted }]}>Notificare zilnică de progres</Text>
          </View>
          <TouchableOpacity
            onPress={() => setReminderEnabled((v) => !v)}
            style={[styles.toggle, { backgroundColor: reminderEnabled ? colors.primary : colors.border }]}
          >
            <View style={[styles.toggleDot, { backgroundColor: colors.white }, reminderEnabled && styles.toggleDotOn]} />
          </TouchableOpacity>
        </View>

        {reminderEnabled && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Ora reminder-ului</Text>
            <View style={styles.timesRow}>
              {REMINDER_TIMES.map((t) => {
                const active = selectedTime === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setSelectedTime(t.value)}
                    style={[
                      styles.timeCard,
                      { backgroundColor: active ? colors.primaryFaded : colors.card,
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

        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>REZUMAT</Text>
          <Text style={[styles.summaryItem, { color: colors.textMuted }]}>
            {params.habitIcon} Obicei:{' '}
            <Text style={[styles.summaryValue, { color: colors.text }]}>{params.habitName}</Text>
          </Text>
          <Text style={[styles.summaryItem, { color: colors.textMuted }]}>
            💭 Motiv:{' '}
            <Text style={[styles.summaryValue, { color: colors.text }]}>{params.reason}</Text>
          </Text>
          <Text style={[styles.summaryItem, { color: colors.textMuted }]}>
            🎯 Strategie:{' '}
            <Text style={[styles.summaryValue, { color: colors.text }]}>{params.strategyLabel}</Text>
          </Text>
          <View style={styles.summaryRowInline}>
            <Text style={[styles.summaryItem, { color: colors.textMuted }]}>Severitate: </Text>
            <View style={[styles.summaryDot, { backgroundColor: getSeverityColor(params.severity, colors) }]} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {getSeverityLabel(params.severity)}
            </Text>
          </View>
          {reminderEnabled && (
            <Text style={[styles.summaryItem, { color: colors.textMuted }]}>
              🔔 Reminder:{' '}
              <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedTime}</Text>
            </Text>
          )}
        </View>

        <Button label="Începe progresul meu 🚀" onPress={handleFinish} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 16, fontWeight: '600' },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1,
  },
  toggleLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  toggleSub: { fontSize: 13 },
  toggle: { width: 52, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  toggleDot: { width: 24, height: 24, borderRadius: 12, alignSelf: 'flex-start' },
  toggleDotOn: { alignSelf: 'flex-end' },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.3 },
  timesRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  timeCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2, gap: 3 },
  timeEmoji: { fontSize: 20 },
  timeValue: { fontSize: 12, fontWeight: '700' },
  timeLabel: { fontSize: 10 },
  summaryCard: { borderRadius: 16, padding: 18, marginBottom: 24, gap: 8, borderWidth: 1 },
  summaryTitle: { fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 0.5 },
  summaryItem: { fontSize: 14 },
  summaryValue: { fontWeight: '600' },
  summaryRowInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
});
