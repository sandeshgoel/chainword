import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, firebaseConfigured } from '../firebase.js';
import { computeMerge, applyMerge } from '../utils/cloudStats.js';

export function useAuth(onSyncComplete) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // { admin, paid, beta }
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  // pendingSync: null | { conflictsByGame, mergeResult, uid }
  const [pendingSync, setPendingSync] = useState(null);

  // Keep a stable ref to the callback so the effect doesn't re-run when it changes.
  const onSyncCompleteRef = useRef(onSyncComplete);
  useEffect(() => { onSyncCompleteRef.current = onSyncComplete; });

  useEffect(() => {
    if (!firebaseConfigured) return;
    // Handle result from signInWithRedirect (mobile flow)
    getRedirectResult(auth).catch(err => {
      console.error('Redirect sign-in error:', err);
    });
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);

      if (u) {
        // Upsert user profile on first sign-in
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            createdAt: serverTimestamp(),
            admin: false,
            paid: false,
            beta: false,
          });
          setUserProfile({ admin: false, paid: false, beta: false });
        } else {
          const data = snap.data();
          setUserProfile({
            admin: data.admin ?? false,
            paid: data.paid ?? false,
            beta: data.beta ?? false,
          });
        }

        // Session guard: only sync once per browser session to avoid re-syncing on every page load
        const syncedUid = sessionStorage.getItem('braingym_synced');
        if (syncedUid === u.uid) {
          // Already synced this session — just notify hooks to reload from localStorage
          onSyncCompleteRef.current?.();
        } else {
          // Merge cloud stats into local
          try {
            const { mergeResult, conflictsByGame, cloudAddedCount } = await computeMerge(u.uid);
            if (Object.keys(conflictsByGame).length > 0) {
              // Conflicts found — surface them; wait for user decision
              setPendingSync({ conflictsByGame, mergeResult, uid: u.uid, cloudAddedCount });
            } else {
              // No conflicts — apply silently
              await applyMerge(u.uid, mergeResult);
              sessionStorage.setItem('braingym_synced', u.uid);
              onSyncCompleteRef.current?.();
              if (cloudAddedCount > 0) {
                toast.success(
                  `${cloudAddedCount} result${cloudAddedCount !== 1 ? 's' : ''} loaded from cloud`
                );
              }
            }
          } catch (err) {
            console.error('Stats sync error (check Firestore rules for users/{uid}/stats/*):', err);
            // Still notify so hooks reload from local storage
            onSyncCompleteRef.current?.();
          }
        }
      } else {
        setUserProfile(null);
        setPendingSync(null);
      }
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signInWithGoogle() {
    if (!firebaseConfigured) {
      alert('Firebase is not configured. See src/firebase.js for setup instructions.');
      return;
    }
    try {
      if (isMobile()) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Sign-in error:', err);
      }
    }
  }

  async function signOut() {
    if (!firebaseConfigured) return;
    sessionStorage.removeItem('braingym_synced');
    await firebaseSignOut(auth);
  }

  // User accepts the conflict resolution: local wins, merge applied, sync continues.
  async function acceptSync() {
    if (!pendingSync) return;
    const { mergeResult, uid, cloudAddedCount } = pendingSync;
    try {
      await applyMerge(uid, mergeResult);
      sessionStorage.setItem('braingym_synced', uid);
      setPendingSync(null);
      onSyncCompleteRef.current?.();
      const totalConflicts = Object.values(pendingSync.conflictsByGame).reduce((a, b) => a + b, 0);
      const msg = cloudAddedCount > 0
        ? `Stats merged — ${cloudAddedCount} result${cloudAddedCount !== 1 ? 's' : ''} from cloud, ${totalConflicts} conflict${totalConflicts !== 1 ? 's' : ''} resolved`
        : `Stats merged — ${totalConflicts} conflict${totalConflicts !== 1 ? 's' : ''} resolved (local wins)`;
      toast.success(msg);
    } catch (err) {
      console.error('Apply merge error:', err);
      setPendingSync(null);
    }
  }

  // User declines: sign out, discard pending merge.
  async function declineSync() {
    setPendingSync(null);
    await signOut();
  }

  return { user, userProfile, authLoading, signInWithGoogle, signOut, pendingSync, acceptSync, declineSync };
}
