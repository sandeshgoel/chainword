import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '../firebase.js';
import { computeMerge, applyMerge } from '../utils/cloudStats.js';
import { SESSION_ID_KEY, LAST_USER_KEY, ALL_STAT_KEYS, ALL_PROGRESS_PREFIXES } from '../utils/storage.js';

// localStorage-based session ID — stable per browser, shared across all tabs.
// Using localStorage (not sessionStorage) prevents false conflicts between tabs
// and ensures the same browser always presents the same session identity.
function getSessionId() {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function resetSessionId() {
  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_ID_KEY, id);
  return id;
}

function readLastUser() {
  try { return JSON.parse(localStorage.getItem(LAST_USER_KEY) || 'null'); } catch { return null; }
}

function clearAllLocalStats() {
  ALL_STAT_KEYS.forEach(k => localStorage.removeItem(k));
  Object.keys(localStorage)
    .filter(k => ALL_PROGRESS_PREFIXES.some(p => k.startsWith(p)))
    .forEach(k => localStorage.removeItem(k));
}

export function useAuth(onSyncComplete) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // { admin, paid, beta }
  // lastUser: cached { displayName, email, photoURL } from the last successful sign-in,
  // shown in the UI when the user is currently signed out.
  const [lastUser, setLastUser] = useState(readLastUser);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  // signingIn: true while Google auth flow is in progress
  const [signingIn, setSigningIn] = useState(
    () => sessionStorage.getItem('braingym_signing_in') === 'true'
  );
  // pendingSync: null | { conflictsByGame, mergeResult, uid }
  const [pendingSync, setPendingSync] = useState(null);
  // sessionConflict: null | { userAgent } — another active session detected
  const [sessionConflict, setSessionConflict] = useState(null);

  const sessionId = useRef(getSessionId());
  const isNewSignIn = useRef(false);
  const unsubSessionRef = useRef(null);

  // Keep a stable ref to the callback so the effect doesn't re-run when it changes.
  const onSyncCompleteRef = useRef(onSyncComplete);
  useEffect(() => { onSyncCompleteRef.current = onSyncComplete; });

  // Run stats sync for a uid
  async function runSync(uid) {
    const syncedUid = sessionStorage.getItem('braingym_synced');
    if (syncedUid === uid) {
      onSyncCompleteRef.current?.();
      return;
    }
    try {
      const { mergeResult, conflictsByGame, cloudAddedCount } = await computeMerge(uid);
      if (Object.keys(conflictsByGame).length > 0) {
        setPendingSync({ conflictsByGame, mergeResult, uid, cloudAddedCount });
      } else {
        await applyMerge(uid, mergeResult);
        sessionStorage.setItem('braingym_synced', uid);
        onSyncCompleteRef.current?.();
        if (cloudAddedCount > 0) {
          toast.success(
            `${cloudAddedCount} result${cloudAddedCount !== 1 ? 's' : ''} loaded from cloud`
          );
        }
      }
    } catch (err) {
      console.error('Stats sync error (check Firestore rules for users/{uid}/stats/*):', err);
      onSyncCompleteRef.current?.();
    }
  }

  // Set up a real-time listener that detects when another device claims the session.
  function setupSessionListener(uid) {
    if (unsubSessionRef.current) {
      unsubSessionRef.current();
      unsubSessionRef.current = null;
    }
    const ref = doc(db, 'users', uid);
    unsubSessionRef.current = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentSessionId && data.currentSessionId !== sessionId.current) {
          // Another device claimed the session while we were active — sign out here.
          // Reset local session ID so a future sign-in on this browser starts fresh.
          sessionId.current = resetSessionId();
          firebaseSignOut(auth);
          sessionStorage.removeItem('braingym_synced');
          toast.error('Signed out — you signed in from another device.');
        }
      }
    });
  }

  useEffect(() => {
    if (!firebaseConfigured) return;

    // Handle result from signInWithRedirect (mobile flow)
    getRedirectResult(auth).then(result => {
      sessionStorage.removeItem('braingym_signing_in');
      if (result) {
        console.log('Redirect sign-in succeeded:', result.user?.email);
        isNewSignIn.current = true;
      } else {
        // No redirect result — clear spinner if it was lingering
        setSigningIn(false);
      }
    }).catch(err => {
      sessionStorage.removeItem('braingym_signing_in');
      setSigningIn(false);
      console.error('Redirect sign-in error:', err);
      toast.error(`Sign-in failed: ${err.code || err.message}`);
    });

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);

      if (u) {
        // If a different user is signing in, their local stats belong to someone else — clear them
        // so the subsequent cloud sync fills in this user's data with a clean slate.
        const previousCached = readLastUser();
        if (previousCached?.email && previousCached.email !== u.email) {
          clearAllLocalStats();
          sessionStorage.removeItem('braingym_synced');
          toast.success('Switched account — loading your stats from cloud');
        }

        // Cache identity locally so we can show the avatar when signed out
        const cached = { displayName: u.displayName, email: u.email, photoURL: u.photoURL };
        localStorage.setItem(LAST_USER_KEY, JSON.stringify(cached));
        setLastUser(cached);

        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // Brand-new user — create profile and immediately claim the session.
          await setDoc(ref, {
            displayName: u.displayName,
            email: u.email,
            photoURL: u.photoURL,
            createdAt: serverTimestamp(),
            admin: false,
            paid: false,
            beta: false,
            currentSessionId: sessionId.current,
            currentSessionLastSeen: serverTimestamp(),
            currentSessionUserAgent: navigator.userAgent,
          });
          setUserProfile({ admin: false, paid: false, beta: false });
        } else {
          const data = snap.data();
          setUserProfile({
            admin: data.admin ?? false,
            paid: data.paid ?? false,
            beta: data.beta ?? false,
          });

          // Detect an active session on a different browser/device.
          // This fires on both explicit sign-in clicks AND Firebase's auto-restore
          // on page load — both cases should show the modal.
          if (data.currentSessionId && data.currentSessionId !== sessionId.current) {
            isNewSignIn.current = false;
            setSigningIn(false);
            setSessionConflict({ userAgent: data.currentSessionUserAgent });
            return; // Wait for user to resolve before continuing
          }

          // No conflict — claim (or refresh) the session slot.
          await setDoc(ref, {
            currentSessionId: sessionId.current,
            currentSessionLastSeen: serverTimestamp(),
            currentSessionUserAgent: navigator.userAgent,
          }, { merge: true });
        }

        isNewSignIn.current = false;
        setSigningIn(false);

        // Watch for forced sign-outs while this tab is active.
        setupSessionListener(u.uid);

        await runSync(u.uid);
      } else {
        setUserProfile(null);
        setPendingSync(null);
        setSessionConflict(null);
        setSigningIn(false);
        if (unsubSessionRef.current) {
          unsubSessionRef.current();
          unsubSessionRef.current = null;
        }
      }
    });

    return () => {
      unsub();
      unsubSessionRef.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // loginHint: email of the account to pre-select (skips picker when already signed in to Google).
  // Pass null / omit to force the full account-picker (sign in as someone else).
  async function signInWithGoogle(loginHint = null) {
    if (!firebaseConfigured) {
      toast.error('Firebase not configured');
      return;
    }
    // Create a fresh provider instance per call so custom params don't bleed across calls.
    const provider = new GoogleAuthProvider();
    if (loginHint) {
      provider.setCustomParameters({ login_hint: loginHint });
    } else {
      provider.setCustomParameters({ prompt: 'select_account' });
    }

    isNewSignIn.current = true;
    setSigningIn(true);
    try {
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Mobile: redirect flow — set flag so spinner shows on return
        sessionStorage.setItem('braingym_signing_in', 'true');
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (err) {
      isNewSignIn.current = false;
      setSigningIn(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Sign-in error:', err);
        toast.error(`Sign-in failed: ${err.code || err.message}`);
      }
    }
  }

  async function signOut() {
    if (!firebaseConfigured) return;
    // Clear our session slot so no ghost session lingers for other devices.
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { currentSessionId: null }, { merge: true });
      } catch { /* best effort */ }
    }
    sessionStorage.removeItem('braingym_synced');
    await firebaseSignOut(auth);
  }

  // Resolve a concurrent session conflict:
  //   signInHere=true  → claim session here, kicking the other device
  //   signInHere=false → stay on the other device; sign out from here
  async function resolveSession(signInHere) {
    setSessionConflict(null);
    if (!user) return;

    if (signInHere) {
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, {
        currentSessionId: sessionId.current,
        currentSessionLastSeen: serverTimestamp(),
        currentSessionUserAgent: navigator.userAgent,
      }, { merge: true });
      setupSessionListener(user.uid);
      await runSync(user.uid);
    } else {
      await signOut();
    }
  }

  // User accepts the stats conflict resolution: local wins, merge applied.
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
        ? `Stats synced — ${cloudAddedCount} result${cloudAddedCount !== 1 ? 's' : ''} added, ${totalConflicts} conflict${totalConflicts !== 1 ? 's' : ''} resolved (cloud wins)`
        : `Stats synced — ${totalConflicts} conflict${totalConflicts !== 1 ? 's' : ''} resolved (cloud wins)`;
      toast.success(msg);
    } catch (err) {
      console.error('Apply merge error:', err);
      setPendingSync(null);
    }
  }

  // User declines the stats merge: sign out and discard.
  async function declineSync() {
    setPendingSync(null);
    await signOut();
  }

  return {
    user, userProfile, lastUser, authLoading, signingIn,
    signInWithGoogle, signOut,
    pendingSync, acceptSync, declineSync,
    sessionConflict, resolveSession,
  };
}
