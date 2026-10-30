import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '../context/ThemeContext';

export default function EmptyState({ icon = '📭', title, subtitle, children }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      {icon ? <Text style={{ fontSize: 56, marginBottom: 16 }}>{icon}</Text> : null}
      {title ? (
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text style={{ color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
