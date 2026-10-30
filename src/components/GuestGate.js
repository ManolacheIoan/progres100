import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function GuestGate({ children, action = 'această funcție' }) {
  const { user } = useAuth();
  const colors = useColors();

  if (!user?.isGuest) return children;

  return (
    <View style={{ flex: 1 }}>
      {children}
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={[styles.title, { color: colors.text }]}>Cont necesar</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>
            Creează un cont gratuit pentru a folosi {action} și a-ți salva progresul.
          </Text>
          <GuestGateButtons colors={colors} />
        </View>
      </View>
    </View>
  );
}

function GuestGateButtons({ colors }) {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const goToRegister = async () => {
    await logout();
    // Navigation will automatically go to Auth
  };

  return (
    <View style={styles.buttons}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={goToRegister}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnLabel, { color: colors.white }]}>Creează cont gratuit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnOutline, { borderColor: colors.border }]}
        onPress={goToRegister}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnLabelOutline, { color: colors.primary }]}>Am deja cont — Autentifică-mă</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
    gap: 12,
  },
  lockEmoji: { fontSize: 52 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  buttons: { width: '100%', gap: 10, marginTop: 4 },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  btnOutline: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  btnLabelOutline: { fontSize: 15, fontWeight: '600' },
});
