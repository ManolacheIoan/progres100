import React from 'react';
import { View } from 'react-native';
import { useColors } from '../context/ThemeContext';

export default function ProgressBar({ progress = 0, color, height = 6 }) {
  const colors = useColors();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const fillColor = color || colors.primary;
  return (
    <View style={{ width: '100%', backgroundColor: colors.border, borderRadius: 99, overflow: 'hidden', height }}>
      <View style={{ width: `${clamped * 100}%`, backgroundColor: fillColor, borderRadius: 99, height }} />
    </View>
  );
}
