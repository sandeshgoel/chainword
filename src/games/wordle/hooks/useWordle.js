import { useState, useEffect, useCallback } from 'react';
import { getDailyWordleTarget, getWordSet } from '../../../words.js';
import { loadWordleStats, updateWordleStats } from '../../../utils/storage.js';

function evaluateGuess(guess, target) {
  const result = Array(4).fill('gray');
  const targetChars = target.split('');
  const guessChars = guess.split('');

  // Pass 1: exact matches (green)
  for (let i = 0; i < 4; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'green';
      targetChars[i] = null; // mark as used
      guessChars[i] = null;
    }
  }

  // Pass 2: present but wrong place (orange)
  for (let i = 0; i < 4; i++) {
    if (guessChars[i] !== null) {
      const idx = targetChars.indexOf(guessChars[i]);
      if (idx !== -1) {
        result[i] = 'orange';
        targetChars[idx] = null; // mark as used
      }
    }
  }

  return result;
}

export function useWordle(wordListReady, overrideDateStr = null) {
  const { target, dateStr, gameNumber } = getDailyWordleTarget(overrideDateStr);

  const [guesses, setGuesses] = useState([]); // array of { word, colors }
  const [status, setStatus] = useState('playing'); // playing | won | lost
  const [error, setError] = useState('');
  const [stats, setStats] = useState(loadWordleStats());

  // Load from local storage
  useEffect(() => {
    const key = `chainword_wordle_${dateStr}`;
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
    const key = `chainword_wordle_${dateStr}`;
    localStorage.setItem(key, JSON.stringify({
      guesses: newGuesses,
      status: newStatus,
    }));
  }, [dateStr]);

  function submitGuess(word) {
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

    const colors = evaluateGuess(w, target);
    const newGuesses = [...guesses, { word: w, colors }];
    let newStatus = 'playing';

    if (w === target) {
      newStatus = 'won';
    } else if (newGuesses.length >= 6) {
      newStatus = 'lost';
    }

    setGuesses(newGuesses);
    setStatus(newStatus);
    persist(newGuesses, newStatus);

    if (newStatus === 'won') {
      setStats(updateWordleStats(newGuesses.length, dateStr));
    } else if (newStatus === 'lost') {
      setStats(updateWordleStats(0, dateStr));
    }

    return true;
  }

  return {
    target,
    dateStr,
    gameNumber,
    guesses,
    status,
    error,
    stats,
    setError,
    submitGuess
  };
}
