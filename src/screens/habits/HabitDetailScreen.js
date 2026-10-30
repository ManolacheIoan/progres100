import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import statsService from '../../services/statsService';
import checkinService, { dateKey } from '../../services/checkinService';
import { getExercisesForHabit } from '../../constants/exercises';
import { getQuoteForHabit } from '../../constants/quotes';
import { getGuideForHabit } from '../../constants/guide';
import storage from '../../services/storageService';
import { getSeverityColor, getSeverityLabel } from '../../components/SeverityBadge';
import { getHabitName, getHabitIcon } from '../../utils/habitUtils';

function getNextMilestone(streak) {
  return [1, 3, 7, 14, 21, 30, 60, 90, 180, 365].find((m) => m > streak) || null;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HabitDetailScreen({ navigation }) {
  const { activeHabit, activeHabitId, applyGraceDay, loadAll } = useApp();
  const colors = useColors();

  const [stats, setStats] = useState(null);
  const [todayStatus, setTodayStatus] = useState('none');
  const [recentActivity, setRecentActivity] = useState([]);
  const [showGuide, setShowGuide] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!activeHabitId) return;
      async function load() {
        const [statistici, checkins, dismissed] = await Promise.all([
          statsService.getFullStats(activeHabitId),
          checkinService.getAllCheckins(activeHabitId),
          storage.get(`@progres100:guide_dismissed_${activeHabitId}`),
        ]);
        setStats(statistici);
        setShowGuide(!dismissed);
        const status = checkins[dateKey(new Date())]?.status || 'none';
        setTodayStatus(status);
        const sorted = Object.values(checkins)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5);
        setRecentActivity(sorted);
      }
      load();
    }, [activeHabitId])
  );

  const handleDismissGuide = async () => {
    setShowGuide(false);
    await storage.set(`@progres100:guide_dismissed_${activeHabitId}`, true);
  };

  if (!activeHabit) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.emptyCenter}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Niciun obicei selectat.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const severity = activeHabit.severity || 'medium';
  const category = activeHabit.category || activeHabit.habitId || 'other';
  const exercises = getExercisesForHabit(category, severity);
  const quote = getQuoteForHabit(category);
  const guide = getGuideForHabit(category);
  const currentStreak = stats?.currentStreak ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;
  const nextMilestone = getNextMilestone(currentStreak);
  const milestoneProgress = nextMilestone ? currentStreak / nextMilestone : 1;

  function getTodayStatusInfo() {
    if (todayStatus === 'success') return { label: '✅ Zi reușită', color: colors.success, bg: colors.successFaded };
    if (todayStatus === 'grace') return { label: '🛡️ Zi de grație', color: colors.success, bg: colors.successFaded };
    if (todayStatus === 'relapse') return { label: '⚠️ Recădere înregistrată', color: colors.danger, bg: colors.dangerFaded };
    return { label: '⏳ Neînregistrat astăzi', color: colors.textMuted, bg: colors.card };
  }

  function getActivityIcon(status) {
    if (status === 'success') return '✅';
    if (status === 'grace') return '🛡️';
    if (status === 'relapse') return '⚠️';
    return '📅';
  }

  function getActivityColor(status) {
    if (status === 'success' || status === 'grace') return colors.success;
    if (status === 'relapse') return colors.danger;
    return colors.textMuted;
  }

  function getStatusLabel(status) {
    if (status === 'success') return 'Reușit';
    if (status === 'grace') return 'Grație';
    if (status === 'relapse') return 'Recădere';
    return status;
  }

  const statusInfo = getTodayStatusInfo();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>{getHabitIcon(activeHabit)}</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {getHabitName(activeHabit)}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Severity badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(severity, colors) + '22' }]}>
            <View style={[styles.severityDot, { backgroundColor: getSeverityColor(severity, colors) }]} />
            <Text style={[styles.severityText, { color: getSeverityColor(severity, colors) }]}>
              {getSeverityLabel(severity)}
            </Text>
          </View>
          {activeHabit?.reason ? (
            <Text style={[styles.reasonPreview, { color: colors.textMuted }]} numberOfLines={1}>
              💭 {activeHabit.reason}
            </Text>
          ) : null}
        </View>

        {/* Streak card */}
        <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.streakMain}>
            <View style={styles.streakBlock}>
              <Text style={[styles.streakNumber, { color: colors.primary }]}>{currentStreak}</Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>zile consecutive</Text>
            </View>
            <View style={[styles.streakDivider, { backgroundColor: colors.border }]} />
            <View style={styles.streakBlock}>
              <Text style={[styles.bestStreakNumber, { color: colors.warning }]}>{bestStreak}</Text>
              <Text style={[styles.streakLabel, { color: colors.textMuted }]}>record personal</Text>
            </View>
          </View>

          {nextMilestone ? (
            <View style={styles.milestoneRow}>
              <View style={styles.milestoneTextRow}>
                <Text style={[styles.milestoneLabel, { color: colors.textMuted }]}>
                  Următor: {nextMilestone} zile
                </Text>
                <Text style={[styles.milestonePercent, { color: colors.primary }]}>
                  {Math.round(milestoneProgress * 100)}%
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, {
                  backgroundColor: colors.primary,
                  width: `${Math.round(milestoneProgress * 100)}%`,
                }]} />
              </View>
            </View>
          ) : (
            <Text style={[styles.allMilestonesText, { color: colors.success }]}>
              🏆 Toate etapele atinse!
            </Text>
          )}
        </View>

        {/* Today status */}
        <View style={[styles.todayCard, { backgroundColor: statusInfo.bg, borderColor: statusInfo.color + '44' }]}>
          <Text style={[styles.todayStatus, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          {todayStatus === 'none' && (
            <Text style={[styles.todayHint, { color: colors.textMuted }]}>
              Marchează ziua de azi mai jos
            </Text>
          )}
        </View>

        {/* How-to guide */}
        {showGuide && (
          <View style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={styles.guideTitleRow}>
              <Text style={[styles.guideTitle, { color: colors.text }]}>📋 Cum completezi</Text>
              <TouchableOpacity onPress={handleDismissGuide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.guideDismiss, { color: colors.textMuted }]}>Nu mai afișa</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.guideWhat, { color: colors.textMuted }]}>{guide.what}</Text>
            {guide.steps.map((step, idx) => (
              <View key={idx} style={[styles.guideStep, idx < guide.steps.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                <Text style={styles.guideStepEmoji}>{step.emoji}</Text>
                <View style={styles.guideStepContent}>
                  <Text style={[styles.guideStepWhen, { color: colors.primary }]}>{step.when}</Text>
                  <Text style={[styles.guideStepHow, { color: colors.textSecondary }]}>{step.how}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Main actions */}
        {todayStatus === 'none' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.successFaded, borderColor: colors.success }]}
              onPress={() => navigation.navigate('SuccessCheckin')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>✅</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Zi reușită</Text>
              <Text style={[styles.actionSub, { color: colors.textMuted }]}>Am rezistat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.dangerFaded, borderColor: colors.danger }]}
              onPress={() => navigation.navigate('RelapseCheckin')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>⚠️</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Recădere</Text>
              <Text style={[styles.actionSub, { color: colors.textMuted }]}>A fost greu</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Grace day */}
        {todayStatus === 'none' && !activeHabit.graceDayUsed && (
          <TouchableOpacity
            style={[styles.graceBtn, { backgroundColor: colors.accentFaded, borderColor: colors.accent }]}
            onPress={() => {
              Alert.alert(
                '🛡️ Zi de grație',
                'Folosești singura ta zi de grație pentru acest obicei. Streak-ul continuă dar nu vei mai putea folosi această opțiune.',
                [
                  { text: 'Anulează', style: 'cancel' },
                  { text: 'Folosește', onPress: () => applyGraceDay().then(loadAll) },
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.graceIcon}>🛡️</Text>
            <View style={styles.graceContent}>
              <Text style={[styles.graceLabel, { color: colors.accent }]}>Zi de grație</Text>
              <Text style={[styles.graceSub, { color: colors.textMuted }]}>
                Păstrează streak-ul fără să marchezi ziua (1 utilizare)
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Urge mode */}
        <TouchableOpacity
          style={[styles.btnImpuls, { backgroundColor: colors.warningFaded, borderColor: colors.warning }]}
          onPress={() => navigation.navigate('UrgeMode')}
          activeOpacity={0.8}
        >
          <Text style={styles.iconImpuls}>⚡</Text>
          <View style={styles.continutImpuls}>
            <Text style={[styles.labelImpuls, { color: colors.text }]}>Simt un impuls acum</Text>
            <Text style={[styles.subImpuls, { color: colors.textMuted }]}>Înregistrează și rezistă impulsului</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>

        {/* Exercises for this habit + severity */}
        {exercises.length > 0 && (
          <View style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.recTitle, { color: colors.text }]}>🧠 Exerciții recomandate</Text>
            <Text style={[styles.recSubtitle, { color: colors.textMuted }]}>
              Bazate pe psihologie, pentru nivelul tău de severitate
            </Text>
            {exercises.map((ex, idx) => (
              <View
                key={ex.id}
                style={[
                  styles.exerciseRow,
                  idx < exercises.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.exerciseIconBox, { backgroundColor: colors.primaryFaded }]}>
                  <Text style={styles.recEmoji}>{ex.emoji}</Text>
                </View>
                <View style={styles.recContent}>
                  <Text style={[styles.recName, { color: colors.text }]}>{ex.title}</Text>
                  <Text style={[styles.recDesc, { color: colors.textMuted }]}>{ex.desc}</Text>
                  <Text style={[styles.recDuration, { color: colors.primary }]}>⏱️ {ex.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick stats */}
        <View style={styles.quickStatsRow}>
          <View style={[styles.quickStatBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.quickStatValue, { color: colors.success }]}>{stats?.successRate7 ?? 0}%</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Succes 7z</Text>
          </View>
          <View style={[styles.quickStatBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.quickStatValue, { color: colors.success }]}>{stats?.successRate30 ?? 0}%</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Succes 30z</Text>
          </View>
          <View style={[styles.quickStatBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.quickStatValue, { color: colors.danger }]}>{stats?.totalRelapses ?? 0}</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Recăderi</Text>
          </View>
        </View>

        {/* Section links */}
        <View style={[styles.linksCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          {[
            { icon: '🏆', label: 'Etape', screen: 'Milestones' },
            { icon: '📓', label: 'Jurnal', screen: 'Journal' },
            { icon: '📚', label: 'Resurse', screen: 'Resources' },
          ].map((item, idx, arr) => (
            <TouchableOpacity
              key={item.screen}
              style={[
                styles.linkRow,
                idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkIcon}>{item.icon}</Text>
              <Text style={[styles.linkLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent activity */}
        {recentActivity.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activitate recentă</Text>
            {recentActivity.map((entry) => (
              <View
                key={entry.date}
                style={[styles.activityRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                <Text style={styles.activityIcon}>{getActivityIcon(entry.status)}</Text>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityDate, { color: colors.textSecondary }]}>{entry.date}</Text>
                  {entry.note ? (
                    <Text style={[styles.activityNote, { color: colors.textMuted }]} numberOfLines={1}>
                      {entry.note}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.activityBadge, { backgroundColor: getActivityColor(entry.status) + '22' }]}>
                  <Text style={[styles.activityStatus, { color: getActivityColor(entry.status) }]}>
                    {getStatusLabel(entry.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Motivational quote */}
        {quote && (
          <View style={[styles.quoteCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
            <Text style={[styles.quoteText, { color: colors.text }]}>„{quote.text}"</Text>
            <Text style={[styles.quoteAuthor, { color: colors.primary }]}>— {quote.author}</Text>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 80,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    maxWidth: '70%',
  },
  headerRight: {
    width: 80,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reasonPreview: {
    flex: 1,
    fontSize: 12,
  },
  streakCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  streakBlock: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 62,
    fontWeight: '900',
    lineHeight: 70,
  },
  bestStreakNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  streakDivider: {
    width: 1,
    height: 56,
  },
  milestoneRow: {
    gap: 6,
  },
  milestoneTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneLabel: {
    fontSize: 12,
  },
  milestonePercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  allMilestonesText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  todayCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  todayStatus: {
    fontSize: 15,
    fontWeight: '700',
  },
  todayHint: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 11,
    textAlign: 'center',
  },
  graceBtn: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  graceIcon: {
    fontSize: 22,
  },
  graceContent: {
    flex: 1,
  },
  graceLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  graceSub: {
    fontSize: 12,
    marginTop: 2,
  },
  btnImpuls: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  iconImpuls: {
    fontSize: 22,
  },
  continutImpuls: {
    flex: 1,
  },
  labelImpuls: {
    fontSize: 14,
    fontWeight: '700',
  },
  subImpuls: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
  },
  recCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  recSubtitle: {
    fontSize: 12,
    marginTop: -6,
    marginBottom: 4,
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  exerciseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  recEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  recContent: {
    flex: 1,
    gap: 4,
  },
  recName: {
    fontSize: 15,
    fontWeight: '700',
  },
  recDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  recDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickStatBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  linksCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  linkIcon: {
    fontSize: 20,
  },
  linkLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  recentSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityNote: {
    fontSize: 12,
  },
  activityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activityStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  guideCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  guideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  guideDismiss: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  guideWhat: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  guideStep: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  guideStepEmoji: {
    fontSize: 20,
    marginTop: 1,
    width: 24,
    textAlign: 'center',
  },
  guideStepContent: {
    flex: 1,
    gap: 3,
  },
  guideStepWhen: {
    fontSize: 13,
    fontWeight: '700',
  },
  guideStepHow: {
    fontSize: 12,
    lineHeight: 17,
  },
  quoteCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    gap: 8,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
});
