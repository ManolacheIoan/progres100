import storage from './storageService';
import { dateKey } from './checkinService';

const journalService = {
  getAll: async () => {
    return (await storage.get(storage.KEYS.JOURNAL)) || [];
  },

  getForDate: async (dateStr) => {
    const entries = await journalService.getAll();
    return entries.find((e) => e.date === dateStr) || null;
  },

  save: async ({ date, text, mood }) => {
    const entries = await journalService.getAll();
    const key = typeof date === 'string' ? date : dateKey(date);
    const index = entries.findIndex((e) => e.date === key);
    const entry = {
      id: `journal_${key}`,
      date: key,
      text,
      mood,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    await storage.set(storage.KEYS.JOURNAL, entries);
    return entry;
  },

  delete: async (dateStr) => {
    const entries = await journalService.getAll();
    const filtered = entries.filter((e) => e.date !== dateStr);
    await storage.set(storage.KEYS.JOURNAL, filtered);
  },
};

export default journalService;
