import { doc, getDoc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import storage from './storageService';

const hydratedUids = new Set();

function isAvailable() {
  return isFirebaseConfigured && !!db && !!auth?.currentUser;
}

function getUid() {
  return auth?.currentUser?.uid;
}

const firestoreService = {
  isAvailable,

  syncUser: async (fields) => {
    if (!isAvailable()) return;
    await setDoc(doc(db, 'users', getUid()), fields, { merge: true });
  },

  syncHabits: async (habits, activeHabitId) => {
    if (!isAvailable()) return;
    await setDoc(
      doc(db, 'users', getUid()),
      { habits, activeHabitId },
      { merge: true }
    );
  },

  syncHabitData: async (habitId, field, value) => {
    if (!isAvailable()) return;
    await setDoc(
      doc(db, 'users', getUid(), 'habitData', habitId),
      { [field]: value },
      { merge: true }
    );
  },

  deleteHabitData: async (habitId) => {
    if (!isAvailable()) return;
    await deleteDoc(doc(db, 'users', getUid(), 'habitData', habitId));
  },

  hydrateFromCloud: async () => {
    const uid = getUid();
    if (!uid || hydratedUids.has(uid) || !isAvailable()) return;

    try {
      const [userSnap, habitDataSnap] = await Promise.all([
        getDoc(doc(db, 'users', uid)),
        getDocs(collection(db, 'users', uid, 'habitData')),
      ]);

      if (!userSnap.exists()) {
        hydratedUids.add(uid);
        return;
      }

      const data = userSnap.data();

      if (Array.isArray(data.habits) && data.habits.length > 0) {
        await storage.set(storage.KEYS.HABITS, data.habits);
      }
      if (data.activeHabitId) {
        await storage.set(storage.KEYS.ACTIVE_HABIT_ID, data.activeHabitId);
      }
      if (data.settings) {
        await storage.set(storage.KEYS.SETTINGS, data.settings);
      }

      const { habits, activeHabitId, settings, ...profile } = data;
      if (profile.email) {
        const existing = await storage.get(storage.KEYS.USER);
        await storage.set(storage.KEYS.USER, { ...(existing || {}), ...profile });
      }

      await Promise.all(
        habitDataSnap.docs.map(async (d) => {
          const habitId = d.id;
          const hd = d.data();
          if (hd.checkins)   await storage.set(storage.checkinKey(habitId),   hd.checkins);
          if (hd.urges)      await storage.set(storage.cheieImpuls(habitId),      hd.urges);
          if (hd.milestones) await storage.set(storage.milestoneKey(habitId), hd.milestones);
          if (typeof hd.bestStreak === 'number') {
            await storage.set(storage.bestStreakKey(habitId), hd.bestStreak);
          }
        })
      );

      hydratedUids.add(uid);
    } catch {
      // Silent fail — local cache will be used
    }
  },

  deleteAllUserData: async () => {
    if (!isAvailable()) return;
    const uid = getUid();
    const habitDataSnap = await getDocs(collection(db, 'users', uid, 'habitData'));
    await Promise.all(habitDataSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, 'users', uid));
  },

  resetHydration: () => {
    const uid = getUid();
    if (uid) hydratedUids.delete(uid);
  },
};

export default firestoreService;
