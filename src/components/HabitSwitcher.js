import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { useColors } from '../context/ThemeContext';
import { getHabitName, getHabitIcon } from '../utils/habitUtils';

export default function HabitSwitcher({ showAll, onShowAll, style }) {
  const { habits, activeHabitId, setActiveHabitId } = useApp();
  const colors = useColors();

  if (!habits || habits.length <= 1) return null;

  const handleSelect = (id) => {
    if (onShowAll) onShowAll(false);
    setActiveHabitId(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 2, gap: 8 }, style]}
      style={{ marginBottom: 12, marginHorizontal: -2 }}
    >
      {habits.length > 1 && onShowAll && (
        <TouchableOpacity
          onPress={() => onShowAll(true)}
          style={[chip(colors, showAll)]}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 16 }}>📊</Text>
          <Text style={[chipLabel(colors, showAll)]}>Toate</Text>
        </TouchableOpacity>
      )}
      {habits.map((habit) => {
        const active = !showAll && habit.id === activeHabitId;
        return (
          <TouchableOpacity
            key={habit.id}
            onPress={() => handleSelect(habit.id)}
            style={[chip(colors, active)]}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16 }}>{getHabitIcon(habit)}</Text>
            <Text style={[chipLabel(colors, active)]}>
              {getHabitName(habit)}
            </Text>
            <SeverityDot severity={habit.severity} colors={colors} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function chip(colors, active) {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: active ? colors.primaryFaded : colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: active ? colors.primary : colors.border,
  };
}

function chipLabel(colors, active) {
  return {
    color: active ? colors.primary : colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  };
}

function SeverityDot({ severity, colors }) {
  const color = severity === 'high' ? colors.danger : severity === 'medium' ? colors.warning : colors.success;
  return (
    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
  );
}
