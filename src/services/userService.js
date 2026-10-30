import storage from './storageService';
import firestoreService from './firestoreService';

const userService = {
  getProfile: async () => {
    return await storage.get(storage.KEYS.USER);
  },

  updateProfile: async (updates) => {
    const current = await storage.get(storage.KEYS.USER);
    const updated = { ...(current || {}), ...updates };
    await storage.set(storage.KEYS.USER, updated);
    firestoreService.syncUser(updates).catch(() => {});
    return updated;
  },

  getOnboarding: async () => {
    return await storage.get(storage.KEYS.ONBOARDING);
  },

  setOnboardingComplete: async (habitData) => {
    await storage.set(storage.KEYS.ONBOARDING, {
      complete: true,
      completedAt: new Date().toISOString(),
      ...habitData,
    });
  },

  getSettings: async () => {
    const settings = await storage.get(storage.KEYS.SETTINGS);
    return {
      reminderEnabled: true,
      reminderTime: '20:00',
      theme: 'dark',
      isPremium: false,
      ...(settings || {}),
    };
  },

  updateSettings: async (updates) => {
    const current = await userService.getSettings();
    const updated = { ...current, ...updates };
    await storage.set(storage.KEYS.SETTINGS, updated);
    firestoreService.syncUser({ settings: updated }).catch(() => {});
    return updated;
  },

  activatePremium: async (plan) => {
    const current = await userService.getSettings();
    const now = new Date();
    const expiresAt = plan?.id === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()
      : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
    const updated = {
      ...current,
      isPremium: true,
      premiumActivatedAt: now.toISOString(),
      premiumExpiresAt: expiresAt,
      premiumCancelled: false,
    };
    await storage.set(storage.KEYS.SETTINGS, updated);
    firestoreService.syncUser({ settings: updated }).catch(() => {});
    return updated;
  },

  cancelPremium: async () => {
    const current = await userService.getSettings();
    const updated = { ...current, premiumCancelled: true };
    await storage.set(storage.KEYS.SETTINGS, updated);
    firestoreService.syncUser({ settings: updated }).catch(() => {});
    return updated;
  },

  resetProgress: async () => {
    await storage.remove(storage.KEYS.CHECKINS);
    await storage.remove(storage.KEYS.URGE_EVENTS);
    await storage.remove(storage.KEYS.MILESTONES);
    await storage.remove(storage.KEYS.JOURNAL);
    await storage.remove(storage.KEYS.BEST_STREAK);
    return true;
  },
};

export default userService;
