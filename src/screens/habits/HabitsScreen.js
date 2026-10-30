import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import SeverityBadge from '../../components/SeverityBadge';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import statsService from '../../services/statsService';
import checkinService from '../../services/checkinService';
import { getHabitName, getHabitIcon } from '../../utils/habitUtils';


function getTodayStatusLabel(status) {
  if (status === 'success') return { label: '✅ Reușit', type: 'success' };
  if (status === 'grace') return { label: '🛡️ Grație', type: 'success' };
  if (status === 'relapse') return { label: '⚠️ Recădere', type: 'danger' };
  return { label: '⏳ Neînregistrat', type: 'muted' };
}

export default function HabitsScreen({ navigation }) {
  const { habits, setActiveHabitId, isPremium } = useApp();
  const colors = useColors();
  const [habitStats, setHabitStats] = useState({});
  const [habitStatuses, setHabitStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadAll() {
        setLoading(true);
        const statsMap = {};
        const statusMap = {};
        for (const habit of habits) {
          const statistici = await statsService.getFullStats(habit.id);
          const status = await checkinService.getTodayStatus(habit.id);
          statsMap[habit.id] = statistici;
          statusMap[habit.id] = status;
        }
        setHabitStats(statsMap);
        setHabitStatuses(statusMap);
        setLoading(false);
      }
      loadAll();
    }, [habits])
  );

  function openHabit(habit) {
    setActiveHabitId(habit.id);
    navigation.navigate('HabitDetail');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Obiceiurile mele</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}
          onPress={() => {
            if (!isPremium && habits.length >= 1) {
              Alert.alert(
                '👑 Funcție Premium',
                'Planul gratuit permite un singur obicei. Fă upgrade la Premium pentru obiceiuri nelimitate și multe alte beneficii.',
                [
                  { text: 'Poate mai târziu', style: 'cancel' },
                  { text: 'Vezi Premium', onPress: () => navigation.navigate('Subscription') },
                ]
              );
            } else {
              navigation.navigate('AddHabit');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.addBtnText, { color: colors.primary }]}>＋ Adaugă</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {habits.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Niciun obicei adăugat</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Adaugă primul tău obicei pentru a începe călătoria.
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AddHabit')}
                activeOpacity={0.8}
              >
                <Text style={[styles.emptyBtnText, { color: colors.white }]}>Adaugă obicei</Text>
              </TouchableOpacity>
            </View>
          ) : (
            habits.map((habit) => {
              const statistici = habitStats[habit.id] || {};
              const todayStatus = habitStatuses[habit.id] || 'none';
              const { label: statusLabel, type: statusType } = getTodayStatusLabel(todayStatus);
              let statusColor = colors.textMuted;
              if (statusType === 'success') statusColor = colors.success;
              if (statusType === 'danger') statusColor = colors.danger;
              const name = getHabitName(habit);
              const icon = getHabitIcon(habit);

              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => openHabit(habit)}
                  activeOpacity={0.75}
                >
                  {/* Card header */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primaryFaded }]}>
                      <Text style={styles.habitIcon}>{icon}</Text>
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>
                        {name}
                      </Text>
                      <SeverityBadge severity={habit.severity} />
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                  </View>

                  {/* Stats row */}
                  <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.primary }]}>
                        {statistici.currentStreak ?? 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textMuted }]}>streak</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.warning }]}>
                        {statistici.bestStreak ?? 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textMuted }]}>record</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.success }]}>
                        {statistici.successRate7 ?? 0}%
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textMuted }]}>7 zile</Text>
                    </View>
                    <View style={styles.cardChevron}>
                      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  emptyContainer: {
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIcon: {
    fontSize: 24,
  },
  cardHeaderText: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  cardChevron: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 22,
  },
});
