import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRATEGIES } from '../../constants/strategies';
import Button from '../../components/Button';
import { useColors } from '../../context/ThemeContext';

export default function OnboardingStrategyScreen({ navigation, route }) {
  const colors = useColors();
  const params = route.params || {};
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const selected = STRATEGIES.find((s) => s.id === selectedStrategy);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <View style={styles.progressRow}>
          <View style={[styles.progressDot, { backgroundColor: colors.primaryDark }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.primaryDark }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Care este strategia ta?</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Strategia potrivită face toată diferența. Alege ce ți se potrivește cel mai bine.
        </Text>

        {STRATEGIES.map((strategy) => {
          const active = selectedStrategy === strategy.id;
          return (
            <TouchableOpacity
              key={strategy.id}
              onPress={() => setSelectedStrategy(strategy.id)}
              style={[
                styles.card,
                { backgroundColor: active ? colors.primaryFaded : colors.card,
                  borderColor: active ? colors.primary : colors.border },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardIcon}>{strategy.icon}</Text>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardLabel, { color: active ? colors.text : colors.textSecondary }]}>
                    {strategy.label}
                  </Text>
                  <Text style={[styles.cardDescription, { color: colors.textMuted }]}>
                    {strategy.description}
                  </Text>
                </View>
                <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                  {active && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <Button
          label="Continuă"
          onPress={() =>
            navigation.navigate('OnboardingReminder', {
              ...params,
              strategy: selectedStrategy,
              strategyLabel: selected?.label || '',
            })
          }
          disabled={!selectedStrategy}
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
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  card: { borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIcon: { fontSize: 28 },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cardDescription: { fontSize: 13, lineHeight: 18 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  btn: { marginTop: 12 },
});
