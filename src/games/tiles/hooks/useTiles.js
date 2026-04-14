import { useState, useEffect, useCallback } from 'react';
import { getDailyTiles } from '../data/dailyTiles.js';
import { getWordSet } from '../../../words.js';
import { loadTilesStats, updateTilesStats } from '../../../utils/storage.js';

// Slot multipliers: positions 0-3 → ×1, ×2 (DL), ×1, ×3 (TL)
export const SLOT_MULTIPLIERS = [1, 2, 1, 3];

export function calcScore(slots) {
  return slots.reduce((sum, tile, i) => {
    if (!tile) return sum;
    return sum + tile.points * SLOT_MULTIPLIERS[i];
  }, 0);
}

// Enumerate all 4-permutations of the 7 tiles and find the highest-scoring valid word.
function findOptimalPlay(tiles) {
  const ws = getWordSet();
  if (!ws) return { optimalScore: 0, optimalWord: null };

  let optimalScore = 0;
  let optimalWord = null;

  for (let a = 0; a < 7; a++) {
    for (let b = 0; b < 7; b++) {
      if (b === a) continue;
      for (let c = 0; c < 7; c++) {
        if (c === a || c === b) continue;
        for (let d = 0; d < 7; d++) {
          if (d === a || d === b || d === c) continue;
            const word = (
              tiles[a].letter + tiles[b].letter +
              tiles[c].letter + tiles[d].letter
            ).toLowerCase();
            if (ws.has(word)) {
              const score =
                tiles[a].points * SLOT_MULTIPLIERS[0] +
                tiles[b].points * SLOT_MULTIPLIERS[1] +
                tiles[c].points * SLOT_MULTIPLIERS[2] +
                tiles[d].points * SLOT_MULTIPLIERS[3];
              if (score > optimalScore) {
                optimalScore = score;
                optimalWord = word.toUpperCase();
              }
            }
        }
      }
    }
  }

  return { optimalScore, optimalWord };
}

export function useTiles(overrideDateStr = null) {
  const { tiles: dailyTiles, dateStr, gameNumber } = getDailyTiles(overrideDateStr);

  const [tiles, setTiles] = useState(() => dailyTiles.map(t => ({ ...t, used: false })));
  const [slots, setSlots] = useState([null, null, null, null]);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [stats, setStats] = useState(loadTilesStats());

  const { optimalScore, optimalWord } = findOptimalPlay(dailyTiles);

  // Reset all state when date changes (archive navigation or day rollover)
  useEffect(() => {
    const { tiles: newDailyTiles } = getDailyTiles(dateStr);
    setTiles(newDailyTiles.map(t => ({ ...t, used: false })));
    setSlots([null, null, null, null]);
    setError('');

    const key = `chainword_tiles_${dateStr}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSubmissions(data.submissions || []);
        setBestScore(data.bestScore || 0);
        return;
      } catch {}
    }
    setSubmissions([]);
    setBestScore(0);
  }, [dateStr]);

  const persist = useCallback((newSubmissions, newBest) => {
    const key = `chainword_tiles_${dateStr}`;
    localStorage.setItem(key, JSON.stringify({ submissions: newSubmissions, bestScore: newBest }));
  }, [dateStr]);

  function placeTile(tileId) {
    const emptySlot = slots.findIndex(s => s === null);
    if (emptySlot === -1) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.used) return;

    setSlots(prev => {
      const next = [...prev];
      next[emptySlot] = tile;
      return next;
    });
    setTiles(prev => prev.map(t => t.id === tileId ? { ...t, used: true } : t));
    setError('');
  }

  function removeFromSlot(slotIndex) {
    const tile = slots[slotIndex];
    if (!tile) return;

    const remaining = slots.filter((_, i) => i !== slotIndex);
    while (remaining.length < 4) remaining.push(null);

    setSlots(remaining);
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: false } : t));
    setError('');
  }

  function shuffleTiles() {
    setTiles(prev => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }

  function clearSlots() {
    setSlots([null, null, null, null]);
    setTiles(dailyTiles.map(t => ({ ...t, used: false })));
    setError('');
  }

  function submitWord() {
    const filled = slots.filter(Boolean);
    if (filled.length !== 4) {
      setError('Fill all 4 slots to form a word.');
      return false;
    }

    const word = filled.map(t => t.letter.toLowerCase()).join('');
    const ws = getWordSet();
    if (!ws || !ws.has(word)) {
      setError(`"${word.toUpperCase()}" is not a valid word.`);
      return false;
    }

    const score = calcScore(slots);
    const newSub = { word: word.toUpperCase(), score, slots: slots.map(t => ({ ...t })) };
    const newSubmissions = [...submissions, newSub];
    const newBest = Math.max(bestScore, score);

    setSubmissions(newSubmissions);
    setBestScore(newBest);
    setError('');
    persist(newSubmissions, newBest);

    if (score >= newBest) {
      setStats(updateTilesStats(dateStr, newBest, optimalScore));
    }

    return true;
  }

  return {
    tiles,
    slots,
    dateStr,
    gameNumber,
    error,
    submissions,
    bestScore,
    optimalScore,
    optimalWord,
    stats,
    placeTile,
    removeFromSlot,
    clearSlots,
    shuffleTiles,
    submitWord,
    setError,
  };
}
