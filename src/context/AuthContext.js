import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import authService, { isFirebaseConfigured, toAppUser } from '../services/authService';
import storage from '../services/storageService';
import firestoreService from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [splashPending, setSplashPending] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const u = toAppUser(firebaseUser);
          await storage.set(storage.KEYS.USER, u);
          setUser(u);
        } else {
          const stored = await storage.get(storage.KEYS.USER);
          setUser(stored?.isGuest ? stored : null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
    (async () => {
      try {
        const u = await storage.get(storage.KEYS.USER);
        setUser(u || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  };

  const register = async (email, password, name) => {
    const u = await authService.register(email, password, name);
    setUser(u);
    return u;
  };

  const continueAsGuest = async () => {
    await storage.clearAll();
    const guestUser = {
      id: 'guest',
      name: 'Vizitator',
      email: '',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    await storage.set(storage.KEYS.USER, guestUser);
    setUser(guestUser);
    return guestUser;
  };

  const logout = async () => {
    firestoreService.resetHydration();
    await authService.logout();
    setUser(null);
  };

  const deleteAccount = async () => {
    setSplashPending(true);
    await authService.deleteAccount().catch(() => {});
    setUser(null);
  };

  const resetPassword = async (email) => {
    await authService.resetPassword(email);
  };

  const refreshUser = async () => {
    const u = await authService.getCurrentUser();
    setUser(u);
  };

  const consumeSplashPending = () => setSplashPending(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        deleteAccount,
        resetPassword,
        refreshUser,
        continueAsGuest,
        splashPending,
        consumeSplashPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
