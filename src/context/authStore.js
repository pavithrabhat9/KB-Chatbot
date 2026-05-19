import { create } from 'zustand';
import { ADMIN_CREDENTIALS } from '../utils/adminConfig';
import { signupWithEmail, loginWithEmail, loginWithGoogle, firebaseLogout, updateUserStatus, updateLastActive, createUserInFirestore } from '../utils/firebase';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isOnline: false,
  lastActive: null,

  loginAsAdmin: async (email, password) => {
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return { success: false, error: 'Invalid admin credentials' };
    }
    const userData = {
      id: ADMIN_CREDENTIALS.id,
      email: ADMIN_CREDENTIALS.email,
      fullName: ADMIN_CREDENTIALS.fullName,
      role: ADMIN_CREDENTIALS.role,
    };
    localStorage.setItem('kb_user', JSON.stringify(userData));
    try {
      await createUserInFirestore(userData);
      await updateUserStatus(email, true);
    } catch (err) {
      console.warn('Firestore update skipped:', err.message);
    }
    set({ user: userData, isAuthenticated: true, isOnline: true, lastActive: new Date().toISOString() });
    return { success: true, error: null };
  },

  signupWithEmail: async (email, password, fullName) => {
    const result = await signupWithEmail(email, password, fullName);
    if (result.success) {
      localStorage.setItem('kb_user', JSON.stringify(result.user));
      set({ user: result.user, isAuthenticated: true, isOnline: true, lastActive: new Date().toISOString() });
    }
    return result;
  },

  loginWithEmail: async (email, password) => {
    const result = await loginWithEmail(email, password);
    if (result.success) {
      localStorage.setItem('kb_user', JSON.stringify(result.user));
      set({ user: result.user, isAuthenticated: true, isOnline: true, lastActive: new Date().toISOString() });
    }
    return result;
  },

  loginWithGoogle: async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      localStorage.setItem('kb_user', JSON.stringify(result.user));
      set({ user: result.user, isAuthenticated: true, isOnline: true, lastActive: new Date().toISOString() });
    }
    return result;
  },

  logout: async () => {
    const { user } = get();
    if (user && user.role === 'employee') {
      await updateUserStatus(user.email, false);
      await firebaseLogout();
    } else if (user) {
      await updateUserStatus(user.email, false);
    }
    localStorage.removeItem('kb_user');
    set({ user: null, isAuthenticated: false, isOnline: false, lastActive: null });
  },

  setOnlineStatus: async (isOnline) => {
    const { user } = get();
    if (user) {
      await updateUserStatus(user.email, isOnline);
      set({ isOnline });
    }
  },

  updateLastActive: async () => {
    const { user } = get();
    if (user) {
      await updateLastActive(user.email);
      set({ lastActive: new Date().toISOString() });
    }
  },

  restoreSession: () => {
    const stored = localStorage.getItem('kb_user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        // Set online on session restore (page refresh)
        updateUserStatus(userData.email, true).catch(() => {});
        set({ user: userData, isAuthenticated: true, isOnline: true, lastActive: new Date().toISOString() });
        return true;
      } catch {
        localStorage.removeItem('kb_user');
        return false;
      }
    }
    return false;
  },
}));

export default useAuthStore;