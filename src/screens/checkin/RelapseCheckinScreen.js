import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import { TRIGGERS } from '../../constants/triggers';
import { DAILY_MESSAGES } from '../../constants/recommendations';
import Button from '../../components/Button';
import Input from '../../components/Input';
import IntensitySelector from '../../components/IntensitySelector';

function getRandomMessage(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function RelapseCheckinScreen({ navigation }) {
  const { addRelapse, activeHabit } = useApp();
  const colors = useColors();

  const [trigger, setTrigger] = useState('');
  const [intensity, setIntensity] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const compassionMsg = useMemo(() => getRandomMessage(DAILY_MESSAGES.relapse), []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addRelapse({ trigger, intensity, note });
      Alert.alert(
        'Recădere înregistrată',
        `${compassionMsg}\n\nStreakul curent a fost resetat, dar recordul tău este păstrat.`,
        [{ text: 'Înțeles', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut salva recăderea. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.textMuted }]}>✕ Anulează</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.heroIcon}>⚠️</Text>
          <Text style={[styles.heroTitle, { color: colors.danger }]}>Recădere</Text>
          {activeHabit && (
            <Text style={[styles.heroHabit, { color: colors.textMuted }]}>
              {activeHabit.habitIcon || activeHabit.icon || '🎯'} {activeHabit.habitName || activeHabit.name}
            </Text>
          )}
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Este o parte din proces. Înregistrează ce s-a întâmplat pentru a învăța.
          </Text>
        </View>

        <View style={[styles.compassionBox, { backgroundColor: colors.accentFaded, borderColor: colors.accent }]}>
          <Text style={[styles.compassionText, { color: colors.accent }]}>
            💙 {compassionMsg}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Ce a declanșat recăderea?</Text>
        <View style={styles.triggersGrid}>
          {TRIGGERS.map((t) => {
            const active = trigger === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTrigger(t.id)}
                style={[
                  styles.triggerBtn,
                  { backgroundColor: active ? colors.dangerFaded : colors.card },
                  { borderColor: active ? colors.danger : colors.border },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.triggerIcon}>{t.icon}</Text>
                <Text style={[styles.triggerLabel, { color: active ? colors.danger : colors.textSecondary }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <IntensitySelector
          label="Intensitatea impulsului"
          value={intensity}
          onChange={setIntensity}
        />

        <Input
          label="Notă (opțional)"
          value={note}
          onChangeText={setNote}
          placeholder="Ce s-a întâmplat? Ce poți face diferit data viitoare?"
          multiline
          numberOfLines={4}
        />

        <Button
          label="Înregistrează recăderea"
          onPress={handleSubmit}
          variant="danger"
          loading={loading}
          style={styles.btn}
        />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.textMuted }]}>Nu vreau să înregistrez acum</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  heroIcon: {
    fontSize: 64,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  heroHabit: {
    fontSize: 14,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  compassionBox: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
  },
  compassionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  triggerIcon: {
    fontSize: 16,
  },
  triggerLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  btn: {
    marginTop: 24,
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    padding: 10,
  },
  cancelText: {
    fontSize: 14,
  },
});
