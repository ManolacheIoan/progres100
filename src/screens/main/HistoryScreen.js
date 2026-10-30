import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import EmptyState from '../../components/EmptyState';
import HabitSwitcher from '../../components/HabitSwitcher';
import { dateKey } from '../../services/checkinService';

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return { firstDay, totalDays };
}

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];
const DAY_NAMES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function HistoryScreen({ navigation }) {
  const { checkins, loadAll } = useApp();
  const colors = useColors();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useFocusEffect(useCallback(() => { loadAll(); }, []));

  const { firstDay, totalDays } = getMonthDays(year, month);
  const todayKey = dateKey(now);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  function statusColor(status) {
    if (status === 'success' || status === 'grace') return colors.success;
    if (status === 'relapse') return colors.danger;
    return null;
  }

  const hasAnyCheckin = Object.keys(checkins).length > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Istoric</Text>

        <HabitSwitcher />

        {/* Calendar card */}
        <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>

          {/* Month navigation */}
          <View style={[styles.monthNav, { borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={[styles.navArrow, { color: colors.primary }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: colors.text }]}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={[styles.navArrow, { color: colors.primary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day names header */}
          <View style={styles.calendarHeader}>
            {DAY_NAMES.map((d, i) => (
              <Text key={i} style={[styles.dayName, { color: colors.textMuted }]}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`empty_${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = checkins[key];
            const status = entry?.status;
            const isToday = key === todayKey;
            const bg = statusColor(status);

            return (
              <TouchableOpacity
                key={key}
                style={styles.dayCell}
                onPress={() => {
                  if (entry) navigation.navigate('DayDetail', { date: key, entry });
                }}
                activeOpacity={entry ? 0.7 : 1}
              >
                <View style={[
                  styles.dayInner,
                  bg && { backgroundColor: bg + '33' },
                  isToday && { borderWidth: 2, borderColor: colors.primary },
                ]}>
                  <Text style={[
                    styles.dayNum,
                    { color: bg ? bg : (isToday ? colors.primary : colors.textSecondary) },
                  ]}>
                    {day}
                  </Text>
                  {bg && <View style={[styles.dayDot, { backgroundColor: bg }]} />}
                  {status === 'grace' && (
                    <Text style={[styles.graceMark, { color: colors.success }]}>G</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          </View>

        </View>{/* end calendarCard */}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>Succes</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>Recădere</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>G = Zi de grație</Text>
          </View>
        </View>

        {/* Recent entries list */}
        <Text style={[styles.recentTitle, { color: colors.text }]}>Intrări recente</Text>
        {!hasAnyCheckin ? (
          <EmptyState
            icon=""
            title="Nicio zi înregistrată"
            subtitle="Marchează prima ta zi și construiește-ți istoricul."
          />
        ) : (
          Object.entries(checkins)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 15)
            .map(([date, entry]) => {
              const bg = statusColor(entry.status);
              return (
                <TouchableOpacity
                  key={date}
                  style={[styles.entryRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
                  onPress={() => navigation.navigate('DayDetail', { date, entry })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.entryStatus, { backgroundColor: bg || colors.border }]} />
                  <View style={styles.entryContent}>
                    <Text style={[styles.entryDate, { color: colors.textSecondary }]}>{date}</Text>
                    <Text style={[styles.entryNote, { color: colors.textMuted }]} numberOfLines={1}>
                      {entry.status === 'grace'
                        ? '🛡️ Zi de grație'
                        : entry.status === 'success'
                        ? entry.note || 'Zi reușită'
                        : entry.trigger
                        ? `Trigger: ${entry.trigger}`
                        : 'Recădere'}
                    </Text>
                  </View>
                  <Text style={[styles.entryBadge, { color: bg || colors.textMuted }]}>
                    {entry.status === 'success' ? '✅' : entry.status === 'grace' ? '🛡️' : '⚠️'}
                  </Text>
                </TouchableOpacity>
              );
            })
        )}
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
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  calendarCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  navBtn: {
    padding: 8,
  },
  navArrow: {
    fontSize: 24,
    fontWeight: '700',
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  calendarHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  graceMark: {
    fontSize: 7,
    fontWeight: '800',
    position: 'absolute',
    bottom: 2,
    right: 3,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
  },
  entryStatus: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  entryContent: {
    flex: 1,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  entryNote: {
    fontSize: 13,
  },
  entryBadge: {
    fontSize: 20,
  },
});
