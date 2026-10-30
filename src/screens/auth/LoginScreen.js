import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView,
  Platform, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen({ navigation }) {
  const { login, continueAsGuest } = useAuth();
  const colors = useColors();
  const s = makeStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email-ul este obligatoriu';
    if (!password) e.password = 'Parola este obligatorie';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Eroare', err.message || 'Autentificare eșuată.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      await continueAsGuest();
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut continua ca vizitator.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.flex}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <Text style={[s.logo, { color: colors.primary }]}>Progres 100</Text>
            <Text style={[s.tagline, { color: colors.textMuted }]}>Schimbarea ta, zi cu zi.</Text>
          </View>

          <View style={s.form}>
            <Text style={[s.title, { color: colors.text }]}>Bun venit înapoi</Text>
            <Text style={[s.subtitle, { color: colors.textMuted }]}>
              Autentifică-te pentru a continua progresul
            </Text>
            <Input label="Email" value={email} onChangeText={setEmail}
              placeholder="adresa@email.com" keyboardType="email-address" error={errors.email} />
            <Input label="Parolă" value={password} onChangeText={setPassword}
              placeholder="Parola ta" secureTextEntry error={errors.password} />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.forgotBtn}>
              <Text style={[s.forgotText, { color: colors.primary }]}>Ai uitat parola?</Text>
            </TouchableOpacity>
            <Button label="Autentifică-te" onPress={handleLogin} loading={loading} style={s.loginBtn} />
          </View>

          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[s.dividerText, { color: colors.textMuted }]}>sau</Text>
            <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Guest mode */}
          <TouchableOpacity
            style={[s.guestBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleGuest}
            activeOpacity={0.7}
          >
            <Text style={s.guestEmoji}>👀</Text>
            <View style={s.guestContent}>
              <Text style={[s.guestTitle, { color: colors.text }]}>Continuă ca vizitator</Text>
              <Text style={[s.guestSub, { color: colors.textMuted }]}>
                Explorează aplicația fără cont
              </Text>
            </View>
            <Text style={[s.guestChevron, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={[s.footerText, { color: colors.textMuted }]}>Nu ai cont?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[s.footerLink, { color: colors.primary }]}> Creează unul</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1 },
    flex: { flex: 1 },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    tagline: { fontSize: 15, marginTop: 4 },
    form: { marginBottom: 24 },
    title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
    subtitle: { fontSize: 15, marginBottom: 28, lineHeight: 22 },
    forgotBtn: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 28 },
    forgotText: { fontSize: 14, fontWeight: '600' },
    loginBtn: {},
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { fontSize: 13 },
    guestBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      marginBottom: 24,
    },
    guestEmoji: { fontSize: 28 },
    guestContent: { flex: 1 },
    guestTitle: { fontSize: 15, fontWeight: '700' },
    guestSub: { fontSize: 12, marginTop: 2 },
    guestChevron: { fontSize: 22 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto' },
    footerText: { fontSize: 15 },
    footerLink: { fontSize: 15, fontWeight: '700' },
  });
}
