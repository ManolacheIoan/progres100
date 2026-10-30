import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useColors } from '../context/ThemeContext';

export default function LoadingState({ label = 'Se încarcă...' }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: 16 }}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text style={{ color: colors.textMuted, fontSize: 14 }}>{label}</Text> : null}
    </View>
  );
}
