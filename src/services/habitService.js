import storage from './storageService';
import firestoreService from './firestoreService';

// Sincronizează obiceiurile în cloud după fiecare modificare
async function _syncHabits() {
  const habits = await habitService.getAll();
  const activeId = await storage.get(storage.KEYS.ACTIVE_HABIT_ID);
  firestoreService.syncHabits(habits, activeId).catch(() => {});
}

const habitService = {
  getAll: async () => {
    return (await storage.get(storage.KEYS.HABITS)) || [];
  },

  getById: async (habitId) => {
    const habits = await habitService.getAll();
    return habits.find((habit) => habit.id === habitId) || null;
  },

  create: async (habitData) => {
    const habits = await habitService.getAll();
    const habit = {
      id: `habit_${Date.now()}`,
      habitName: habitData.habitName || habitData.name || 'Obicei',
      habitIcon: habitData.habitIcon || habitData.icon || '🎯',
      category: habitData.habitId || habitData.category || 'other',
      reason: habitData.reason || '',
      strategy: habitData.strategy || 'stop_complet',
      strategyLabel: habitData.strategyLabel || '',
      severity: habitData.severity || 'medium',
      reminder: habitData.reminder || { enabled: false, time: '19:00' },
      createdAt: new Date().toISOString(),
      graceDayUsed: false,
    };
    habits.push(habit);
    await storage.set(storage.KEYS.HABITS, habits);
    const activeId = await storage.get(storage.KEYS.ACTIVE_HABIT_ID);
    if (!activeId) {
      await storage.set(storage.KEYS.ACTIVE_HABIT_ID, habit.id);
    }
    firestoreService.syncHabits(habits, activeId || habit.id).catch(() => {});
    return habit;
  },

  update: async (habitId, updates) => {
    const habits = await habitService.getAll();
    const idx = habits.findIndex((habit) => habit.id === habitId);
    if (idx < 0) return null;
    habits[idx] = { ...habits[idx], ...updates };
    await storage.set(storage.KEYS.HABITS, habits);
    _syncHabits();
    return habits[idx];
  },

  remove: async (habitId) => {
    const habits = await habitService.getAll();
    const filtered = habits.filter((habit) => habit.id !== habitId);
    await storage.set(storage.KEYS.HABITS, filtered);
    await storage.remove(storage.checkinKey(habitId));
    await storage.remove(storage.cheieImpuls(habitId));
    await storage.remove(storage.milestoneKey(habitId));
    await storage.remove(storage.bestStreakKey(habitId));
    const activeId = await storage.get(storage.KEYS.ACTIVE_HABIT_ID);
    if (activeId === habitId && filtered.length > 0) {
      await storage.set(storage.KEYS.ACTIVE_HABIT_ID, filtered[0].id);
    }
    firestoreService.deleteHabitData(habitId).catch(() => {});
    firestoreService.syncHabits(filtered, filtered[0]?.id || null).catch(() => {});
  },

  getActiveId: async () => {
    const id = await storage.get(storage.KEYS.ACTIVE_HABIT_ID);
    if (id) return id;
    const habits = await habitService.getAll();
    return habits[0]?.id || null;
  },

  setActiveId: async (habitId) => {
    await storage.set(storage.KEYS.ACTIVE_HABIT_ID, habitId);
    _syncHabits();
  },

  updateSeverityFromStats: async (habitId, stats) => {
    const { successRate30 = 100, totalRelapses = 0 } = stats;
    let severity = 'low';
    if (successRate30 < 40 || totalRelapses > 10) severity = 'high';
    else if (successRate30 < 70 || totalRelapses > 4) severity = 'medium';
    await habitService.update(habitId, { severity });
    return severity;
  },

  resetProgress: async (habitId) => {
    await storage.remove(storage.checkinKey(habitId));
    await storage.remove(storage.cheieImpuls(habitId));
    await storage.remove(storage.milestoneKey(habitId));
    await storage.remove(storage.bestStreakKey(habitId));
    await habitService.update(habitId, { graceDayUsed: false, createdAt: new Date().toISOString() });
    // Clear habit data in Firestore but keep the habit itself
    firestoreService.syncHabitData(habitId, 'checkins',   {}).catch(() => {});
    firestoreService.syncHabitData(habitId, 'urges',      []).catch(() => {});
    firestoreService.syncHabitData(habitId, 'milestones', []).catch(() => {});
    firestoreService.syncHabitData(habitId, 'bestStreak', 0).catch(() => {});
  },

  normalizeFields: async () => {
    const habits = await habitService.getAll();
    let changed = false;
    const normalized = habits.map((h) => {
      if (!h.habitName && h.name) {
        changed = true;
        return { ...h, habitName: h.name, habitIcon: h.icon || '🎯' };
      }
      return h;
    });
    if (changed) {
      await storage.set(storage.KEYS.HABITS, normalized);
    }
  },

  migrateFromLegacy: async () => {
    const habits = await habitService.getAll();
    if (habits.length > 0) return;
    const onboarding = await storage.get(storage.KEYS.ONBOARDING);
    if (!onboarding?.complete) return;
    const habit = await habitService.create(onboarding);
    const oldCheckins = await storage.get(storage.KEYS.CHECKINS);
    if (oldCheckins) await storage.set(storage.checkinKey(habit.id), oldCheckins);
    const oldUrges = await storage.get(storage.KEYS.URGE_EVENTS);
    if (oldUrges) await storage.set(storage.cheieImpuls(habit.id), oldUrges);
    const oldMilestones = await storage.get(storage.KEYS.MILESTONES);
    if (oldMilestones) await storage.set(storage.milestoneKey(habit.id), oldMilestones);
    const oldBest = await storage.get(storage.KEYS.BEST_STREAK);
    if (oldBest) await storage.set(storage.bestStreakKey(habit.id), oldBest);
  },
};

export default habitService;
