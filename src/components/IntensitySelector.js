import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useColors } from '../context/ThemeContext';

const LEVEL_COLORS = ['#4CAF50', '#7BDA8A', '#FFC107', '#FF8C42', '#F44336'];
const LEVEL_LABELS = ['Minim', 'Scăzut', 'Mediu', 'Ridicat', 'Maxim'];

export default function IntensitySelector({ value, onChange, label = 'Intensitate' }) {
  const colors = useColors();

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.3 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[1, 2, 3, 4, 5].map((level) => {
          const active = value === level;
          const levelColor = LEVEL_COLORS[level - 1];
          return (
            <TouchableOpacity
              key={level}
              onPress={() => onChange(level)}
              style={{
                width: 52, height: 52, borderRadius: 26, borderWidth: 2,
                alignItems: 'center', justifyContent: 'center',
                borderColor: levelColor,
                backgroundColor: active ? levelColor : 'transparent',
              }}
            >
              <Text style={{ color: active ? colors.white : colors.textSecondary, fontSize: 18, fontWeight: '700' }}>
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {value ? (
        <Text style={{ color: LEVEL_COLORS[value - 1], fontSize: 13, fontWeight: '600', marginTop: 8 }}>
          {LEVEL_LABELS[value - 1]}
        </Text>
      ) : null}
    </View>
  );
}
