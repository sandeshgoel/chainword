import { useState, useEffect, useCallback } from 'react';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseConfigured } from '../../../firebase.js';
import { bfs, diffsByOneLetter, getStars } from '../../../utils/wordUtils.js';
import {
  getDateProgress, saveDateProgress,
  updateStatsOnWin, updateStatsOnGiveUp, loadStats,
  CHAINWORD_STATS_KEY, CHAINWORD_STATS_HARD_KEY,
} from '../../../utils/storage.js';
import { pushCloudStats } from '../../../utils/cloudStats.js';
import { getDailyInfo } from '../data/dailyPairs.js';
import { getWordSet } from '../../../words.js';

export function useGame(user, wordListReady, hardMode = false, overrideDateStr = null, statsVersion = 0) {
  const { pair, pairpath, dateStr, gameNumber } = getDailyInfo(hardMode, overrideDateStr);
  // Mode-specific keys so easy and hard progress/stats are stored separately
  const progressKey = hardMode ? `${dateStr}_hard` : dateStr;
  const statsKey = hardMode ? CHAINWORD_STATS_HARD_KEY : CHAINWORD_STATS_KEY;

  const [chain, setChain] = useState([pair.start]);
  const [optimalPath, setOptimalPath] = useState(null);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'gaveUp'
  const [error, setError] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [stats, setStats] = useState(() => loadStats(statsKey));

  const cloudKey = hardMode ? 'chainword_hard' : 'chainword';
  const parSteps = optimalPath ? optimalPath.length - 1 : null;
  const userSteps = chain.length - 1;
  const currentWord = chain[chain.length - 1];

  // Compute BFS optimal path once word list is ready
  useEffect(() => {
    if (!wordListReady) return;
    const ws = getWordSet();
    if (!ws) return;
    //const path = bfs(pair.start, pair.end, ws);
    setOptimalPath(pairpath);
  }, [wordListReady, pair.start, pair.end]);

  // Restore saved progress and reload stats when mode/date changes
  useEffect(() => {
    setChain([pair.start]);
    setStatus('playing');
    setHintsUsed(0);
    const saved = getDateProgress(progressKey);
    if (saved) {
      setChain(saved.chain || [pair.start]);
      setStatus(saved.status || 'playing');
      setHintsUsed(saved.hintsUsed || (saved.hintUsed ? 1 : 0));
    }
    setStats(loadStats(statsKey));
  }, [progressKey, pair.start, statsKey]);

  // Reload stats when cloud sync completes
  useEffect(() => {
    setStats(loadStats(statsKey));
  }, [statsKey, statsVersion]);

  // Sync progress with cloud when user is signed in
  useEffect(() => {
    if (!firebaseConfigured || !user) return;
    const ref = doc(db, 'users', user.uid, 'games', dateStr);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setChain(data.chain || [pair.start]);
        setStatus(data.status || 'playing');
        setHintsUsed(data.hintsUsed || (data.hintUsed ? 1 : 0));
      }
    });
  }, [user, dateStr, pair.start]);

  const persist = useCallback(
    async (newChain, newStatus, newHintUsed) => {
      const data = {
        chain: newChain,
        status: newStatus,
        hintsUsed: newHintUsed,
        start: pair.start,
        end: pair.end,
        gameNumber,
      };
      saveDateProgress(progressKey, data);
      if (firebaseConfigured && user) {
        const ref = doc(db, 'users', user.uid, 'games', progressKey);
        await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      }
    },
    [progressKey, pair, gameNumber, user]
  );

  function submitWord(word, hintsOverride) {
    const w = word.toLowerCase().trim();
    setError('');

    if (w.length !== 4) {
      setError('Word must be exactly 4 letters.');
      return false;
    }

    const ws = getWordSet();
    if (ws && !ws.has(w)) {
      setError('Not a valid word.');
      return false;
    }

    if (!diffsByOneLetter(currentWord, w)) {
      setError('Must change exactly one letter.');
      return false;
    }

    if (chain.includes(w)) {
      setError('Word already used in this chain.');
      return false;
    }

    const newChain = [...chain, w];

    // Auto-complete: if this word is exactly 1 letter from the end, add end and win
    const autoWin = w !== pair.end && diffsByOneLetter(w, pair.end);
    const finalChain = autoWin ? [...newChain, pair.end] : newChain;
    setChain(finalChain);

    // Use hintsOverride when provided (avoids stale closure when called immediately after useHint)
    const effectiveHints = hintsOverride !== undefined ? hintsOverride : hintsUsed;

    if (w === pair.end || autoWin) {
      // Won!
      const newStatus = 'won';
      setStatus(newStatus);
      // autoWin auto-appends `end` — don't count it as an extra guess
      const guesses = autoWin ? newChain.length - 1 : finalChain.length - 1;
      const newStats = updateStatsOnWin(guesses, effectiveHints, dateStr, statsKey);
      setStats(newStats);
      persist(finalChain, newStatus, effectiveHints);
      if (user) pushCloudStats(user.uid, cloudKey, newStats.history).catch(console.error);
    } else {
      persist(newChain, 'playing', effectiveHints);
    }

    return true;
  }

  function undoLastMove() {
    if (chain.length <= 1) return;
    const newChain = chain.slice(0, -1);
    setChain(newChain);
    setError('');
    persist(newChain, 'playing', hintsUsed);
  }

  function giveUp() {
    const newStatus = 'gaveUp';
    setStatus(newStatus);
    const newStats = updateStatsOnGiveUp(chain.length - 1, hintsUsed, dateStr, statsKey);
    setStats(newStats);
    persist(chain, newStatus, hintsUsed);
    if (user) pushCloudStats(user.uid, cloudKey, newStats.history).catch(console.error);
  }

  function useHint() {
    if (!optimalPath) return { hint: null, newCount: hintsUsed };
    const newCount = hintsUsed + 1;
    setHintsUsed(newCount);
    persist(chain, status, newCount);
    // If current word is on the optimal path, suggest the next step along it
    const currentIdx = optimalPath.indexOf(currentWord);
    if (currentIdx >= 0 && currentIdx < optimalPath.length - 1) {
      return { hint: optimalPath[currentIdx + 1], newCount };
    }
    // Off the optimal path — BFS from current position to find the next step
    const ws = getWordSet();
    if (ws) {
      const path = bfs(currentWord, pair.end, ws);
      if (path && path.length > 1) return { hint: path[1], newCount };
    }
    return { hint: null, newCount };
  }

  return {
    pair,
    dateStr,
    gameNumber,
    chain,
    optimalPath,
    parSteps,
    userSteps,
    currentWord,
    status,
    error,
    hintsUsed,
    stats,
    submitWord,
    undoLastMove,
    giveUp,
    useHint,
    setError,
  };
}
