import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

const PLANS = [
  {
    id: 'monthly',
    label: 'Lunar',
    price: '9,99',
    currency: 'RON',
    per: '/ lună',
    badge: null,
    bestValue: false,
  },
  {
    id: 'annual',
    label: 'Anual',
    price: '59,99',
    currency: 'RON',
    per: '/ an',
    badge: 'CEL MAI BUN PREȚ',
    bestValue: true,
    monthly: '≈ 5,00 RON / lună',
  },
];

const PREMIUM_FEATURES = [
  { emoji: '∞',  text: 'Obiceiuri nelimitate' },
  { emoji: '📊', text: 'Statistici avansate' },
  { emoji: '🔔', text: 'Reminder-uri personalizate' },
  { emoji: '📝', text: 'Jurnal & note detaliate' },
  { emoji: '🏆', text: 'Etape exclusive' },
  { emoji: '☁️', text: 'Backup & sincronizare' },
  { emoji: '🚫', text: 'Fără reclame' },
  { emoji: '⚡', text: 'Suport prioritar' },
];

const FREE_FEATURES = [
  { emoji: '🎯', text: '1 obicei urmărit' },
  { emoji: '✅', text: 'Check-in zilnic' },
  { emoji: '📈', text: 'Statistici de bază' },
  { emoji: '🔥', text: 'Streak & calendar' },
];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function SubscriptionScreen({ navigation }) {
  const colors = useColors();
  const { isPremium, settings, cancelPremium } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('annual');

  function handleSubscribe() {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    navigation.navigate('Payment', { plan });
  }

  function handleRestore() {
    Alert.alert('Restaurare achiziții', 'Nu s-au găsit achiziții anterioare asociate acestui cont.');
  }

  function handleCancel() {
    Alert.alert(
      'Anulează abonamentul',
      `Abonamentul tău rămâne activ până la ${formatDate(settings?.premiumExpiresAt)}. După această dată nu vei fi debitat.`,
      [
        { text: 'Păstrează abonamentul', style: 'cancel' },
        {
          text: 'Anulează',
          style: 'destructive',
          onPress: async () => {
            await cancelPremium();
            Alert.alert('Anulat', `Abonamentul rămâne activ până la ${formatDate(settings?.premiumExpiresAt)}.`);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={[styles.crownCircle, { backgroundColor: colors.warning + '22' }]}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Progres 100 Premium</Text>
          {isPremium ? (
            <View style={[styles.activePill, { backgroundColor: colors.successFaded, borderColor: colors.success }]}>
              <Text style={[styles.activePillText, { color: colors.success }]}>✓ Abonament activ</Text>
            </View>
          ) : (
            <Text style={[styles.heroSub, { color: colors.textMuted }]}>
              Deblochează tot potențialul recuperării tale.
            </Text>
          )}
        </View>

        {/* Manage subscription — only when premium */}
        {isPremium && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Abonamentul tău</Text>
            <View style={[styles.manageCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <View style={styles.manageRow}>
                <View style={styles.manageItem}>
                  <Text style={[styles.manageLabel, { color: colors.textMuted }]}>Activat pe</Text>
                  <Text style={[styles.manageValue, { color: colors.text }]}>
                    {formatDate(settings?.premiumActivatedAt)}
                  </Text>
                </View>
                <View style={[styles.manageDivider, { backgroundColor: colors.borderLight }]} />
                <View style={styles.manageItem}>
                  <Text style={[styles.manageLabel, { color: colors.textMuted }]}>Valabil până</Text>
                  <Text style={[styles.manageValue, { color: colors.text }]}>
                    {formatDate(settings?.premiumExpiresAt)}
                  </Text>
                </View>
              </View>

              {settings?.premiumCancelled ? (
                <View style={[styles.cancelledNote, { backgroundColor: colors.dangerFaded, borderColor: colors.danger + '55' }]}>
                  <Text style={[styles.cancelledText, { color: colors.danger }]}>
                    Abonament anulat · rămâne activ până la {formatDate(settings?.premiumExpiresAt)}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.danger }]}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.danger }]}>Anulează abonamentul</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Plan cards */}
        {!isPremium && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Alege planul tău</Text>
            <View style={styles.planRow}>
              {PLANS.map((plan) => {
                const active = selectedPlan === plan.id;
                const accentColor = plan.bestValue ? colors.warning : colors.primary;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.planCard,
                      { backgroundColor: colors.card, borderColor: active ? accentColor : colors.border },
                    ]}
                  >
                    {plan.badge ? (
                      <View style={[styles.planBadge, { backgroundColor: active ? colors.warning : colors.border }]}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    ) : (
                      <View style={styles.planBadgePlaceholder} />
                    )}
                    <Text style={[styles.planLabel, { color: active ? accentColor : colors.textMuted }]}>
                      {plan.label}
                    </Text>
                    <View style={styles.planPriceRow}>
                      <Text style={[styles.planPrice, { color: active ? colors.text : colors.textSecondary }]}>
                        {plan.price}
                      </Text>
                      <Text style={[styles.planCurrency, { color: active ? colors.textMuted : colors.textDisabled }]}>
                        {' '}{plan.currency}
                      </Text>
                    </View>
                    <Text style={[styles.planPer, { color: colors.textMuted }]}>{plan.per}</Text>
                    {plan.monthly && (
                      <Text style={[styles.planMonthly, { color: active ? colors.success : colors.textDisabled }]}>
                        {plan.monthly}
                      </Text>
                    )}
                    <View style={[
                      styles.radio,
                      { borderColor: active ? accentColor : colors.border },
                    ]}>
                      {active && <View style={[styles.radioDot, { backgroundColor: accentColor }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Free vs Premium comparison */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ce primești</Text>

        <View style={[styles.compCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          {/* Column headers */}
          <View style={styles.compHeader}>
            <View style={styles.compHeaderSpacer} />
            <Text style={[styles.compHeaderCol, { color: colors.textMuted }]}>Gratuit</Text>
            <Text style={[styles.compHeaderCol, { color: colors.warning }]}>Premium</Text>
          </View>
          <View style={[styles.compDivider, { backgroundColor: colors.borderLight }]} />

          {/* Free-tier features */}
          {FREE_FEATURES.map((f, i) => (
            <View
              key={i}
              style={[styles.compRow, i % 2 === 0 && { backgroundColor: colors.surface + '88' }]}
            >
              <Text style={styles.compEmoji}>{f.emoji}</Text>
              <Text style={[styles.compText, { color: colors.textSecondary }]}>{f.text}</Text>
              <Text style={styles.compCheck}>✅</Text>
              <Text style={styles.compCheck}>✅</Text>
            </View>
          ))}

          <View style={[styles.compDivider, { backgroundColor: colors.borderLight }]} />

          {/* Premium-only features */}
          {PREMIUM_FEATURES.map((f, i) => (
            <View
              key={i}
              style={[styles.compRow, i % 2 === 0 && { backgroundColor: colors.surface + '88' }]}
            >
              <Text style={styles.compEmoji}>{f.emoji}</Text>
              <Text style={[styles.compText, { color: colors.textSecondary }]}>{f.text}</Text>
              <Text style={[styles.compX, { color: colors.textDisabled }]}>✕</Text>
              <Text style={styles.compCheck}>✅</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        {!isPremium && (
          <View style={[styles.ctaWrap, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <TouchableOpacity
              style={[
                styles.ctaBtn,
                { backgroundColor: selectedPlan === 'annual' ? colors.warning : colors.primary },
              ]}
              onPress={handleSubscribe}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>
                {selectedPlan === 'annual'
                  ? '👑 Abonează-te · 59,99 RON / an'
                  : '👑 Abonează-te · 9,99 RON / lună'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.legalNote, { color: colors.textDisabled }]}>
              Se reînnoiește automat. Anulezi oricând.
            </Text>
            <TouchableOpacity onPress={handleRestore}>
              <Text style={[styles.restoreText, { color: colors.primary }]}>
                Restaurează achizițiile
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48, gap: 20 },
  backBtn: { marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: '600' },

  // Hero
  hero: {
    borderRadius: 20, borderWidth: 1,
    padding: 28, alignItems: 'center', gap: 10,
  },
  crownCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  crownEmoji: { fontSize: 34 },
  heroTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  heroSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  activePill: {
    borderRadius: 20, borderWidth: 1.5,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  activePillText: { fontSize: 14, fontWeight: '700' },

  // Section title
  sectionTitle: { fontSize: 17, fontWeight: '800' },

  // Manage subscription
  manageCard: {
    borderRadius: 18, borderWidth: 1,
    padding: 18, gap: 16,
  },
  manageRow: { flexDirection: 'row', alignItems: 'center' },
  manageItem: { flex: 1, alignItems: 'center' },
  manageDivider: { width: 1, height: 36 },
  manageLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  manageValue: { fontSize: 15, fontWeight: '800' },
  cancelledNote: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  cancelledText: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  cancelBtn: {
    borderRadius: 12, borderWidth: 1.5,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700' },

  // Plans
  planRow: { flexDirection: 'row', gap: 12 },
  planCard: {
    flex: 1, borderRadius: 18, borderWidth: 2,
    padding: 16, alignItems: 'center', gap: 4,
    overflow: 'hidden',
  },
  planBadge: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4,
  },
  planBadgePlaceholder: { height: 22, marginBottom: 4 },
  planBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  planLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  planPriceRow: { flexDirection: 'row', alignItems: 'center' },
  planPrice: { fontSize: 26, fontWeight: '900', lineHeight: 30 },
  planCurrency: { fontSize: 13, fontWeight: '600' },
  planPer: { fontSize: 11 },
  planMonthly: { fontSize: 11, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },

  // Comparison table
  compCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  compHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
  },
  compHeaderSpacer: { flex: 1 },
  compHeaderCol: { width: 52, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  compDivider: { height: 1 },
  compRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11, gap: 10,
  },
  compEmoji: { fontSize: 16, width: 24, textAlign: 'center' },
  compText: { flex: 1, fontSize: 13 },
  compCheck: { fontSize: 14, width: 52, textAlign: 'center' },
  compX: { fontSize: 13, width: 52, textAlign: 'center', fontWeight: '700' },

  // CTA box
  ctaWrap: {
    borderRadius: 20, borderWidth: 1,
    padding: 20, alignItems: 'center', gap: 12,
  },
  ctaBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', alignSelf: 'stretch',
  },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  legalNote: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  restoreText: { fontSize: 13, fontWeight: '600' },
});
