import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import { TRIGGERS } from '../../constants/triggers';
import { RECOMMENDATIONS } from '../../constants/recommendations';
import Button from '../../components/Button';
import Input from '../../components/Input';
import IntensitySelector from '../../components/IntensitySelector';
import aiService from '../../services/aiService';

export default function UrgeModeScreen({ navigation }) {
  const { adaugaImpuls, actualizeazaRezultat, activeHabit } = useApp();
  const colors = useColors();
  const scrollRef = useRef(null);

  const [step, setStep] = useState('log');
  const [intensity, setIntensity] = useState(3);
  const [cause, setCause] = useState('');
  const [note, setNote] = useState('');
  const [savedUrgeId, setSavedUrgeId] = useState(null);
  const [loading, setLoading] = useState(false);

  // AI support state
  const [aiText, setAiText] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLocalIndex, setAiLocalIndex] = useState(-1);

  const habitName = activeHabit?.habitName || activeHabit?.name || 'obiceiul';
  const severity = activeHabit?.severity || 'medium';
  const recs = RECOMMENDATIONS[severity] || RECOMMENDATIONS.medium;
  const quickActions = recs.slice(0, 5).map((r) => ({ id: r.id, label: r.title, emoji: r.emoji, desc: r.desc }));

  async function fetchAiMessage(excludeIndex = -1) {
    setAiLoading(true);
    setAiText(null);
    const result = await aiService.getSupportMessage({ habitName, trigger: cause, intensity, note }, excludeIndex);
    setAiText(result.text);
    setAiLocalIndex(result.localIndex);
    setAiLoading(false);
  }

  const handleLogUrge = async () => {
    setLoading(true);
    try {
      const impuls = await adaugaImpuls({ intensity, cause, note });
      setSavedUrgeId(impuls?.id);
      setStep('actions');
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      fetchAiMessage();
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut înregistra impulsul.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAi = () => fetchAiMessage(aiLocalIndex);

  const handleOutcome = async (resisted) => {
    try {
      if (savedUrgeId) await actualizeazaRezultat(savedUrgeId, resisted);
      if (resisted) {
        Alert.alert(
          '💪 Ai rezistat!',
          'Felicitări! Fiecare impuls rezisrat te întărește. Streakul tău continuă!',
          [{ text: 'Excelent!', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Înregistrat',
          'Vrei să marchezi și o recădere pentru ziua de azi?',
          [
            {
              text: 'Da, marchează recădere',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => navigation.navigate('RelapseCheckin'), 100);
              },
            },
            { text: 'Nu acum', onPress: () => navigation.goBack() },
          ]
        );
      }
    } catch {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.textMuted }]}>✕ Închide</Text>
        </TouchableOpacity>

        {/* Pasul 1: Înregistrează impulsul */}
        {step === 'log' && (
          <>
            <View style={styles.hero}>
              <Text style={styles.heroIcon}>⚡</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Mod Impuls</Text>
              {activeHabit && (
                <Text style={[styles.heroHabit, { color: colors.textMuted }]}>
                  {activeHabit.habitIcon || activeHabit.icon || '🎯'} {habitName}
                </Text>
              )}
              <Text style={[styles.heroSub, { color: colors.textMuted }]}>
                Înregistrează impulsul. Asta îl slăbește.
              </Text>
            </View>

            <View style={[styles.breatheBox, { backgroundColor: colors.accentFaded, borderColor: colors.accent }]}>
              <Text style={[styles.breatheText, { color: colors.accent }]}>
                🌬️ Înainte de orice, respiră adânc. Inspira 4 secunde, ține 4, expiră 4.
              </Text>
            </View>

            <IntensitySelector
              label="Cât de intens este impulsul?"
              value={intensity}
              onChange={setIntensity}
            />

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Ce l-a declanșat?</Text>
            <View style={styles.triggersGrid}>
              {TRIGGERS.map((t) => {
                const active = cause === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setCause(t.id)}
                    style={[
                      styles.triggerBtn,
                      { backgroundColor: active ? colors.warningFaded : colors.card },
                      { borderColor: active ? colors.warning : colors.border },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.triggerIcon}>{t.icon}</Text>
                    <Text style={[styles.triggerLabel, { color: active ? colors.warning : colors.textSecondary }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Notă rapidă (opțional)"
              value={note}
              onChangeText={setNote}
              placeholder="Ce se întâmplă în mintea ta?"
              multiline
              numberOfLines={3}
            />

            <Button
              label="Înregistrează și primește ajutor ⚡"
              onPress={handleLogUrge}
              variant="warning"
              loading={loading}
            />
          </>
        )}

        {/* STEP 2: Quick actions */}
        {step === 'actions' && (
          <>
            <View style={styles.hero}>
              <Text style={styles.heroIcon}>💪</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Acționează acum</Text>
              <Text style={[styles.heroSub, { color: colors.textMuted }]}>
                Alege ceva care te ajută să rezisti
              </Text>
            </View>

            {/* AI support card */}
            <View style={[styles.aiCard, { backgroundColor: colors.card, borderColor: colors.warning }]}>
              <View style={styles.aiCardHeader}>
                <Text style={styles.aiCardIcon}>⚡</Text>
                <Text style={[styles.aiCardTitle, { color: colors.warning }]}>Ajutor imediat</Text>
              </View>
              {aiLoading ? (
                <ActivityIndicator size="small" color={colors.warning} style={styles.aiLoader} />
              ) : (
                <>
                  <Text style={[styles.aiCardText, { color: colors.textSecondary }]}>{aiText}</Text>
                  <TouchableOpacity onPress={handleRetryAi} style={styles.retryBtn} activeOpacity={0.7}>
                    <Text style={[styles.retryBtnText, { color: colors.warning }]}>↻ Mai încearcă o sugestie</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {severity === 'high' && (
              <View style={[styles.severityAlert, { backgroundColor: colors.dangerFaded, borderColor: colors.danger }]}>
                <Text style={[styles.severityAlertText, { color: colors.danger }]}>
                  🔴 Nivel sever detectat. Consideră să contactezi pe cineva de încredere.
                </Text>
              </View>
            )}

            {quickActions.map((action) => (
              <View
                key={action.id}
                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                  <Text style={[styles.actionDesc, { color: colors.textMuted }]}>{action.desc}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.waitText, { color: colors.textMuted }]}>
              Impulsul va scade în intensitate. Rezistă câteva minute.
            </Text>

            <Button
              label="Am trecut prin asta!"
              onPress={() => setStep('outcome')}
              style={styles.nextBtn}
            />
          </>
        )}

        {/* STEP 3: Outcome */}
        {step === 'outcome' && (
          <>
            <View style={styles.hero}>
              <Text style={styles.heroIcon}>🏁</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Ce s-a întâmplat?</Text>
              <Text style={[styles.heroSub, { color: colors.textMuted }]}>
                Nu există răspuns greșit. Suntem sinceri cu noi.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.outcomeBtn, { backgroundColor: colors.successFaded, borderColor: colors.success }]}
              onPress={() => handleOutcome(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.outcomeIcon}>💪</Text>
              <View style={styles.outcomeContent}>
                <Text style={[styles.outcomeLabel, { color: colors.success }]}>Am rezistat!</Text>
                <Text style={[styles.outcomeSub, { color: colors.textMuted }]}>Nu am cedat impulsului</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outcomeBtn, { backgroundColor: colors.dangerFaded, borderColor: colors.danger }]}
              onPress={() => handleOutcome(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.outcomeIcon}>😔</Text>
              <View style={styles.outcomeContent}>
                <Text style={[styles.outcomeLabel, { color: colors.danger }]}>Nu am rezistat</Text>
                <Text style={[styles.outcomeSub, { color: colors.textMuted }]}>
                  A fost prea puternic de această dată
                </Text>
              </View>
            </TouchableOpacity>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  closeText: {
    fontSize: 15,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
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
  heroSub: {
    fontSize: 14,
    textAlign: 'center',
  },
  breatheBox: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
  },
  breatheText: {
    fontSize: 14,
    lineHeight: 21,
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
    marginBottom: 20,
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
    fontSize: 15,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  severityAlert: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  severityAlertText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  waitText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 20,
  },
  nextBtn: {
    marginTop: 8,
  },
  outcomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  outcomeIcon: {
    fontSize: 36,
  },
  outcomeContent: {
    flex: 1,
  },
  outcomeLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  outcomeSub: {
    fontSize: 13,
    marginTop: 2,
  },

  // AI support card
  aiCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiCardIcon: {
    fontSize: 18,
  },
  aiCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  aiLoader: {
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  aiCardText: {
    fontSize: 14,
    lineHeight: 22,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
