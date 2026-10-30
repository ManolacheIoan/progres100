import storage from './storageService';
import firestoreService from './firestoreService';
import { dateKey } from './checkinService';

const impulsService = {
  toateImpulsurile: async (habitId) => {
    if (!habitId) return [];
    return (await storage.get(storage.cheieImpuls(habitId))) || [];
  },

  adaugaImpuls: async (habitId, { intensity = 3, cause = '', resisted = null, note = '' } = {}) => {
    const impulsuri = await impulsService.toateImpulsurile(habitId);
    const impulsNou = {
      id: `impuls_${Date.now()}`,
      habitId,
      date: dateKey(),
      timestamp: new Date().toISOString(),
      intensity,
      cause,
      resisted,
      note,
    };
    impulsuri.push(impulsNou);
    await storage.set(storage.cheieImpuls(habitId), impulsuri);
    firestoreService.syncHabitData(habitId, 'urges', impulsuri).catch(() => {});
    return impulsNou;
  },

  actualizeazaRezultat: async (habitId, id, rezistat) => {
    const impulsuri = await impulsService.toateImpulsurile(habitId);
    const index = impulsuri.findIndex((impuls) => impuls.id === id);
    if (index >= 0) {
      impulsuri[index] = { ...impulsuri[index], resisted: rezistat };
      await storage.set(storage.cheieImpuls(habitId), impulsuri);
      firestoreService.syncHabitData(habitId, 'urges', impulsuri).catch(() => {});
      return impulsuri[index];
    }
    return null;
  },

  impulsurileZilei: async (habitId, data) => {
    const impulsuri = await impulsService.toateImpulsurile(habitId);
    return impulsuri.filter((impuls) => impuls.date === data);
  },

  totalRezistite: async (habitId) => {
    const impulsuri = await impulsService.toateImpulsurile(habitId);
    return impulsuri.filter((impuls) => impuls.resisted === true).length;
  },

  cauzaPrincipala: async (habitId) => {
    const impulsuri = await impulsService.toateImpulsurile(habitId);
    if (!impulsuri.length) return null;
    const counts = {};
    for (const impuls of impulsuri) {
      if (impuls.cause) {
        counts[impuls.cause] = (counts[impuls.cause] || 0) + 1;
      }
    }
    let celMaiFrequent = null;
    let maxCount = 0;
    for (const [cauza, count] of Object.entries(counts)) {
      if (count > maxCount) {
        celMaiFrequent = cauza;
        maxCount = count;
      }
    }
    return celMaiFrequent;
  },
};

export default impulsService;
