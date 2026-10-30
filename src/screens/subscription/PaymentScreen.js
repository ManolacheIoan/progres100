import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Animated, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

const STEP_METHOD   = 'method';
const STEP_PROCESS  = 'processing';
const STEP_SUCCESS  = 'success';

function formatCardNumber(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

export default function PaymentScreen({ navigation, route }) {
  const colors = useColors();
  const { activatePremium } = useApp();
  const plan = route.params?.plan || { label: 'Anual', price: '59,99 RON', per: '/ an' };

  const [step, setStep]           = useState(STEP_METHOD);
  const [method, setMethod]       = useState(null); // 'apple' | 'card'
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]       = useState('');
  const [cvv, setCvv]             = useState('');
  const [name, setName]           = useState('');
  const [error, setError]         = useState('');

  // Success animation
  const checkScale   = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const ringScale    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === STEP_SUCCESS) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(ringScale,  { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
          Animated.timing(checkOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [step]);

  function canPay() {
    if (method === 'apple') return true;
    const digits = cardNumber.replace(/\s/g, '');
    return digits.length === 16 && expiry.length === 5 && cvv.length >= 3 && name.trim().length > 1;
  }

  async function handlePay() {
    setError('');
    if (!method) { setError('Selectează o metodă de plată.'); return; }
    if (method === 'card' && !canPay()) { setError('Completează toate câmpurile cardului.'); return; }

    setStep(STEP_PROCESS);
    await new Promise((r) => setTimeout(r, 2200));
    await activatePremium(plan);
    setStep(STEP_SUCCESS);
  }

  if (step === STEP_PROCESS) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.processingText, { color: colors.textMuted }]}>Se procesează plata…</Text>
      </View>
    );
  }

  if (step === STEP_SUCCESS) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Animated.View style={[
            styles.successRing,
            { borderColor: colors.success, transform: [{ scale: ringScale }] },
          ]}>
            <Animated.Text style={[
              styles.successCheck,
              { color: colors.success, opacity: checkOpacity, transform: [{ scale: checkScale }] },
            ]}>✓</Animated.Text>
          </Animated.View>

          <Text style={[styles.successTitle, { color: colors.text }]}>Plată reușită!</Text>
          <Text style={[styles.successSub, { color: colors.textMuted }]}>
            Progres 100 Premium este acum activ.{'\n'}
            Bucură-te de obiceiuri nelimitate! 🎉
          </Text>

          <View style={[styles.successPlanCard, { backgroundColor: colors.card, borderColor: colors.success }]}>
            <Text style={styles.successPlanEmoji}>👑</Text>
            <View>
              <Text style={[styles.successPlanLabel, { color: colors.text }]}>Plan {plan.label}</Text>
              <Text style={[styles.successPlanPrice, { color: colors.success }]}>{plan.price} {plan.per}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.successBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.85}
          >
            <Text style={styles.successBtnText}>Înapoi la aplicație</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>Finalizare plată</Text>
          <View style={[styles.planSummary, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
            <Text style={styles.planSummaryEmoji}>👑</Text>
            <Text style={[styles.planSummaryText, { color: colors.primary }]}>
              Premium {plan.label} — {plan.price} {plan.per}
            </Text>
          </View>

          {/* Apple Pay */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Metodă de plată</Text>

          <TouchableOpacity
            onPress={() => setMethod('apple')}
            style={[
              styles.applePayBtn,
              { borderColor: method === 'apple' ? colors.primary : colors.border,
                backgroundColor: method === 'apple' ? '#000' : colors.card },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.applePayText, { color: method === 'apple' ? '#fff' : colors.text }]}>
               Apple Pay
            </Text>
            {method === 'apple' && (
              <View style={[styles.methodCheck, { backgroundColor: colors.primary }]}>
                <Text style={styles.methodCheckText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.textMuted }]}>sau</Text>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Card */}
          <TouchableOpacity
            onPress={() => setMethod('card')}
            activeOpacity={0.7}
            style={[
              styles.cardMethodBtn,
              { backgroundColor: colors.card, borderColor: method === 'card' ? colors.primary : colors.border },
            ]}
          >
            <Text style={[styles.cardMethodLabel, { color: method === 'card' ? colors.primary : colors.textSecondary }]}>
              💳  Card bancar
            </Text>
            {method === 'card' && (
              <View style={[styles.methodCheck, { backgroundColor: colors.primary }]}>
                <Text style={styles.methodCheckText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          {method === 'card' && (
            <View style={[styles.cardForm, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              {/* Card number */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Număr card</Text>
              <TextInput
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                maxLength={19}
              />

              <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Expiră</Text>
                  <TextInput
                    value={expiry}
                    onChangeText={(t) => setExpiry(formatExpiry(t))}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    maxLength={5}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>CVV</Text>
                  <TextInput
                    value={cvv}
                    onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    secureTextEntry
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    maxLength={4}
                  />
                </View>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nume titular</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ion Popescu"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              />
            </View>
          )}

          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: method ? colors.primary : colors.border }]}
            onPress={handlePay}
            activeOpacity={0.85}
            disabled={!method}
          >
            <Text style={styles.payBtnText}>
              {method === 'apple' ? ' Plătește cu Apple Pay' : '💳 Plătește acum'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <Text style={[styles.secureText, { color: colors.textDisabled }]}>🔒 Plată securizată · SSL 256-bit</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 16 },
  planSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 14, borderWidth: 1.5, marginBottom: 28,
  },
  planSummaryEmoji: { fontSize: 22 },
  planSummaryText: { fontSize: 14, fontWeight: '700' },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 12 },
  applePayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 16, borderWidth: 2, marginBottom: 4, gap: 8,
  },
  applePayText: { fontSize: 17, fontWeight: '700' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13 },
  cardMethodBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 18, borderWidth: 2, marginBottom: 16,
  },
  cardMethodLabel: { fontSize: 15, fontWeight: '700' },
  methodCheck: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  methodCheckText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  cardForm: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 4, marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  fieldHalf: { flex: 1 },
  input: { borderRadius: 10, borderWidth: 1, padding: 13, fontSize: 15 },
  errorText: { fontSize: 13, marginBottom: 12, fontWeight: '600' },
  payBtn: {
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginBottom: 12,
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secureRow: { alignItems: 'center' },
  secureText: { fontSize: 12 },
  // Processing
  processingText: { marginTop: 20, fontSize: 16 },
  // Success
  successRing: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  successCheck: { fontSize: 56, fontWeight: '900', lineHeight: 64 },
  successTitle: { fontSize: 28, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 32 },
  successPlanCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 16, padding: 18, borderWidth: 2, marginBottom: 36, alignSelf: 'stretch',
  },
  successPlanEmoji: { fontSize: 30 },
  successPlanLabel: { fontSize: 15, fontWeight: '700' },
  successPlanPrice: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  successBtn: { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center' },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
