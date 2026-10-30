import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';

const FEATURES = [
  { emoji: '🎯', title: 'Urmărire obiceiuri', desc: 'Monitorizează unul sau mai multe obiceiuri simultan, cu statistici individuale pentru fiecare.' },
  { emoji: '📅', title: 'Check-in zilnic', desc: 'Marchează fiecare zi ca reușită, recădere sau zi de grație — și construiește un streak consistent.' },
  { emoji: '📊', title: 'Statistici detaliate', desc: 'Vizualizează streak-ul curent, recordul personal, rata de succes și evoluția în timp.' },
  { emoji: '🏆', title: 'Etape', desc: 'Deblochez recompense la 7, 30, 90, 180 și 365 de zile fără obiceiul negativ.' },
  { emoji: '🔔', title: 'Reminder-uri', desc: 'Setează notificări zilnice la ora potrivită pentru a nu uita de angajamentul tău.' },
];

export default function AboutScreen({ navigation }) {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={styles.heroIcon}>🧠</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Progres 100</Text>
          <Text style={[styles.heroVersion, { color: colors.textMuted }]}>Versiunea 1.0.0</Text>
          <Text style={[styles.heroTagline, { color: colors.textSecondary }]}>
            Instrumentul tău de recuperare, zi cu zi.
          </Text>
        </View>

        {/* What is it */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CE ESTE</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Progres 100 este o aplicație de urmărire a progresului personală, creată pentru cei care vor să renunțe la obiceiuri negative. Fie că vrei să te lași de fumat, să reduci consumul de zahăr sau să scapi de dependența de social media — aplicația te ajută să rămâi consecvent și motivat.
          </Text>
        </View>

        {/* Problem */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PROBLEMA PE CARE O REZOLVĂ</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Renunțarea la un obicei negativ este dificilă fără vizibilitate clară asupra progresului. Fără o metodă structurată, motivația scade rapid după primele recăderi. Progres 100 face progresul vizibil, serbează micile victorii și tratează recăderile ca parte normală a procesului de recuperare.
          </Text>
        </View>

        {/* How it works */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CUM FUNCȚIONEAZĂ</Text>
        {FEATURES.map((f) => (
          <View
            key={f.title}
            style={[styles.featureRow, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
          >
            <Text style={styles.featureEmoji}>{f.emoji}</Text>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textMuted }]}>{f.desc}</Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.textDisabled }]}>
          Progres 100 · Toate datele sunt stocate local pe dispozitivul tău.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48, gap: 12 },
  backBtn: { marginBottom: 4 },
  backText: { fontSize: 16, fontWeight: '600' },

  hero: {
    borderRadius: 20, borderWidth: 1,
    padding: 28, alignItems: 'center', gap: 6,
  },
  heroIcon: { fontSize: 48, marginBottom: 4 },
  heroTitle: { fontSize: 26, fontWeight: '900' },
  heroVersion: { fontSize: 12 },
  heroTagline: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 4 },

  card: {
    borderRadius: 16, borderWidth: 1, padding: 16,
  },
  bodyText: { fontSize: 14, lineHeight: 22 },

  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderRadius: 14, borderWidth: 1, padding: 14,
  },
  featureEmoji: { fontSize: 22, marginTop: 1 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  featureDesc: { fontSize: 13, lineHeight: 19 },

  footer: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
