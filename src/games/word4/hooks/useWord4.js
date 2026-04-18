import { useState, useEffect, useCallback } from 'react';
import { getDailyWord4Target, getWordSet } from '../../../words.js';
import { updateWord4Stats, getGameHistory, WORD4_STATS_KEY, WORD4_PROGRESS_PREFIX } from '../../../utils/storage.js';
import { pushCloudStats } from '../../../utils/cloudStats.js';
import { GAME_ID_WORD4 } from '../../../gamesMeta.js';
import { evaluateGuess } from '../../../utils/wordUtils.js';

export function useWord4(wordListReady, overrideDateStr = null, user = null, statsVersion = 0) {
  const { target, dateStr, gameNumber } = getDailyWord4Target(overrideDateStr);

  const [guesses, setGuesses] = useState([]); // array of { word, colors }
  const [status, setStatus] = useState('playing'); // playing | won | lost
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ history: getGameHistory(WORD4_STATS_KEY) });

  useEffect(() => { setStats({ history: getGameHistory(WORD4_STATS_KEY) }); }, [statsVersion]);

  // Load from local storage
  useEffect(() => {
    const key = WORD4_PROGRESS_PREFIX + dateStr;
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
    const key = WORD4_PROGRESS_PREFIX + dateStr;
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

    if (newStatus === 'won' || newStatus === 'lost') {
      const newStats = updateWord4Stats(newStatus === 'won' ? newGuesses.length : 0, dateStr);
      setStats(newStats);
      if (user) pushCloudStats(user.uid, GAME_ID_WORD4, newStats.history).catch(console.error);
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
