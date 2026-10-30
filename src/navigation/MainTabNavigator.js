import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColors } from '../context/ThemeContext';

import HomeScreen from '../screens/main/HomeScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import StatsScreen from '../screens/main/StatsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

import HabitsScreen from '../screens/habits/HabitsScreen';
import HabitDetailScreen from '../screens/habits/HabitDetailScreen';
import AddHabitScreen from '../screens/habits/AddHabitScreen';

import SuccessCheckinScreen from '../screens/checkin/SuccessCheckinScreen';
import RelapseCheckinScreen from '../screens/checkin/RelapseCheckinScreen';
import UrgeModeScreen from '../screens/urge/UrgeModeScreen';
import DayDetailScreen from '../screens/history/DayDetailScreen';
import JournalScreen from '../screens/journal/JournalScreen';
import MilestonesScreen from '../screens/milestones/MilestonesScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';
import TermsScreen from '../screens/settings/TermsScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ResourcesScreen from '../screens/resources/ResourcesScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import PaymentScreen from '../screens/subscription/PaymentScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const HabitsStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function TabIcon({ emoji, size }) {
  return <Text style={{ fontSize: size - 4 }}>{emoji}</Text>;
}

function stackOptions(colors) {
  return {
    headerShown: false,
    contentStyle: { backgroundColor: colors.background },
    animation: 'slide_from_right',
  };
}

function HomeStackNav() {
  const colors = useColors();
  return (
    <HomeStack.Navigator screenOptions={stackOptions(colors)}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="AddHabit" component={AddHabitScreen} />
      <HomeStack.Screen name="Milestones" component={MilestonesScreen} />
      <HomeStack.Screen name="Subscription" component={SubscriptionScreen} />
      <HomeStack.Screen name="Payment" component={PaymentScreen} />
    </HomeStack.Navigator>
  );
}

function HabitsStackNav() {
  const colors = useColors();
  return (
    <HabitsStack.Navigator screenOptions={stackOptions(colors)}>
      <HabitsStack.Screen name="HabitsList" component={HabitsScreen} />
      <HabitsStack.Screen name="HabitDetail" component={HabitDetailScreen} />
      <HabitsStack.Screen name="SuccessCheckin" component={SuccessCheckinScreen} />
      <HabitsStack.Screen name="RelapseCheckin" component={RelapseCheckinScreen} />
      <HabitsStack.Screen name="UrgeMode" component={UrgeModeScreen} />
      <HabitsStack.Screen name="Milestones" component={MilestonesScreen} />
      <HabitsStack.Screen name="Journal" component={JournalScreen} />
      <HabitsStack.Screen name="Resources" component={ResourcesScreen} />
      <HabitsStack.Screen name="AddHabit" component={AddHabitScreen} />
      <HabitsStack.Screen name="Subscription" component={SubscriptionScreen} />
      <HabitsStack.Screen name="Payment" component={PaymentScreen} />
    </HabitsStack.Navigator>
  );
}

function HistoryStackNav() {
  const colors = useColors();
  return (
    <HistoryStack.Navigator screenOptions={stackOptions(colors)}>
      <HistoryStack.Screen name="HistoryMain" component={HistoryScreen} />
      <HistoryStack.Screen name="DayDetail" component={DayDetailScreen} />
    </HistoryStack.Navigator>
  );
}

function ProfileStackNav() {
  const colors = useColors();
  return (
    <ProfileStack.Navigator screenOptions={stackOptions(colors)}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="Terms" component={TermsScreen} />
      <ProfileStack.Screen name="Milestones" component={MilestonesScreen} />
      <ProfileStack.Screen name="AddHabit" component={AddHabitScreen} />
      <ProfileStack.Screen name="Subscription" component={SubscriptionScreen} />
      <ProfileStack.Screen name="Payment" component={PaymentScreen} />
    </ProfileStack.Navigator>
  );
}

export default function MainTabNavigator() {
  const colors = useColors();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNav}
        options={{ title: 'Acasă', tabBarIcon: ({ size }) => <TabIcon emoji="🏠" size={size} /> }}
      />
      <Tab.Screen
        name="HabitsTab"
        component={HabitsStackNav}
        options={{ title: 'Obiceiuri', tabBarIcon: ({ size }) => <TabIcon emoji="🎯" size={size} /> }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStackNav}
        options={{ title: 'Istoric', tabBarIcon: ({ size }) => <TabIcon emoji="📅" size={size} /> }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{ title: 'Statistici', tabBarIcon: ({ size }) => <TabIcon emoji="📊" size={size} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNav}
        options={{ title: 'Profil', tabBarIcon: ({ size }) => <TabIcon emoji="👤" size={size} /> }}
      />
    </Tab.Navigator>
  );
}
