import { useEffect, useState } from 'react';
import {
  collection, doc, onSnapshot, updateDoc, setDoc, deleteField,
} from 'firebase/firestore';
import { db, firebaseConfigured } from '../firebase.js';
import {
  GAME_ID_CHAINWORD, GAME_ID_WORD4, GAME_ID_TILES,
  GAME_ID_SQUARES, GAME_ID_SHABDAL, GAME_ID_CRYPTIC,
} from '../gamesMeta.js';

const DEFAULT_GLOBAL_CONFIG = { ads_enabled: false };

const DEFAULT_GAMES_CONFIG = {
  [GAME_ID_CHAINWORD]: { paid: false },
  [GAME_ID_WORD4]:     { paid: false },
  [GAME_ID_TILES]:     { paid: false },
  [GAME_ID_SQUARES]:   { paid: false },
  [GAME_ID_SHABDAL]:   { paid: false },
  [GAME_ID_CRYPTIC]:   { paid: false },
};

export { DEFAULT_GAMES_CONFIG, DEFAULT_GLOBAL_CONFIG };

export function useAdmin() {
  const [users, setUsers] = useState([]);
  const [gamesConfig, setGamesConfig] = useState(DEFAULT_GAMES_CONFIG);
  const [globalConfig, setGlobalConfig] = useState(DEFAULT_GLOBAL_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [gamesLoaded, setGamesLoaded] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const loading = !configLoaded || !gamesLoaded;

  useEffect(() => {
    if (!firebaseConfigured) {
      setConfigLoaded(true);
      setGamesLoaded(true);
      return;
    }

    // Real-time listener for all users
    const usersUnsub = onSnapshot(
      collection(db, 'users'),
      snap => { setUsersError(null); setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))); },
      err => { console.error('useAdmin users snapshot error:', err); setUsersError(err.code || err.message); },
    );

    // Real-time listener for /admin/games
    const gamesRef = doc(db, 'admin', 'games');
    const gamesUnsub = onSnapshot(gamesRef, async snap => {
      if (!snap.exists()) {
        await setDoc(gamesRef, DEFAULT_GAMES_CONFIG);
      } else {
        const data = snap.data();
        // One-time migration: rename '4word' key → 'word4'
        if (data['4word'] && !data[GAME_ID_WORD4]) {
          await updateDoc(gamesRef, { [GAME_ID_WORD4]: data['4word'], '4word': deleteField() });
        } else if (!data[GAME_ID_WORD4]) {
          // 'word4' entry missing (e.g. was deleted) — seed it with the default
          await updateDoc(gamesRef, { [GAME_ID_WORD4]: DEFAULT_GAMES_CONFIG[GAME_ID_WORD4] });
        }
        setGamesConfig({ ...DEFAULT_GAMES_CONFIG, ...snap.data() });
      }
      setGamesLoaded(true);
    }, err => {
      console.error('useAdmin games snapshot error:', err);
      setGamesLoaded(true);
    });

    // Real-time listener for /admin/config
    const configRef = doc(db, 'admin', 'config');
    const configUnsub = onSnapshot(configRef, async snap => {
      if (!snap.exists()) {
        await setDoc(configRef, DEFAULT_GLOBAL_CONFIG);
      } else {
        setGlobalConfig({ ...DEFAULT_GLOBAL_CONFIG, ...snap.data() });
      }
      setConfigLoaded(true);
    }, err => {
      console.error('useAdmin config snapshot error:', err);
      setConfigLoaded(true);
    });

    return () => {
      usersUnsub();
      gamesUnsub();
      configUnsub();
    };
  }, []);

  async function updateUser(uid, fields) {
    await updateDoc(doc(db, 'users', uid), fields);
  }

  // Updates a single game's fields using dot-notation to avoid overwriting sibling games
  async function updateGame(gameId, fields) {
    const update = {};
    for (const [k, v] of Object.entries(fields)) {
      update[`${gameId}.${k}`] = v;
    }
    await updateDoc(doc(db, 'admin', 'games'), update);
  }

  async function updateGlobalConfig(fields) {
    await updateDoc(doc(db, 'admin', 'config'), fields);
  }

  return { users, usersError, gamesConfig, globalConfig, updateUser, updateGame, updateGlobalConfig, loading };
}
