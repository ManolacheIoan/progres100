import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@progres100:user',
  HABITS: '@progres100:habits',
  ACTIVE_HABIT_ID: '@progres100:active_habit_id',
  SETTINGS: '@progres100:settings',
  JOURNAL: '@progres100:journal',
  
  ONBOARDING: '@progres100:onboarding_complete',
  CHECKINS: '@progres100:checkins',
  URGE_EVENTS: '@progres100:urge_events',
  MILESTONES: '@progres100:milestones',
  BEST_STREAK: '@progres100:best_streak',
};


const habitKey = (habitId, type) => `@progres100:${type}_${habitId}`;
const checkinKey = (habitId) => habitKey(habitId, 'checkins');
const cheieImpuls = (habitId) => habitKey(habitId, 'urges');
const milestoneKey = (habitId) => habitKey(habitId, 'milestones');
const bestStreakKey = (habitId) => habitKey(habitId, 'best_streak');

const get = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const set = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const remove = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const clearAll = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const progresKeys = keys.filter((k) => k.startsWith('@progres100:'));
    await AsyncStorage.multiRemove(progresKeys);
    return true;
  } catch {
    return false;
  }
};

export default {
  get, set, remove, clearAll,
  KEYS,
  checkinKey, cheieImpuls, milestoneKey, bestStreakKey,
};
