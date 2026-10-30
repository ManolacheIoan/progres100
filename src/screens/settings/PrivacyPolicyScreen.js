import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';

const SECTIONS = [
  {
    title: 'Date colectate',
    body: 'Progres 100 stochează datele exclusiv local, pe dispozitivul tău, folosind AsyncStorage. Nu colectăm, nu transmitem și nu vindem date personale către servere externe sau terți.',
  },
  {
    title: 'Autentificare',
    body: 'Poți folosi aplicația ca vizitator (fără cont) sau cu un cont de e-mail. Dacă alegi contul de e-mail, adresa ta este folosită exclusiv pentru autentificare locală și nu este trimisă nicăieri.',
  },
  {
    title: 'Date de progres',
    body: 'Check-in-urile zilnice, streak-urile, statisticile, jurnalul și etapele sunt stocate local. Aceste date nu sunt accesibile altor aplicații sau persoane.',
  },
  {
    title: 'Abonament Premium',
    body: 'Funcționalitățile Premium sunt activate local. Nu procesăm date de card sau informații de plată direct — acestea sunt gestionate de platforma App Store / Google Play prin mecanismele lor securizate.',
  },
  {
    title: 'Ștergerea datelor',
    body: 'Poți reseta progresul sau șterge toate datele oricând din Setări → Progres & Date. Dezinstalarea aplicației șterge complet toate datele locale.',
  },
  {
    title: 'Modificări ale politicii',
    body: 'Orice modificare a acestei politici va fi comunicată prin actualizarea versiunii aplicației. Continuarea utilizării după o actualizare implică acceptarea noii politici.',
  },
  {
    title: 'Contact',
    body: 'Pentru întrebări legate de confidențialitate, ne poți contacta la: contact@progres100.ro',
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Politica de confidențialitate</Text>
        <Text style={[styles.updated, { color: colors.textMuted }]}>Ultima actualizare: Aprilie 2026</Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{s.title}</Text>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{s.body}</Text>
          </View>
        ))}

        <Text style={[styles.footer, { color: colors.textDisabled }]}>
          © 2026 Progres 100. Toate drepturile rezervate.
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
  title: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  updated: { fontSize: 12, marginBottom: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardBody: { fontSize: 13, lineHeight: 21 },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
