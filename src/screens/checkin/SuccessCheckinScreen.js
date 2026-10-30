import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import { DAILY_MESSAGES } from '../../constants/recommendations';
import Button from '../../components/Button';
import Input from '../../components/Input';
import IntensitySelector from '../../components/IntensitySelector';

function getRandomMessage(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function SuccessCheckinScreen({ navigation }) {
  const { addSuccess, activeHabit, stats } = useApp();
  const colors = useColors();

  const [impulseIntensity, setImpulseIntensity] = useState(0);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const streak = stats?.currentStreak ?? 0;
  const motivationMsg = useMemo(() => getRandomMessage(DAILY_MESSAGES.success), []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addSuccess({ impulseIntensity, note });
      const newStreak = streak + 1;
      const streakMsg = getRandomMessage(DAILY_MESSAGES.streak);
      Alert.alert(
        '🔥 Zi reușită!',
        `Streak: ${newStreak} ${newStreak === 1 ? 'zi' : 'zile'}\n\n${streakMsg}`,
        [{ text: 'Super!', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut salva check-in-ul. Încearcă din nou.');
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
          <Text style={styles.heroIcon}>✅</Text>
          <Text style={[styles.heroTitle, { color: colors.success }]}>Zi reușită!</Text>
          {activeHabit && (
            <Text style={[styles.heroHabit, { color: colors.textMuted }]}>
              {activeHabit.habitIcon || activeHabit.icon || '🎯'} {activeHabit.habitName || activeHabit.name}
            </Text>
          )}
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Marchezi astăzi ca o victorie. Bravo!
          </Text>
        </View>

        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakText, { color: colors.primary }]}>
              Streak curent: {streak} {streak === 1 ? 'zi' : 'zile'}
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <IntensitySelector
            label="Ai simțit impulsuri azi? (intensitate)"
            value={impulseIntensity}
            onChange={setImpulseIntensity}
          />
          <Input
            label="Notă (opțional)"
            value={note}
            onChangeText={setNote}
            placeholder="Cum te-ai simțit? Ce te-a ajutat să rezisti?"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={[styles.motivationBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.motivationText, { color: colors.textSecondary }]}>💬 {motivationMsg}</Text>
        </View>

        <Button
          label="Salvează ziua reușită 🔥"
          onPress={handleSubmit}
          variant="success"
          loading={loading}
        />
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
    marginBottom: 24,
  },
  backText: {
    fontSize: 15,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  heroIcon: {
    fontSize: 80,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  heroHabit: {
    fontSize: 14,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  streakEmoji: {
    fontSize: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
  },
  form: {
    gap: 24,
    marginBottom: 20,
  },
  motivationBox: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
  },
  motivationText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
