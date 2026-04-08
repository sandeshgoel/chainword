import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, firebaseConfigured } from '../firebase.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        // Upsert user profile in Firestore on sign-in
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            createdAt: serverTimestamp(),
          });
        }
      }
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    if (!firebaseConfigured) {
      alert('Firebase is not configured. See src/firebase.js for setup instructions.');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Sign-in error:', err);
      }
    }
  }

  async function signOut() {
    if (!firebaseConfigured) return;
    await firebaseSignOut(auth);
  }

  return { user, authLoading, signInWithGoogle, signOut };
}
