import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Atenție', 'Introduceți adresa de email.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert('Eroare', err.message || 'Nu s-a putut trimite email-ul.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>← Înapoi</Text>
        </TouchableOpacity>

        {!sent ? (
          <>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
              Resetează parola
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22, marginBottom: 28 }}>
              Introduceți email-ul și vă vom trimite instrucțiunile de resetare.
            </Text>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="adresa@email.com" keyboardType="email-address" />
            <Button label="Trimite link de resetare" onPress={handleReset} loading={loading} />
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 64, marginBottom: 24 }}>✅</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 12 }}>
              Email trimis!
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
              Verificați inbox-ul pentru instrucțiunile de resetare a parolei.
            </Text>
            <Button
              label="Înapoi la autentificare"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={{ width: '100%' }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
