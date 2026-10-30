import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOODS } from '../../constants/strategies';
import journalService from '../../services/journalService';
import { useColors } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { dateKey } from '../../services/checkinService';

export default function JournalScreen({ navigation }) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const todayKey = dateKey(new Date());
  const [text, setText] = useState('');
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    journalService.getForDate(todayKey).then((entry) => {
      if (entry) {
        setExisting(entry);
        setText(entry.text || '');
        setMood(entry.mood || null);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Atenție', 'Scrie ceva înainte de a salva.');
      return;
    }
    setLoading(true);
    try {
      await journalService.save({ date: todayKey, text: text.trim(), mood });
      setSaved(true);
      setTimeout(() => navigation.goBack(), 1200);
    } catch {
      Alert.alert('Eroare', 'Nu s-a putut salva jurnalul.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Jurnal zilnic</Text>
        <Text style={styles.date}>{todayKey}</Text>

        {existing && (
          <View style={styles.existingBadge}>
            <Text style={styles.existingText}>✏️ Editezi intrarea existentă</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Cum te simți azi?</Text>
        <View style={styles.moodsRow}>
          {MOODS.map((m) => {
            const active = mood === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMood(m.id)}
                style={[styles.moodBtn, active && styles.moodBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Reflecție"
          value={text}
          onChangeText={setText}
          placeholder="Cum a fost ziua ta? Ce ai învățat? Ce simți?"
          multiline
          numberOfLines={8}
        />

        {saved ? (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>✅ Salvat cu succes!</Text>
          </View>
        ) : (
          <Button
            label="Salvează reflecția"
            onPress={handleSave}
            loading={loading}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
    backBtn: { marginBottom: 20 },
    backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 4 },
    date: { color: colors.textMuted, fontSize: 14, marginBottom: 24 },
    existingBadge: {
      backgroundColor: colors.primaryFaded,
      borderRadius: 10,
      padding: 10,
      marginBottom: 20,
    },
    existingText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
      letterSpacing: 0.3,
    },
    moodsRow: { flexDirection: 'row', gap: 8, marginBottom: 24, justifyContent: 'space-between' },
    moodBtn: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    moodBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryFaded },
    moodEmoji: { fontSize: 24 },
    moodLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
    moodLabelActive: { color: colors.primary },
    savedBadge: {
      backgroundColor: colors.successFaded,
      borderRadius: 14,
      padding: 18,
      alignItems: 'center',
    },
    savedText: { color: colors.success, fontSize: 16, fontWeight: '700' },
  });
}
