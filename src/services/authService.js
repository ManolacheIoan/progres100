import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import storage from './storageService';
import firestoreService from './firestoreService';

function mapFirebaseError(code) {
  const messages = {
    'auth/user-not-found':        'Nu există un cont cu acest email.',
    'auth/wrong-password':        'Parolă incorectă. Încearcă din nou.',
    'auth/invalid-credential':    'Email sau parolă incorectă.',
    'auth/email-already-in-use':  'Există deja un cont cu această adresă de email.',
    'auth/invalid-email':         'Adresa de email nu este validă.',
    'auth/weak-password':         'Parola trebuie să aibă minim 6 caractere.',
    'auth/too-many-requests':     'Prea multe încercări. Încearcă din nou mai târziu.',
    'auth/network-request-failed':'Eroare de conexiune. Verifică internetul.',
    'auth/operation-not-allowed': 'Autentificarea cu email nu este activată.',
    'auth/requires-recent-login': 'Te rugăm să te autentifici din nou.',
    'auth/user-disabled':         'Contul a fost dezactivat.',
  };
  return messages[code] || 'A apărut o eroare. Încearcă din nou.';
}

function toAppUser(firebaseUser) {
  return {
    id:        firebaseUser.uid,
    email:     firebaseUser.email,
    name:      firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilizator',
    createdAt: firebaseUser.metadata?.creationTime || new Date().toISOString(),
  };
}

const authService = {
  login: async (email, password) => {
    if (isFirebaseConfigured) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = toAppUser(cred.user);
        await storage.set(storage.KEYS.USER, user);
        return user;
      } catch (err) {
        throw new Error(mapFirebaseError(err.code));
      }
    }

    
    if (!email || !password) throw new Error('Email și parola sunt obligatorii.');
    const stored = await storage.get(storage.KEYS.USER);
    if (stored && stored.email === email.toLowerCase().trim()) return stored;
    const user = {
      id: `local_${Date.now()}`,
      email: email.toLowerCase().trim(),
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    await storage.set(storage.KEYS.USER, user);
    return user;
  },

  register: async (email, password, name) => {
    if (isFirebaseConfigured) {
      try {
        await storage.clearAll();
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name?.trim() || email.split('@')[0] });
        const user = toAppUser(cred.user);
       
        user.name = name?.trim() || email.split('@')[0];
        await storage.set(storage.KEYS.USER, user);
       
        firestoreService.syncUser({ name: user.name, email: user.email, createdAt: user.createdAt }).catch(() => {});
        return user;
      } catch (err) {
        throw new Error(mapFirebaseError(err.code));
      }
    }


    if (!email || !password) throw new Error('Email și parola sunt obligatorii.');
    if (password.length < 6) throw new Error('Parola trebuie să aibă minim 6 caractere.');
    const user = {
      id: `local_${Date.now()}`,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    await storage.clearAll();
    await storage.set(storage.KEYS.USER, user);
    return user;
  },

  logout: async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    await storage.clearAll();
  },

  deleteAccount: async () => {
    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        await firestoreService.deleteAllUserData();
        await auth.currentUser.delete();
      } catch (err) {
        throw new Error(mapFirebaseError(err.code));
      }
    }
    await storage.clearAll();
  },

  resetPassword: async (email) => {
    if (!email) throw new Error('Email-ul este obligatoriu.');
    if (isFirebaseConfigured) {
      try {
        await sendPasswordResetEmail(auth, email.trim());
      } catch (err) {
        throw new Error(mapFirebaseError(err.code));
      }
      return;
    }
   
  },

  getCurrentUser: async () => {
    if (isFirebaseConfigured) {
      return auth?.currentUser ? toAppUser(auth.currentUser) : null;
    }
    return await storage.get(storage.KEYS.USER);
  },

  updateProfile: async (updates) => {
    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        if (updates.name) await updateProfile(auth.currentUser, { displayName: updates.name });
      } catch (err) {
        throw new Error(mapFirebaseError(err.code));
      }
    }
    const current = await storage.get(storage.KEYS.USER);
    const updated = { ...(current || {}), ...updates };
    await storage.set(storage.KEYS.USER, updated);
    return updated;
  },
};

export { isFirebaseConfigured, toAppUser };
export default authService;
