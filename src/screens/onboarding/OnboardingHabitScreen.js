import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HABIT_CATEGORIES } from '../../constants/habits';
import Button from '../../components/Button';
import { useColors } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SEVERITY_OPTIONS = [
  { id: 'low',    label: 'Ușor',    desc: 'Impulsuri ocazionale, control relativ bun', emoji: '🟢' },
  { id: 'medium', label: 'Moderat', desc: 'Dificultăți frecvente, câteva recăderi',    emoji: '🟡' },
  { id: 'high',   label: 'Sever',   desc: 'Dependență puternică, impact semnificativ', emoji: '🔴' },
];

export default function OnboardingHabitScreen({ navigation }) {
  const colors = useColors();
  const { user, logout } = useAuth();

  const [selectedId, setSelectedId] = useState(null);
  const [severity, setSeverity]     = useState(null);

  const selected    = HABIT_CATEGORIES.find((h) => h.id === selectedId);
  const habitName   = selected?.label || '';
  const canContinue = selectedId && severity;

  function handleSeverityPress(id) {
    if (!selectedId) {
      Alert.alert('Selectează mai întâi o categorie', 'Alege tipul de obicei înainte de a seta severitatea.');
      return;
    }
    setSeverity(id);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.topRow}>
          <View style={styles.progressRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.progressDot, { backgroundColor: i === 0 ? colors.primary : colors.border }]}
              />
            ))}
          </View>
          {user?.isGuest && (
            <TouchableOpacity onPress={logout} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Ce obicei vrei să elimini?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Alege obiceiul pe care vrei să îl reduci sau să îl elimini complet.
        </Text>

        <View style={styles.grid}>
          {HABIT_CATEGORIES.map((habit) => {
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

        <Button
          label="Continuă"
          onPress={() => navigation.navigate('OnboardingReason', {
            habitId: selectedId,
            habitName,
            habitIcon: selected?.icon || '🎯',
            severity,
          })}
          disabled={!canContinue}
          style={styles.btn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  progressRow: { flex: 1, flexDirection: 'row', gap: 8 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  habitCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, gap: 6 },
  habitIcon: { fontSize: 30 },
  habitLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.3 },
  severityCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 2 },
  severityEmoji: { fontSize: 24 },
  severityContent: { flex: 1 },
  severityLabel: { fontSize: 15, fontWeight: '700' },
  severityDesc: { fontSize: 12, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  btn: { marginTop: 16 },
});
