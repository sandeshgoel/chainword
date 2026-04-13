import { useState, useEffect, useCallback } from 'react';
import { getDailyTiles } from '../data/dailyTiles.js';
import { getWordSet } from '../../../words.js';

// Slot multipliers: positions 0-3 → ×1, ×2 (DL), ×1, ×3 (TL)
export const SLOT_MULTIPLIERS = [1, 2, 1, 3];

export function calcScore(slots) {
  return slots.reduce((sum, tile, i) => {
    if (!tile) return sum;
    return sum + tile.points * SLOT_MULTIPLIERS[i];
  }, 0);
}

export function useTiles() {
  const { tiles: dailyTiles, dateStr, gameNumber } = getDailyTiles();

  const [tiles, setTiles] = useState(() => dailyTiles.map(t => ({ ...t, used: false })));
  const [slots, setSlots] = useState([null, null, null, null]);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [bestScore, setBestScore] = useState(0);

  // Restore saved submissions from localStorage
  useEffect(() => {
    const key = `chainword_tiles_${dateStr}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSubmissions(data.submissions || []);
        setBestScore(data.bestScore || 0);
      } catch (e) { /* ignore */ }
    }
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

    // Remove and compact remaining tiles left
    const remaining = slots.filter((_, i) => i !== slotIndex);
    while (remaining.length < 4) remaining.push(null);

    setSlots(remaining);
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: false } : t));
    setError('');
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
    placeTile,
    removeFromSlot,
    clearSlots,
    submitWord,
    setError,
  };
}
