import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingHabitScreen from '../screens/onboarding/OnboardingHabitScreen';
import OnboardingReasonScreen from '../screens/onboarding/OnboardingReasonScreen';
import OnboardingStrategyScreen from '../screens/onboarding/OnboardingStrategyScreen';
import OnboardingReminderScreen from '../screens/onboarding/OnboardingReminderScreen';
import { useColors } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  const colors = useColors();
  return (
    <Stack.Navigator
      initialRouteName="OnboardingHabit"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OnboardingHabit" component={OnboardingHabitScreen} />
      <Stack.Screen name="OnboardingReason" component={OnboardingReasonScreen} />
      <Stack.Screen name="OnboardingStrategy" component={OnboardingStrategyScreen} />
      <Stack.Screen name="OnboardingReminder" component={OnboardingReminderScreen} />
    </Stack.Navigator>
  );
}
