import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';
import { darkColors, lightColors } from '../constants/colors';
import storage from '../services/storageService';

const ThemeContext = createContext({ colors: darkColors, theme: 'dark', setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    storage.get(storage.KEYS.SETTINGS).then((s) => {
      const saved = s?.theme || 'dark';
      if (saved === 'system') {
        const sys = Appearance.getColorScheme();
        setThemeState(sys === 'light' ? 'light' : 'dark');
      } else {
        setThemeState(saved);
      }
    });
  }, []);

  const setTheme = async (newTheme) => {
    if (newTheme === 'system') {
      const sys = Appearance.getColorScheme();
      setThemeState(sys === 'light' ? 'light' : 'dark');
    } else {
      setThemeState(newTheme);
    }
    // Persist preference
    const s = (await storage.get(storage.KEYS.SETTINGS)) || {};
    await storage.set(storage.KEYS.SETTINGS, { ...s, theme: newTheme });
  };

  const colors = useMemo(() => (theme === 'light' ? lightColors : darkColors), [theme]);

  return (
    <ThemeContext.Provider value={{ colors, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useColors = () => useContext(ThemeContext).colors;
export const useTheme = () => useContext(ThemeContext);
