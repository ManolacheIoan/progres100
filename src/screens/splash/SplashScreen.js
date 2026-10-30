import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useColors } from '../../context/ThemeContext';

export default function SplashScreen({ onDone }) {
  const colors = useColors();
  const [count, setCount] = useState(0);

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity    = useRef(new Animated.Value(1)).current;
  const checkOpacity     = useRef(new Animated.Value(0)).current;
  const checkScale       = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Fade in the whole screen
    Animated.timing(containerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Counter
    const steps = 40;
    const intervalMs = 1100 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.round((step / steps) * 100));
      if (step >= steps) {
        clearInterval(timer);
        Animated.parallel([
          Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(checkScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        ]).start();
      }
    }, intervalMs);

    // Fade out → call onDone
    const exit = setTimeout(() => {
      Animated.timing(screenOpacity, { toValue: 0, duration: 420, useNativeDriver: true })
        .start(() => onDone?.());
    }, 2500);

    return () => { clearInterval(timer); clearTimeout(exit); };
  }, []);

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: screenOpacity }]}>
      <Animated.View style={[styles.inner, { opacity: containerOpacity }]}>

        {/* Title */}
        <Text style={[styles.appName, { color: colors.text }]}>
          Progres<Text style={{ color: colors.primary, fontWeight: '900' }}>100</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>Fiecare zi contează.</Text>

        {/* Loading badge */}
        <View style={styles.badgeWrap}>
          <View style={[styles.outerRing, { borderColor: colors.primary }]} />
          <View style={[styles.innerBadge, { backgroundColor: colors.primaryFaded }]}>
            {count < 100 ? (
              <View style={styles.counterWrap}>
                <Text style={[styles.counterNum, { color: colors.primary }]}>
                  {count}<Text style={[styles.counterPct, { color: colors.primary }]}>%</Text>
                </Text>
              </View>
            ) : (
              <Animated.Text style={[
                styles.checkmark,
                { color: colors.primary, opacity: checkOpacity, transform: [{ scale: checkScale }] },
              ]}>✓</Animated.Text>
            )}
            <Text style={[styles.counterLabel, { color: colors.textMuted }]}>PROGRES</Text>
          </View>
          <View style={[styles.dot1, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot2, { backgroundColor: colors.primary }]} />
        </View>

        <Text style={[styles.version, { color: colors.textDisabled }]}>v1.0.0</Text>

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 38,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    letterSpacing: 0.2,
    marginBottom: 40,
  },
  badgeWrap: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  outerRing: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 3,
  },
  innerBadge: {
    width: 118,
    height: 118,
    borderRadius: 59,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  counterWrap: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNum: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  counterPct: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 58,
    textAlign: 'center',
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  dot1: {
    position: 'absolute',
    top: 10,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  dot2: {
    position: 'absolute',
    bottom: 12,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.45,
  },
  version: {
    fontSize: 12,
    marginTop: 8,
  },
});
