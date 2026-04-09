import { useState, useEffect, useCallback } from 'react';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseConfigured } from '../firebase.js';
import { bfs, diffsByOneLetter, getStars } from '../utils/wordUtils.js';
import {
  getDateProgress, saveDateProgress,
  updateStatsOnWin, updateStatsOnGiveUp, loadStats,
} from '../utils/storage.js';
import { getDailyInfo } from '../dailyPairs.js';
import { getWordSet } from '../words.js';

export function useGame(user, wordListReady) {
  const { pair, dateStr, gameNumber } = getDailyInfo();

  const [chain, setChain] = useState([pair.start]);
  const [optimalPath, setOptimalPath] = useState(null);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'gaveUp'
  const [error, setError] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [stats, setStats] = useState(loadStats());

  const parSteps = optimalPath ? optimalPath.length - 1 : null;
  const userSteps = chain.length - 1;
  const currentWord = chain[chain.length - 1];

  // Compute BFS optimal path once word list is ready
  useEffect(() => {
    if (!wordListReady) return;
    const ws = getWordSet();
    if (!ws) return;
    const path = bfs(pair.start, pair.end, ws);
    setOptimalPath(path);
  }, [wordListReady, pair.start, pair.end]);

  // Restore saved progress
  useEffect(() => {
    const saved = getDateProgress(dateStr);
    if (!saved) return;
    setChain(saved.chain || [pair.start]);
    setStatus(saved.status || 'playing');
    setHintsUsed(saved.hintsUsed || saved.hintUsed ? 1 : 0);
  }, [dateStr, pair.start]);

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
      saveDateProgress(dateStr, data);
      if (firebaseConfigured && user) {
        const ref = doc(db, 'users', user.uid, 'games', dateStr);
        await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
      }
    },
    [dateStr, pair, gameNumber, user]
  );

  function submitWord(word) {
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

    if (w === pair.end || autoWin) {
      // Won!
      const newStatus = 'won';
      setStatus(newStatus);
      const stars = getStars(finalChain.length - 1 + hintsUsed, parSteps || finalChain.length - 1);
      const newStats = updateStatsOnWin(stars, dateStr);
      setStats(newStats);
      persist(finalChain, newStatus, hintsUsed);
    } else {
      persist(newChain, 'playing', hintsUsed);
    }

    return true;
  }

  function giveUp() {
    const newStatus = 'gaveUp';
    setStatus(newStatus);
    const newStats = updateStatsOnGiveUp(dateStr);
    setStats(newStats);
    persist(chain, newStatus, hintsUsed);
  }

  function useHint() {
    if (!optimalPath) return null;
    const newCount = hintsUsed + 1;
    setHintsUsed(newCount);
    persist(chain, status, newCount);
    // Find where we are in the optimal path and suggest the next step
    const currentIdx = optimalPath.indexOf(currentWord);
    if (currentIdx >= 0 && currentIdx < optimalPath.length - 1) {
      return optimalPath[currentIdx + 1];
    }
    // If current word isn't on optimal path, return the next word from start
    return optimalPath[1] || null;
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
    giveUp,
    useHint,
    setError,
  };
}
