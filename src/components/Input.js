import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useColors } from '../context/ThemeContext';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  error,
  style,
  inputStyle,
}) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 }}>
          {label}
        </Text>
      ) : null}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: error ? colors.danger : colors.border,
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          textContentType={isPassword ? 'oneTimeCode' : 'none'}
          autoComplete="off"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          style={[{
            flex: 1,
            color: colors.text,
            fontSize: 16,
            paddingVertical: 14,
            paddingHorizontal: 16,
            ...(multiline && { paddingTop: 14, minHeight: 100, textAlignVertical: 'top' }),
          }, inputStyle]}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={{ padding: 14 }}>
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={{ color: colors.danger, fontSize: 12, marginTop: 6, marginLeft: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}
