import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../context/ThemeContext';

export function getSeverityColor(severity, colors) {
  if (severity === 'high') return colors.danger;
  if (severity === 'medium') return colors.warning;
  return colors.success;
}

export function getSeverityLabel(severity) {
  if (severity === 'high') return 'Sever';
  if (severity === 'medium') return 'Moderat';
  return 'Ușor';
}

export default function SeverityBadge({ severity, style }) {
  const colors = useColors();
  const color = getSeverityColor(severity, colors);
  const label = getSeverityLabel(severity);

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: '600' },
});
