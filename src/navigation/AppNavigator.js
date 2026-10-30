import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useColors } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';
import SplashScreen from '../screens/splash/SplashScreen';

export default function AppNavigator() {
  const { user, loading: authLoading, splashPending, consumeSplashPending } = useAuth();
  const { habits, initialized, loadAll, resetState } = useApp();
  const colors = useColors();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (user) {
      loadAll();
    } else {
      resetState();
    }
  }, [user]);

  useEffect(() => {
    if (splashPending) setSplashDone(false);
  }, [splashPending]);

  function renderContent() {
    if (authLoading || (user && !initialized)) {
      return (
        <View style={[styles.loader, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      );
    }
    if (!user) return <AuthNavigator />;
    if (habits.length === 0) return <OnboardingNavigator />;
    return <MainTabNavigator />;
  }

  return (
    <View style={styles.root}>
      {renderContent()}
      {!splashDone && (
        <SplashScreen
          onDone={() => {
            setSplashDone(true);
            consumeSplashPending();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
