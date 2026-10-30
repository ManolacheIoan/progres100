import storage from './storageService';
import firestoreService from './firestoreService';

export const dateKey = (date = new Date()) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const checkinService = {
  getAllCheckins: async (habitId) => {
    if (!habitId) return {};
    return (await storage.get(storage.checkinKey(habitId))) || {};
  },

  getCheckin: async (habitId, date) => {
    const checkins = await checkinService.getAllCheckins(habitId);
    return checkins[dateKey(date)] || null;
  },

  addSuccess: async (habitId, { date = new Date(), impulseIntensity = 0, note = '' } = {}) => {
    const checkins = await checkinService.getAllCheckins(habitId);
    const key = dateKey(date);
    checkins[key] = { date: key, status: 'success', impulseIntensity, note, createdAt: new Date().toISOString() };
    await storage.set(storage.checkinKey(habitId), checkins);
    firestoreService.syncHabitData(habitId, 'checkins', checkins).catch(() => {});
    return checkins[key];
  },

  addRelapse: async (habitId, { date = new Date(), trigger = '', intensity = 0, note = '' } = {}) => {
    const checkins = await checkinService.getAllCheckins(habitId);
    const key = dateKey(date);
    checkins[key] = { date: key, status: 'relapse', trigger, impulseIntensity: intensity, note, createdAt: new Date().toISOString() };
    await storage.set(storage.checkinKey(habitId), checkins);
    firestoreService.syncHabitData(habitId, 'checkins', checkins).catch(() => {});
    return checkins[key];
  },

  getTodayStatus: async (habitId) => {
    const today = await checkinService.getCheckin(habitId, new Date());
    return today ? today.status : 'none';
  },

  applyGraceDay: async (habitId) => {
    const checkins = await checkinService.getAllCheckins(habitId);
    const key = dateKey(new Date());
    checkins[key] = { date: key, status: 'grace', note: 'Zi de grație', createdAt: new Date().toISOString() };
    await storage.set(storage.checkinKey(habitId), checkins);
    firestoreService.syncHabitData(habitId, 'checkins', checkins).catch(() => {});
    return checkins[key];
  },
};

export default checkinService;
