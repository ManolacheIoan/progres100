import storage from './storageService';
import firestoreService from './firestoreService';
import { MILESTONE_DEFINITIONS } from '../constants/milestoneDefinitions';
import statsService from './statsService';
import checkinService from './checkinService';

const milestoneService = {
  getAchieved: async (habitId) => {
    if (!habitId) return [];
    return (await storage.get(storage.milestoneKey(habitId))) || [];
  },

  checkAndUnlock: async (habitId) => {
    if (!habitId) return [];
    const checkins = await checkinService.getAllCheckins(habitId);
    const currentStreak = statsService.computeCurrentStreak(checkins);
    const achieved = await milestoneService.getAchieved(habitId);
    const achievedIds = achieved.map((etapa) => etapa.id);
    const newlyUnlocked = [];

    for (const def of MILESTONE_DEFINITIONS) {
      if (!achievedIds.includes(def.id) && currentStreak >= def.days) {
        const entry = { ...def, achievedAt: new Date().toISOString(), streak: currentStreak };
        achieved.push(entry);
        newlyUnlocked.push(entry);
      }
    }

    if (newlyUnlocked.length > 0) {
      await storage.set(storage.milestoneKey(habitId), achieved);
      firestoreService.syncHabitData(habitId, 'milestones', achieved).catch(() => {});
    }

    return newlyUnlocked;
  },

  getAllWithStatus: async (habitId) => {
    if (!habitId) return MILESTONE_DEFINITIONS.map((definitie) => ({ ...definitie, achieved: false, progress: 0, currentStreak: 0 }));
    const checkins = await checkinService.getAllCheckins(habitId);
    const currentStreak = statsService.computeCurrentStreak(checkins);
    const achieved = await milestoneService.getAchieved(habitId);
    const achievedIds = achieved.map((etapa) => etapa.id);

    return MILESTONE_DEFINITIONS.map((def) => ({
      ...def,
      achieved: achievedIds.includes(def.id),
      achievedAt: achieved.find((etapa) => etapa.id === def.id)?.achievedAt || null,
      progress: Math.min(currentStreak / def.days, 1),
      currentStreak,
    }));
  },

  getNextMilestone: async (habitId) => {
    if (!habitId) return MILESTONE_DEFINITIONS[0];
    const checkins = await checkinService.getAllCheckins(habitId);
    const currentStreak = statsService.computeCurrentStreak(checkins);
    const achieved = await milestoneService.getAchieved(habitId);
    const achievedIds = achieved.map((etapa) => etapa.id);
    return MILESTONE_DEFINITIONS.find((def) => !achievedIds.includes(def.id) && def.days > currentStreak) || null;
  },
};

export default milestoneService;
