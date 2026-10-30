import React, { createContext, useContext, useState, useCallback } from 'react';
import habitService from '../services/habitService';
import checkinService from '../services/checkinService';
import impulsService from '../services/impulsService';
import statsService from '../services/statsService';
import milestoneService from '../services/milestoneService';
import userService from '../services/userService';
import firestoreService from '../services/firestoreService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [activeHabitId, setActiveHabitIdState] = useState(null);
  const [checkins, setCheckins] = useState({});
  const [stats, setStats] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const resetState = () => {
    setHabits([]);
    setActiveHabitIdState(null);
    setCheckins({});
    setStats(null);
    setMilestones([]);
    setSettings(null);
    setIsPremium(false);
    setInitialized(false);
  };

  const loadHabitData = async (id) => {
    if (!id) return;
    const [checkins, fullStats, milestones] = await Promise.all([
      checkinService.getAllCheckins(id),
      statsService.getFullStats(id),
      milestoneService.getAllWithStatus(id),
    ]);
    setCheckins(checkins);
    setStats(fullStats);
    setMilestones(milestones);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await firestoreService.hydrateFromCloud().catch(() => {});
      await habitService.migrateFromLegacy();
      await habitService.normalizeFields();

      const [allHabits, setari, activeId] = await Promise.all([
        habitService.getAll(),
        userService.getSettings(),
        habitService.getActiveId(),
      ]);
      setHabits(allHabits);
      setSettings(setari);
      setIsPremium(setari.isPremium || false);
      setActiveHabitIdState(activeId);

      await loadHabitData(activeId);
    } catch (e) {
      console.warn('AppContext loadAll error:', e);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const setActiveHabitId = async (id) => {
    await habitService.setActiveId(id);
    setActiveHabitIdState(id);
    await loadHabitData(id);
  };

  const addHabit = async (habitData) => {
    const habit = await habitService.create(habitData);
    const allHabits = await habitService.getAll();
    setHabits(allHabits);
    return habit;
  };

  const removeHabit = async (habitId) => {
    await habitService.remove(habitId);
    const allHabits = await habitService.getAll();
    setHabits(allHabits);
    if (activeHabitId === habitId) {
      const newActive = allHabits[0]?.id || null;
      await setActiveHabitId(newActive);
    }
  };

  const addSuccess = async (data) => {
    if (!activeHabitId) return;
    await checkinService.addSuccess(activeHabitId, data);
    await milestoneService.checkAndUnlock(activeHabitId);
    await loadActiveHabitData();
  };

  const addRelapse = async (data) => {
    if (!activeHabitId) return;
    await checkinService.addRelapse(activeHabitId, data);
    await loadActiveHabitData();
  };

  const adaugaImpuls = async (data) => {
    if (!activeHabitId) return null;
    return impulsService.adaugaImpuls(activeHabitId, data);
  };

  const actualizeazaRezultat = async (id, rezistat) => {
    if (!activeHabitId) return;
    await impulsService.actualizeazaRezultat(activeHabitId, id, rezistat);
  };

  const applyGraceDay = async () => {
    if (!activeHabitId) return;
    const habit = habits.find((h) => h.id === activeHabitId);
    if (habit?.graceDayUsed) return false;
    await checkinService.applyGraceDay(activeHabitId);
    await habitService.update(activeHabitId, { graceDayUsed: true });
    await loadActiveHabitData();
    // Refresh habits list
    const allHabits = await habitService.getAll();
    setHabits(allHabits);
    return true;
  };

  const loadActiveHabitData = () => loadHabitData(activeHabitId);

  const completeOnboarding = async (habitData) => {
    const habit = await habitService.create(habitData);
    const allHabits = await habitService.getAll();
    setHabits(allHabits);
    setActiveHabitIdState(habit.id);
    await loadAll();
  };

  const updateSettings = async (updates) => {
    const setariNoi = await userService.updateSettings(updates);
    setSettings(setariNoi);
    return setariNoi;
  };

  const activatePremium = async (plan) => {
    const setariNoi = await userService.activatePremium(plan);
    setSettings(setariNoi);
    setIsPremium(true);
  };

  const cancelPremium = async () => {
    const setariNoi = await userService.cancelPremium();
    setSettings(setariNoi);
  };

  const resetHabitProgress = async (habitId) => {
    await habitService.resetProgress(habitId);
    await loadAll();
  };

  const resetAllProgress = async () => {
    const allHabits = await habitService.getAll();
    await Promise.all(allHabits.map((h) => habitService.remove(h.id)));
    await loadAll();
  };

  const resetProgress = async () => {
    if (activeHabitId) {
      await habitService.remove(activeHabitId);
    }
    await loadAll();
  };

  const activeHabit = habits.find((habit) => habit.id === activeHabitId) || null;

  return (
    <AppContext.Provider
      value={{
        habits,
        activeHabitId,
        activeHabit,
        checkins,
        stats,
        milestones,
        settings,
        isPremium,
        loading,
        initialized,
        resetState,
        loadAll,
        setActiveHabitId,
        addHabit,
        removeHabit,
        addSuccess,
        addRelapse,
        adaugaImpuls,
        actualizeazaRezultat,
        applyGraceDay,
        completeOnboarding,
        updateSettings,
        activatePremium,
        cancelPremium,
        resetHabitProgress,
        resetAllProgress,
        resetProgress,
        loadActiveHabitData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
