import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useColors } from '../context/ThemeContext';

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  labelStyle,
}) {
  const colors = useColors();
  const isDisabled = disabled || loading;

  const bgMap = {
    primary: colors.primary,
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    outline: 'transparent',
    ghost: 'transparent',
    secondary: colors.card,
  };

  const textMap = {
    primary: colors.white,
    success: colors.white,
    danger: colors.white,
    warning: colors.black || '#000',
    outline: colors.primary,
    ghost: colors.primary,
    secondary: colors.text,
  };

  const base = {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    backgroundColor: bgMap[variant] || colors.primary,
    ...(variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary }),
    ...(isDisabled && { opacity: 0.45 }),
  };

  const indicatorColor = (variant === 'outline' || variant === 'ghost') ? colors.primary : colors.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[base, style]}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="small" />
      ) : (
        <Text style={[{ fontSize: 16, fontWeight: '700', letterSpacing: 0.3, color: textMap[variant] || colors.white }, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
