import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const colors = useColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Numele este obligatoriu';
    if (!email.trim()) e.email = 'Email-ul este obligatoriu';
    if (!password) e.password = 'Parola este obligatorie';
    else if (password.length < 6) e.password = 'Minim 6 caractere';
    if (password !== confirmPassword) e.confirmPassword = 'Parolele nu coincid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
    } catch (err) {
      Alert.alert('Eroare', err.message || 'Înregistrarea a eșuat. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>← Înapoi</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 }}>Creează cont</Text>
            <Text style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22 }}>
              Începe-ți călătoria spre schimbare
            </Text>
          </View>

          <Input label="Nume" value={name} onChangeText={setName} placeholder="Prenumele tău" autoCapitalize="words" error={errors.name} />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="adresa@email.com" keyboardType="email-address" error={errors.email} />
          <Input label="Parolă" value={password} onChangeText={setPassword} placeholder="Minim 6 caractere" secureTextEntry error={errors.password} />
          <Input label="Confirmă parola" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repetă parola" secureTextEntry error={errors.confirmPassword} />

          <Button label="Creează cont" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: colors.textMuted, fontSize: 15 }}>Ai deja cont?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}> Autentifică-te</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
