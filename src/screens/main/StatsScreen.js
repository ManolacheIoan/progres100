import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import LoadingState from '../../components/LoadingState';
import HabitSwitcher from '../../components/HabitSwitcher';
import SeverityBadge from '../../components/SeverityBadge';

function rateColor(rate, colors) {
  if (rate === undefined || rate === null) return colors.textMuted;
  if (rate >= 70) return colors.success;
  if (rate >= 40) return colors.warning;
  return colors.danger;
}

export default function StatsScreen() {
  const { stats, loadAll, loading, activeHabit, activeHabitId } = useApp();
  const colors = useColors();

  const [impulsRezistite, setImpulsRezistite] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [activeHabitId])
  );

  if (loading && !stats) return <LoadingState />;

  const statistici = stats || {};

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Statistici</Text>

        <HabitSwitcher />

        {activeHabit && (
          <View style={[styles.habitBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.habitIcon}>{activeHabit.habitIcon || activeHabit.icon || '🎯'}</Text>
            <View style={styles.habitBadgeInfo}>
              <Text style={[styles.habitBadgeName, { color: colors.text }]}>
                {activeHabit.habitName || activeHabit.name}
              </Text>
              <SeverityBadge severity={activeHabit.severity} />
            </View>
          </View>
        )}

        {/* Main streak stats */}
        <View style={styles.row}>
          <StatCard label="Streak curent" value={statistici.currentStreak ?? 0} color={colors.primary} icon="🔥" />
          <StatCard label="Cel mai bun" value={statistici.bestStreak ?? 0} color={colors.warning} icon="🏆" />
        </View>

        {/* Success rates */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Rata de succes</Text>
          <View style={styles.rateRow}>
            <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Ultimele 7 zile</Text>
            <Text style={[styles.rateValue, { color: rateColor(statistici.successRate7, colors) }]}>
              {statistici.successRate7 ?? 0}%
            </Text>
          </View>
          <ProgressBar progress={(statistici.successRate7 ?? 0) / 100} color={rateColor(statistici.successRate7, colors)} height={8} />
          <View style={[styles.rateRow, styles.rateRowTop]}>
            <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Ultimele 30 zile</Text>
            <Text style={[styles.rateValue, { color: rateColor(statistici.successRate30, colors) }]}>
              {statistici.successRate30 ?? 0}%
            </Text>
          </View>
          <ProgressBar progress={(statistici.successRate30 ?? 0) / 100} color={rateColor(statistici.successRate30, colors)} height={8} />
        </Card>

        {/* Secondary stats */}
        <View style={styles.row}>
          <StatCard label="Total recăderi" value={statistici.totalRelapses ?? 0} color={colors.danger} icon="📉" />
          <StatCard label="Impulsuri rezistite" value={impulsRezistite} color={colors.accent} icon="⚡" />
        </View>

        <View style={styles.row}>
          <StatCard label="Total zile marcate" value={statistici.totalCheckins ?? 0} color={colors.textSecondary} icon="📅" />
          <StatCard
            label="Check-in-uri succes"
            value={Math.max(0, (statistici.totalCheckins ?? 0) - (statistici.totalRelapses ?? 0))}
            color={colors.success}
            icon="✅"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  habitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  habitIcon: {
    fontSize: 28,
  },
  habitBadgeInfo: {
    flex: 1,
  },
  habitBadgeName: {
    fontSize: 16,
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rateRowTop: {
    marginTop: 16,
  },
  rateLabel: {
    fontSize: 14,
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
