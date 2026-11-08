import checkinService, { dateKey } from './checkinService';
import storage from './storageService';
import firestoreService from './firestoreService';

/** Whole days between two "YYYY-MM-DD" keys, computed in UTC so daylight saving time does not matter. */
const daysBetween = (fromKey, toKey) => {
  const toUtc = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / 86400000);
};

const statsService = {
  computeCurrentStreak: (checkins) => {
    let streak = 0;
    const today = new Date();
    let cursor = new Date(today);
    const todayKey = dateKey(today);
    const todayEntry = checkins[todayKey];
    if (!todayEntry || (todayEntry.status !== 'success' && todayEntry.status !== 'grace')) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (true) {
      const key = dateKey(cursor);
      const entry = checkins[key];
      if (!entry || (entry.status !== 'success' && entry.status !== 'grace')) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  computeBestStreak: async (habitId, checkins) => {
    const storedBest = (await storage.get(storage.bestStreakKey(habitId))) || 0;
    const dates = Object.keys(checkins).sort();
    if (!dates.length) return storedBest;
    let current = 0;
    let best = storedBest;
    let previousKey = null;
    for (const date of dates) {
      const status = checkins[date].status;
      if (status === 'success' || status === 'grace') {
        // A day without a check-in breaks the run, the same way it does for the current streak.
        const continuesRun = previousKey !== null && daysBetween(previousKey, date) === 1;
        current = continuesRun ? current + 1 : 1;
        if (current > best) best = current;
      } else {
        current = 0;
      }
      previousKey = date;
    }
    if (best > storedBest) {
      await storage.set(storage.bestStreakKey(habitId), best);
      firestoreService.syncHabitData(habitId, 'bestStreak', best).catch(() => {});
    }
    return best;
  },

  computeSuccessRate: (checkins, days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    let total = 0;
    let success = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = dateKey(cursor);
      const entry = checkins[key];
      if (entry && (entry.status === 'success' || entry.status === 'relapse' || entry.status === 'grace')) {
        total++;
        if (entry.status === 'success') success++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return total === 0 ? 0 : Math.round((success / total) * 100);
  },

  computeTotalRelapses: (checkins) =>
    Object.values(checkins).filter((inregistrare) => inregistrare.status === 'relapse').length,

  getMostCommonTrigger: (checkins) => {
    const counts = {};
    for (const inregistrare of Object.values(checkins)) {
      if (inregistrare.status === 'relapse' && inregistrare.trigger) {
        counts[inregistrare.trigger] = (counts[inregistrare.trigger] || 0) + 1;
      }
    }
    let best = null;
    let bestCount = 0;
    for (const [trigger, count] of Object.entries(counts)) {
      if (count > bestCount) {
        best = trigger;
        bestCount = count;
      }
    }
    return best;
  },

  getHardestDayOfWeek: (checkins) => {
    const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const counts = {};
    for (const inregistrare of Object.values(checkins)) {
      if (inregistrare.status === 'relapse') {
        const day = new Date(inregistrare.date).getDay();
        counts[day] = (counts[day] || 0) + 1;
      }
    }
    let worstDay = null;
    let worstCount = 0;
    for (const [day, count] of Object.entries(counts)) {
      if (count > worstCount) {
        worstDay = day;
        worstCount = count;
      }
    }
    return worstDay !== null ? days[parseInt(worstDay)] : null;
  },

  getFullStats: async (habitId) => {
    if (!habitId) {
      return {
        currentStreak: 0, bestStreak: 0,
        successRate7: 0, successRate30: 0,
        totalRelapses: 0, totalCheckins: 0,
        mainTrigger: null, hardestDay: null,
      };
    }
    const checkins = await checkinService.getAllCheckins(habitId);
    const currentStreak = statsService.computeCurrentStreak(checkins);
    const bestStreak = await statsService.computeBestStreak(habitId, checkins);
    const successRate7 = statsService.computeSuccessRate(checkins, 7);
    const successRate30 = statsService.computeSuccessRate(checkins, 30);
    const totalRelapses = statsService.computeTotalRelapses(checkins);
    const mainTrigger = statsService.getMostCommonTrigger(checkins);
    const hardestDay = statsService.getHardestDayOfWeek(checkins);
    const totalCheckins = Object.values(checkins).filter(
      (inregistrare) => inregistrare.status === 'success' || inregistrare.status === 'relapse' || inregistrare.status === 'grace'
    ).length;
    return {
      currentStreak, bestStreak, successRate7, successRate30,
      totalRelapses, mainTrigger, hardestDay, totalCheckins,
    };
  },
};

export default statsService;
