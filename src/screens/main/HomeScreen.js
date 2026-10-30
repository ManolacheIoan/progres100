import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '../../context/ThemeContext';
import statsService from '../../services/statsService';
import checkinService from '../../services/checkinService';
import SeverityBadge from '../../components/SeverityBadge';
import { getHabitName, getHabitIcon } from '../../utils/habitUtils';

function getTodayLabel() {
  const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
  const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const azi = new Date();
  return `${days[azi.getDay()]}, ${azi.getDate()} ${months[azi.getMonth()]}`;
}

function getTodayStatusInfo(status, colors) {
  if (status === 'success') return { emoji: '✅', color: colors.success };
  if (status === 'grace') return { emoji: '🛡️', color: colors.success };
  if (status === 'relapse') return { emoji: '⚠️', color: colors.danger };
  return { emoji: '⏳', color: colors.textMuted };
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { habits, setActiveHabitId, loadAll, removeHabit, isPremium } = useApp();
  const colors = useColors();

  const [habitData, setHabitData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHabitSummaries();
    }, [habits])
  );

  async function loadHabitSummaries() {
    const map = {};
    for (const habit of habits) {
      const statistici = await statsService.getFullStats(habit.id);
      const status = await checkinService.getTodayStatus(habit.id);
      map[habit.id] = { stats: statistici, todayStatus: status };
    }
    setHabitData(map);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadAll();
    await loadHabitSummaries();
    setRefreshing(false);
  }

  function openHabit(habit) {
    setActiveHabitId(habit.id);
    navigation.navigate('HabitsTab', { screen: 'HabitDetail' });
  }

  function confirmDelete(habit) {
    Alert.alert(
      'Șterge obicei',
      `Ești sigur că vrei să ștergi "${getHabitName(habit)}"? Tot progresul va fi pierdut.`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => removeHabit(habit.id),
        },
      ]
    );
  }

  const greeting = user?.name ? `Bună, ${user.name.split(' ')[0]} 👋` : 'Bună ziua 👋';
  let motivText;
  if (habits.length === 0) {
    motivText = 'Adaugă primul tău obicei pentru a începe.';
  } else if (habits.length === 1) {
    motivText = 'Ești pe drumul cel bun. Continuă!';
  } else {
    motivText = `Urmărești ${habits.length} obiceiuri. Fiecare zi contează.`;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>{getTodayLabel()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
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
          <Text style={[styles.addBtnText, { color: colors.primary }]}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={[styles.motivText, { color: colors.textMuted }]}>{motivText}</Text>

        {habits.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Niciun obicei adăugat</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Apasă ＋ pentru a adăuga primul obicei.
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
          <>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Obiceiurile tale</Text>
            {habits.map((habit) => {
              const data = habitData[habit.id] || {};
              const streak = data.stats?.currentStreak ?? 0;
              const todayStatus = data.todayStatus || 'none';
              const { emoji: statusEmoji, color: statusColor } = getTodayStatusInfo(todayStatus, colors);
              const severity = habit.severity || 'medium';
              const name = getHabitName(habit);
              const icon = getHabitIcon(habit);

              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => openHabit(habit)}
                  activeOpacity={0.75}
                >
                  {/* Icon */}
                  <View style={[styles.habitIconCircle, { backgroundColor: colors.primaryFaded }]}>
                    <Text style={styles.habitIcon}>{icon}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>
                      {name}
                    </Text>
                    <SeverityBadge severity={severity} />
                  </View>

                  {/* Right side: streak, status, delete — all in one row */}
                  <View style={styles.habitRight}>
                    <View style={styles.streakRow}>
                      <Text style={[styles.streakNumber, { color: colors.primary }]}>{streak}</Text>
                      <Text style={styles.streakFire}>🔥</Text>
                    </View>
                    <Text style={[styles.todayEmoji, { color: statusColor }]}>{statusEmoji}</Text>
                    <TouchableOpacity
                      style={[styles.deleteBtn, { backgroundColor: colors.dangerFaded }]}
                      onPress={() => confirmDelete(habit)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.deleteBtnText, { color: colors.danger }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
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
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  motivText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 8,
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
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  habitIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIcon: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
    gap: 3,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '700',
  },
  habitSeverity: {
    fontSize: 12,
  },
  habitRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  streakFire: {
    fontSize: 14,
  },
  todayEmoji: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
