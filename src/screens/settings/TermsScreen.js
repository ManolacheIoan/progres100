import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';

const SECTIONS = [
  {
    title: 'Acceptarea termenilor',
    body: 'Prin utilizarea aplicației Progres 100, accepți în mod implicit acești Termeni și Condiții. Dacă nu ești de acord, te rugăm să nu utilizezi aplicația.',
  },
  {
    title: 'Scopul aplicației',
    body: 'Progres 100 este un instrument de suport personal pentru urmărirea progresului în renunțarea la obiceiuri negative. Aplicația nu înlocuiește sfaturile medicale, psihologice sau terapeutice profesionale.',
  },
  {
    title: 'Cont și acces',
    body: 'Poți utiliza aplicația fără cont (vizitator) sau cu un cont personal. Ești responsabil pentru păstrarea confidențialității credențialelor tale și pentru toate activitățile din contul tău.',
  },
  {
    title: 'Abonament Premium',
    body: 'Planul Premium se reînnoiește automat la finalul perioadei selectate (lunar sau anual). Poți anula oricând din secțiunea Abonament. Odată anulat, accesul Premium rămâne activ până la data expirării perioadei plătite.',
  },
  {
    title: 'Utilizare permisă',
    body: 'Aplicația este destinată exclusiv uzului personal. Este interzisă modificarea, redistribuirea sau utilizarea comercială a aplicației fără acordul explicit al dezvoltatorilor.',
  },
  {
    title: 'Limitarea răspunderii',
    body: 'Progres 100 este furnizat "ca atare", fără garanții de niciun fel. Nu suntem responsabili pentru pierderea datelor cauzată de dezinstalarea aplicației, resetarea dispozitivului sau erori tehnice.',
  },
  {
    title: 'Modificarea termenilor',
    body: 'Ne rezervăm dreptul de a modifica acești termeni. Versiunea actualizată va fi disponibilă în aplicație. Utilizarea continuă după modificări implică acceptarea noilor termeni.',
  },
];

export default function TermsScreen({ navigation }) {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Termeni și Condiții</Text>
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
