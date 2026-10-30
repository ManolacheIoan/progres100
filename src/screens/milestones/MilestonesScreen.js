import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import ProgressBar from '../../components/ProgressBar';

export default function MilestonesScreen({ navigation }) {
  const { milestones, loadAll, activeHabitId } = useApp();
  const colors = useColors();

  useFocusEffect(
    useCallback(() => { loadAll(); }, [activeHabitId])
  );

  const achieved = milestones.filter((m) => m.achieved);
  const pending = milestones.filter((m) => !m.achieved);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Etape</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {achieved.length} din {milestones.length} realizate
        </Text>

        {achieved.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>REALIZATE</Text>
            {achieved.map((m) => (
              <MilestoneCard key={m.id} milestone={m} achieved colors={colors} />
            ))}
          </>
        )}

        {pending.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ÎN PROGRES</Text>
            {pending.map((m) => (
              <MilestoneCard key={m.id} milestone={m} colors={colors} />
            ))}
          </>
        )}

        {milestones.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Nicio etapă disponibilă. Adaugă un obicei pentru a vedea etapele.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MilestoneCard({ milestone, achieved = false, colors }) {
  const progress = milestone.progress || 0;
  const streak = milestone.currentStreak || 0;
  const remaining = Math.max(0, milestone.days - streak);

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: achieved ? colors.warningFaded : colors.card,
        borderColor: achieved ? colors.warning : colors.borderLight,
      },
    ]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardIcon, !achieved && { opacity: 0.4 }]}>
          {achieved ? milestone.icon : '🔒'}
        </Text>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardLabel, { color: achieved ? colors.text : colors.textSecondary }]}>
            {milestone.label}
          </Text>
          <Text style={[styles.cardDays, { color: colors.textMuted }]}>{milestone.days} zile</Text>
        </View>
        {achieved && (
          <View style={[styles.checkBadge, { backgroundColor: colors.warning }]}>
            <Text style={[styles.checkText, { color: colors.black }]}>✓</Text>
          </View>
        )}
      </View>

      <Text style={[styles.cardDesc, { color: achieved ? colors.text : colors.textMuted }]}>
        {milestone.description}
      </Text>

      {achieved && milestone.achievedAt ? (
        <Text style={[styles.achievedAt, { color: colors.warning }]}>
          Realizat pe {new Date(milestone.achievedAt).toLocaleDateString('ro-RO')}
        </Text>
      ) : null}

      {!achieved && (
        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            color={progress > 0.5 ? colors.success : colors.primary}
            height={6}
          />
          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            {streak}/{milestone.days} zile{remaining > 0 ? ` — mai sunt ${remaining} zile` : ''}
          </Text>
        </View>
      )}
    </View>
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
    gap: 12,
  },
  backBtn: {
    marginBottom: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    fontSize: 36,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '800',
  },
  cardDays: {
    fontSize: 13,
    marginTop: 2,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievedAt: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    gap: 6,
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
  },
});
