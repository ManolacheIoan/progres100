import React from 'react';
import { View } from 'react-native';
import { useColors } from '../context/ThemeContext';

export default function Card({ children, style, elevated = false }) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.cardElevated : colors.card,
          borderRadius: 18,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.borderLight,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
