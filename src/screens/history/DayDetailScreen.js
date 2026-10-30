import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { TRIGGERS } from '../../constants/triggers';
import Card from '../../components/Card';
import impulsService from '../../services/impulsService';
import journalService from '../../services/journalService';

const INTENSITY_LABELS = ['', 'Minim', 'Scăzut', 'Mediu', 'Ridicat', 'Maxim'];
const MOODS = [
  { id: 'great', emoji: '😄' },
  { id: 'good', emoji: '🙂' },
  { id: 'neutral', emoji: '😐' },
  { id: 'difficult', emoji: '😕' },
  { id: 'bad', emoji: '😔' },
];

export default function DayDetailScreen({ navigation, route }) {
  const { date, entry } = route.params || {};
  const colors = useColors();
  const { activeHabitId } = useApp();
  const [impulsuri, setImpulsuri] = useState([]);
  const [journal, setJournal] = useState(null);

  useEffect(() => {
    async function incarcaDate() {
      if (activeHabitId) {
        const lista = await impulsService.impulsurileZilei(activeHabitId, date);
        setImpulsuri(lista);
      }
      const notita = await journalService.getForDate(date);
      setJournal(notita);
    }
    if (date) {
      incarcaDate();
      navigation.setOptions({ title: date || 'Detalii zi' });
    }
  }, [date, activeHabitId]);

  if (!entry) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Text style={{ color: colors.textMuted, fontSize: 16, textAlign: 'center', marginTop: 60 }}>
          Nu există date pentru această zi.
        </Text>
      </SafeAreaView>
    );
  }

  const isSuccess = entry.status === 'success' || entry.status === 'grace';
  const isGrace = entry.status === 'grace';
  const statusColor = isSuccess ? colors.success : colors.danger;
  const trigger = TRIGGERS.find((t) => t.id === entry.trigger);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={ddStyles.backBtn}>
          <Text style={[ddStyles.backText, { color: colors.primary }]}>← Înapoi</Text>
        </TouchableOpacity>

        {/* Status header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          borderRadius: 16, padding: 18, borderWidth: 1.5,
          backgroundColor: statusColor + '20', borderColor: statusColor,
        }}>
          <Text style={{ fontSize: 36 }}>
            {isGrace ? '🛡️' : isSuccess ? '✅' : '⚠️'}
          </Text>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: statusColor }}>
              {isGrace ? 'Zi de grație' : isSuccess ? 'Zi reușită' : 'Recădere'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>{date}</Text>
          </View>
        </View>

        {/* Details */}
        <Card>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Detalii</Text>
          {entry.impulseIntensity > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Intensitate impuls</Text>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                {INTENSITY_LABELS[entry.impulseIntensity]} ({entry.impulseIntensity}/5)
              </Text>
            </View>
          )}
          {entry.trigger && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Trigger</Text>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                {trigger ? `${trigger.emoji} ${trigger.label}` : entry.trigger}
              </Text>
            </View>
          )}
          {entry.note ? (
            <View style={{ paddingTop: 12 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Notă</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginTop: 4 }}>
                "{entry.note}"
              </Text>
            </View>
          ) : null}
          {!entry.impulseIntensity && !entry.trigger && !entry.note && (
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>Nicio notă adăugată.</Text>
          )}
        </Card>

        {/* Impulsuri înregistrate */}
        {impulsuri.length > 0 && (
          <Card>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
              Impulsuri înregistrate ({impulsuri.length})
            </Text>
            {impulsuri.map((impuls) => {
              const cauza = TRIGGERS.find((t) => t.id === impuls.cause);
              const culoareRezultat = impuls.resisted === true ? colors.success : impuls.resisted === false ? colors.danger : colors.textMuted;
              return (
                <View key={impuls.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, width: 44 }}>
                    {new Date(impuls.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      Intensitate: {INTENSITY_LABELS[impuls.intensity] || impuls.intensity}
                    </Text>
                    {cauza && (
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {cauza.emoji} {cauza.label}
                      </Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 20, color: culoareRezultat }}>
                    {impuls.resisted === true ? '💪' : impuls.resisted === false ? '😔' : '⏳'}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* Journal */}
        {journal && (
          <Card>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
              Jurnal {journal.mood ? MOODS.find((m) => m.id === journal.mood)?.emoji || '' : ''}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, fontStyle: 'italic', lineHeight: 22 }}>
              "{journal.text}"
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const ddStyles = StyleSheet.create({
  backBtn: {
    marginBottom: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
