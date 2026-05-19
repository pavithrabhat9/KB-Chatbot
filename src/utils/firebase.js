import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from '@firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from '@firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// === Collection References ===
const usersRef = collection(db, 'users');
const kbArticlesRef = collection(db, 'kb_articles');
const chatSessionsRef = collection(db, 'chat_sessions');
const chatMessagesRef = collection(db, 'chat_messages');

// === Firebase Auth Operations ===
export const signupWithEmail = async (email, password, fullName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    // Create Firestore user doc
    await setDoc(doc(db, 'users', email), {
      email,
      fullName,
      role: 'employee',
      createdAt: serverTimestamp(),
      isOnline: true,
      lastActive: serverTimestamp(),
    });
    return { 
      success: true, 
      user: { id: firebaseUser.uid, email, fullName, role: 'employee' },
      error: null 
    };
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, user: null, error: 'Email already registered. Please sign in instead.' };
    }
    return { success: false, user: null, error: error.message || 'Signup failed.' };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    // Get user from Firestore
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Update online status
      await updateDoc(doc(db, 'users', email), { isOnline: true, lastActive: serverTimestamp() });
      return { 
        success: true, 
        user: { id: firebaseUser.uid, email, fullName: userData.fullName, role: userData.role },
        error: null 
      };
    }
    return { success: false, user: null, error: 'User not found.' };
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      return { success: false, user: null, error: 'Invalid email or password.' };
    }
    return { success: false, user: null, error: error.message || 'Login failed.' };
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const email = firebaseUser.email;
    const fullName = firebaseUser.displayName || email.split('@')[0];
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', email));
    if (!userDoc.exists()) {
      // Create new employee
      await setDoc(doc(db, 'users', email), {
        email,
        fullName,
        role: 'employee',
        createdAt: serverTimestamp(),
        isOnline: true,
        lastActive: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'users', email), { isOnline: true, lastActive: serverTimestamp() });
    }
    return { 
      success: true, 
      user: { id: firebaseUser.uid, email, fullName, role: 'employee' },
      error: null 
    };
  } catch (error) {
    console.error('Google login error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, user: null, error: 'Sign-in popup was closed.' };
    }
    return { success: false, user: null, error: error.message || 'Google sign-in failed.' };
  }
};

export const firebaseLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// === User Operations ===
export const createUserInFirestore = async (user) => {
  try {
    const userDoc = doc(db, 'users', user.email);
    await setDoc(userDoc, {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: serverTimestamp(),
      isOnline: false,
      lastActive: null,
    });
  } catch (error) {
    console.error('Error creating user:', error);
  }
};

export const updateUserStatus = async (email, isOnline) => {
  try {
    const userDoc = doc(db, 'users', email);
    await updateDoc(userDoc, {
      isOnline,
      lastActive: isOnline ? serverTimestamp() : serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

export const updateLastActive = async (email) => {
  try {
    const userDoc = doc(db, 'users', email);
    await updateDoc(userDoc, {
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last active:', error);
  }
};

export const getAllUsers = () => {
  return query(usersRef, orderBy('createdAt', 'asc'));
};

export const subscribeToUsers = (callback) => {
  return onSnapshot(usersRef, (snapshot) => {
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    callback(users);
  }, (error) => {
    console.error('Error subscribing to users:', error);
  });
};

// === KB Articles Operations ===
export const createArticle = async (article) => {
  try {
    const docRef = await addDoc(kbArticlesRef, {
      title: article.title,
      content: article.content,
      createdBy: article.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...article };
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

export const updateArticle = async (id, data) => {
  try {
    const articleDoc = doc(db, 'kb_articles', id);
    await updateDoc(articleDoc, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
};

export const deleteArticle = async (id) => {
  try {
    const articleDoc = doc(db, 'kb_articles', id);
    await deleteDoc(articleDoc);
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
};

export const subscribeToArticles = (callback) => {
  const q = query(kbArticlesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const articles = [];
    snapshot.forEach((doc) => {
      articles.push({ id: doc.id, ...doc.data() });
    });
    callback(articles);
  }, (error) => {
    console.error('Error subscribing to articles:', error);
  });
};

// === Chat Sessions Operations ===
export const createChatSession = async (employeeId, title = 'New Chat') => {
  try {
    const docRef = await addDoc(chatSessionsRef, {
      employeeId,
      title,
      isActive: true,
      createdAt: serverTimestamp(),
      endedAt: null,
      endedBy: null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

export const endChatSession = async (sessionId, endedBy) => {
  try {
    const sessionDoc = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionDoc, {
      isActive: false,
      endedAt: serverTimestamp(),
      endedBy,
    });
  } catch (error) {
    console.error('Error ending chat session:', error);
    throw error;
  }
};

export const subscribeToSessions = (employeeId, callback) => {
  const q = query(chatSessionsRef, where('employeeId', '==', employeeId));
  return onSnapshot(q, (snapshot) => {
    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    sessions.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
    callback(sessions);
  }, (error) => {
    console.error('Error subscribing to sessions:', error);
    callback([]);
  });
};

export const subscribeToAllSessions = (callback) => {
  const q = query(chatSessionsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    callback(sessions);
  }, (error) => {
    console.error('Error subscribing to all sessions:', error);
  });
};

export const getSessionById = async (sessionId) => {
  try {
    const sessionDoc = doc(db, 'chat_sessions', sessionId);
    const snapshot = await getDoc(sessionDoc);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// === Chat Messages Operations ===
export const sendMessage = async (sessionId, senderType, content) => {
  try {
    const docRef = await addDoc(chatMessagesRef, {
      sessionId,
      senderType,
      content,
      createdAt: serverTimestamp(),
      isStreaming: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToMessages = (sessionId, callback) => {
  const q = query(chatMessagesRef, where('sessionId', '==', sessionId));
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    messages.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return aTime - bTime;
    });
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
    callback([]);
  });
};

export const subscribeToSessionStatus = (sessionId, callback) => {
  const sessionDoc = doc(db, 'chat_sessions', sessionId);
  return onSnapshot(sessionDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  }, (error) => {
    console.error('Error subscribing to session status:', error);
  });
};

export {
  db,
  app,
  auth,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
};