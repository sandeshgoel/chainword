import { useState, useEffect, useCallback } from 'react';
import { getDailyWord } from '../data/shabdalWords.js';
import { formHindiWord } from '../../../utils/hindiUtils.js';
import { loadShabdalStats, updateShabdalStats } from '../../../utils/storage.js';
import { pushCloudStats } from '../../../utils/cloudStats.js';

function getColorsFeedback(guess, target) {
  const colors = Array(4).fill('gray');
  const targetCopy = [...target];
  const guessCopy = [...guess];

  // First pass: greens
  for (let i = 0; i < 4; i++) {
    if (guessCopy[i] === targetCopy[i]) {
      colors[i] = 'green';
      targetCopy[i] = null;
      guessCopy[i] = null;
    }
  }

  // Second pass: oranges
  for (let i = 0; i < 4; i++) {
    if (guessCopy[i] === null) continue;
    const j = targetCopy.indexOf(guessCopy[i]);
    if (j !== -1) {
      colors[i] = 'orange';
      targetCopy[j] = null;
    }
  }

  return colors;
}

export function useShabdal(overrideDateStr = null, user = null, statsVersion = 0) {
  const { target, dateStr, gameNumber } = getDailyWord(overrideDateStr);
  const [guesses, setGuesses] = useState([]); // [{ letters: [...], colors: [...], formed: '...' }]
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [error, setError] = useState('');
  const [stats, setStats] = useState(loadShabdalStats());

  useEffect(() => { setStats(loadShabdalStats()); }, [statsVersion]);

  // Load from local storage
  useEffect(() => {
    const key = `chainword_shabdal_${dateStr}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGuesses(data.guesses || []);
        setStatus(data.status || 'playing');
      } catch (e) {
        // ignore
      }
    } else {
      setGuesses([]);
      setStatus('playing');
    }
  }, [dateStr, target]);

  const persist = useCallback((newGuesses, newStatus) => {
    const key = `chainword_shabdal_${dateStr}`;
    localStorage.setItem(key, JSON.stringify({
      guesses: newGuesses,
      status: newStatus,
    }));
  }, [dateStr]);

  const submitGuess = useCallback((letters) => {
    if (letters.length !== 4) {
      setError('Enter 4 letters');
      return false;
    }
    if (status !== 'playing') return false;

    const colors = getColorsFeedback(letters, target);
    const won = colors.every(c => c === 'green');
    
    const newGuesses = [...guesses, { letters, colors, formed: formHindiWord(letters) }];
    let newStatus = 'playing';

    if (won) {
      newStatus = 'won';
    } else if (newGuesses.length >= 6) {
      newStatus = 'lost';
    }

    setGuesses(newGuesses);
    setStatus(newStatus);
    persist(newGuesses, newStatus);

    if (newStatus === 'won' || newStatus === 'lost') {
      const newStats = updateShabdalStats(newStatus === 'won' ? newGuesses.length : 0, dateStr);
      setStats(newStats);
      if (user) pushCloudStats(user.uid, 'shabdal', newStats.history).catch(console.error);
    }

    setError('');
    return true;
  }, [status, target, guesses, dateStr, persist, user]);

  return {
    target,
    dateStr,
    gameNumber,
    guesses,
    status,
    error,
    stats,
    setError,
    submitGuess,
    formedTarget: formHindiWord(target),
  };
}
