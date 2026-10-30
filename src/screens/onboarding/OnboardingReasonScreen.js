import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { useColors } from '../../context/ThemeContext';

const REASONS = [
  { id: 'health', label: 'Sănătate', emoji: '❤️' },
  { id: 'family', label: 'Familie', emoji: '👨‍👩‍👧' },
  { id: 'money', label: 'Bani', emoji: '💰' },
  { id: 'performance', label: 'Performanță', emoji: '🏆' },
  { id: 'self_esteem', label: 'Stima de sine', emoji: '✨' },
  { id: 'relationships', label: 'Relații', emoji: '💞' },
  { id: 'freedom', label: 'Libertate', emoji: '🦅' },
  { id: 'other', label: 'Alt motiv', emoji: '💭' },
];

export default function OnboardingReasonScreen({ navigation, route }) {
  const colors = useColors();
  const params = route.params || {};
  const { habitName, habitIcon } = params;
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');

  const canContinue =
    selectedReason && (selectedReason !== 'other' || customReason.trim().length > 0);
  const reasonText =
    selectedReason === 'other'
      ? customReason.trim()
      : REASONS.find((r) => r.id === selectedReason)?.label || '';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.progressRow}>
          <View style={[styles.progressDot, { backgroundColor: colors.primaryDark }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
        </View>

        <View style={[styles.habitBadge, { backgroundColor: colors.primaryFaded }]}>
          <Text style={styles.habitIcon}>{habitIcon}</Text>
          <Text style={[styles.habitName, { color: colors.primary }]}>{habitName}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>De ce vrei să renunți?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Motivul tău principal este ancora ta în momentele dificile.
        </Text>

        <View style={styles.grid}>
          {REASONS.map((reason) => {
            const active = selectedReason === reason.id;
            return (
              <TouchableOpacity
                key={reason.id}
                onPress={() => setSelectedReason(reason.id)}
                style={[
                  styles.reasonCard,
                  { backgroundColor: active ? colors.primaryFaded : colors.card,
                    borderColor: active ? colors.primary : colors.border },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.reasonEmoji}>{reason.emoji}</Text>
                <Text style={[styles.reasonLabel, { color: active ? colors.text : colors.textSecondary }]}>
                  {reason.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedReason === 'other' && (
          <View style={styles.customInput}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Descrie motivul tău</Text>
            <TextInput
              value={customReason}
              onChangeText={setCustomReason}
              placeholder="Scrie motivul tău personal..."
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              multiline
              numberOfLines={3}
              autoFocus
            />
          </View>
        )}

        <Button
          label="Continuă"
          onPress={() =>
            navigation.navigate('OnboardingStrategy', {
              ...params,
              reason: reasonText,
            })
          }
          disabled={!canContinue}
          style={styles.btn}
        />
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
  habitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  habitIcon: { fontSize: 18 },
  habitName: { fontSize: 14, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  reasonCard: {
    width: '47%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    gap: 6,
  },
  reasonEmoji: { fontSize: 28 },
  reasonLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  customInput: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    padding: 14,
    textAlignVertical: 'top',
  },
  btn: { marginTop: 8 },
});
