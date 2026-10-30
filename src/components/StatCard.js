import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../context/ThemeContext';

export default function StatCard({ label, value, subtitle, color, icon }) {
  const colors = useColors();
  const valueColor = color || colors.primary;

  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderLight,
      flex: 1,
    }}>
      {icon ? <Text style={{ fontSize: 24, marginBottom: 6 }}>{icon}</Text> : null}
      <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.5, color: valueColor }}>
        {value ?? '—'}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'center', letterSpacing: 0.2 }}>
        {label}
      </Text>
      {subtitle ? (
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
