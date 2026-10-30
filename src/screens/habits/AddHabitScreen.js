import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import { HABIT_CATEGORIES } from '../../constants/habits';
import Button from '../../components/Button';
import { REMINDER_TIMES } from '../../constants/reminderTimes';

const SEVERITY_OPTIONS = [
  { id: 'low', label: 'Ușor', desc: 'Impulsuri ocazionale, control relativ bun', emoji: '🟢' },
  { id: 'medium', label: 'Moderat', desc: 'Dificultăți frecvente, câteva recăderi', emoji: '🟡' },
  { id: 'high', label: 'Sever', desc: 'Dependență puternică, impact semnificativ', emoji: '🔴' },
];

export default function AddHabitScreen({ navigation }) {
  const { addHabit, setActiveHabitId, habits } = useApp();
  const colors = useColors();

  const usedIds = new Set(habits.map((h) => h.category || h.habitId).filter(Boolean));
  const availableCategories = HABIT_CATEGORIES.filter((h) => !usedIds.has(h.id));

  const [selectedId, setSelectedId] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [reason, setReason] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [loading, setLoading] = useState(false);

  const selected = HABIT_CATEGORIES.find((h) => h.id === selectedId);
  const canContinue = selectedId && severity;
  const habitName = selected?.label || '';

  const handleAdd = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      const habit = await addHabit({
        habitId: selectedId,
        habitName,
        habitIcon: selected?.icon || '🎯',
        severity: severity || 'medium',
        reason: reason.trim(),
        reminder: { enabled: reminderEnabled, time: reminderTime },
      });
      await setActiveHabitId(habit.id);
      Alert.alert(
        'Obicei adăugat!',
        `"${habitName}" a fost adăugat. Poți comuta între obiceiuri din ecranul principal.`,
        [{ text: 'Super!', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut adăuga obiceiul.');
    } finally {
      setLoading(false);
    }
  };

  function handleSeverityPress(id) {
    if (!selectedId) {
      Alert.alert(
        'Selectează mai întâi o categorie',
        'Alege tipul de obicei din lista de mai sus înainte de a seta severitatea.'
      );
      return;
    }
    setSeverity(id);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Adaugă obicei nou</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Fiecare obicei va fi urmărit independent cu propriile statistici.
        </Text>

        {availableCategories.length === 0 ? (
          <Text style={[styles.allUsedText, { color: colors.textMuted }]}>
            Ai adăugat deja toate categoriile disponibile.
          </Text>
        ) : null}

        <View style={styles.grid}>
          {availableCategories.map((habit) => {
            const active = selectedId === habit.id;
            const dimmed = selectedId && !active;
            return (
              <TouchableOpacity
                key={habit.id}
                onPress={() => setSelectedId(active ? null : habit.id)}
                style={[
                  styles.habitCard,
                  { backgroundColor: active ? colors.primaryFaded : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: dimmed ? 0.35 : 1 },
                ]}
                activeOpacity={dimmed ? 1 : 0.7}
                disabled={dimmed}
              >
                <Text style={styles.habitIcon}>{habit.icon}</Text>
                <Text style={[styles.habitLabel, { color: active ? colors.text : colors.textSecondary }]}>
                  {habit.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Cât de sever este?</Text>
        {SEVERITY_OPTIONS.map((opt) => {
          const active = severity === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleSeverityPress(opt.id)}
              style={[
                styles.severityCard,
                { backgroundColor: active ? colors.primaryFaded : colors.card,
                  borderColor: active ? colors.primary : colors.border },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.severityEmoji}>{opt.emoji}</Text>
              <View style={styles.severityContent}>
                <Text style={[styles.severityLabel, { color: active ? colors.text : colors.textSecondary }]}>
                  {opt.label}
                </Text>
                <Text style={[styles.severityDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
              </View>
              <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                {active && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Motivul tău (opțional)</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="De ce vrei să renunți la acest obicei?"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          style={[styles.reasonInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        {/* Reminder */}
        <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Reminder zilnic</Text>
            <Text style={[styles.toggleSub, { color: colors.textMuted }]}>Notificare de progres</Text>
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
                const active = reminderTime === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setReminderTime(t.value)}
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

        <Button
          label="Adaugă obicei +"
          onPress={handleAdd}
          disabled={!canContinue}
          loading={loading}
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  allUsedText: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  habitCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, gap: 6 },
  habitIcon: { fontSize: 30 },
  habitLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.3 },
  severityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 2,
  },
  severityEmoji: { fontSize: 24 },
  severityContent: { flex: 1 },
  severityLabel: { fontSize: 15, fontWeight: '700' },
  severityDesc: { fontSize: 12, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  reasonInput: {
    borderRadius: 12, borderWidth: 1, fontSize: 15, padding: 14,
    textAlignVertical: 'top', minHeight: 80, marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1,
  },
  toggleLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  toggleSub: { fontSize: 12 },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' },
  toggleDot: { width: 22, height: 22, borderRadius: 11, alignSelf: 'flex-start' },
  toggleDotOn: { alignSelf: 'flex-end' },
  timesRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  timeCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 2, gap: 3 },
  timeEmoji: { fontSize: 20 },
  timeValue: { fontSize: 12, fontWeight: '700' },
  timeLabel: { fontSize: 10 },
  btn: {},
});
