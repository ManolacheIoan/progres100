import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '../../context/ThemeContext';
import authService from '../../services/authService';
import firestoreService from '../../services/firestoreService';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function EditProfileScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const colors = useColors();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  async function handleSaveName() {
    if (!name.trim()) {
      Alert.alert('Eroare', 'Numele nu poate fi gol.');
      return;
    }
    setLoadingName(true);
    try {
      await authService.updateProfile({ name: name.trim() });
      if (isFirebaseConfigured && auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      firestoreService.syncUser({ name: name.trim() }).catch(() => {});
      await refreshUser();
      Alert.alert('Salvat', 'Numele a fost actualizat.');
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut actualiza numele.');
    } finally {
      setLoadingName(false);
    }
  }

  async function handleSavePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Eroare', 'Completează toate câmpurile.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Eroare', 'Parola nouă trebuie să aibă minim 6 caractere.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Eroare', 'Parolele noi nu coincid.');
      return;
    }
    setLoadingPassword(true);
    try {
      if (isFirebaseConfigured && auth?.currentUser) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Salvat', 'Parola a fost schimbată cu succes.');
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        Alert.alert('Eroare', 'Parola curentă este incorectă.');
      } else {
        Alert.alert('Eroare', 'Nu s-a putut schimba parola. Încearcă din nou.');
      }
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Editează profilul</Text>

        {/* Name */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>NUME</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Input
            label="Nume afișat"
            value={name}
            onChangeText={setName}
            placeholder="Numele tău"
            autoCapitalize="words"
          />
          <Button
            label="Salvează numele"
            onPress={handleSaveName}
            loading={loadingName}
          />
        </View>

        {/* Password */}
        {!user?.isGuest && isFirebaseConfigured && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SCHIMBĂ PAROLA</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Input
                label="Parola curentă"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Parola actuală"
                secureTextEntry
              />
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Resetare parolă',
                    `Trimitem un email de resetare la ${user?.email}. Continuă?`,
                    [
                      { text: 'Anulează', style: 'cancel' },
                      {
                        text: 'Trimite email',
                        onPress: () => authService.resetPassword(user?.email)
                          .then(() => Alert.alert('Email trimis', 'Verifică căsuța de email.'))
                          .catch(() => Alert.alert('Eroare', 'Nu s-a putut trimite emailul.')),
                      },
                    ]
                  );
                }}
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>Am uitat parola curentă</Text>
              </TouchableOpacity>
              <Input
                label="Parola nouă"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minim 6 caractere"
                secureTextEntry
              />
              <Input
                label="Confirmă parola nouă"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repetă parola nouă"
                secureTextEntry
              />
              <Button
                label="Schimbă parola"
                onPress={handleSavePassword}
                loading={loadingPassword}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: -4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  forgotText: { fontSize: 13, fontWeight: '600', textAlign: 'right', marginTop: -6 },
});
