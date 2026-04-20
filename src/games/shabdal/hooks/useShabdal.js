import { useState, useEffect, useCallback } from 'react';
import { getDailyWord } from '../data/shabdalWords.js';
import { VALID_WORDS_HINDI } from '../../../validWordsHindi.js';
import { formSyllable, formWordFromPairs } from '../../../utils/hindiUtils.js';
import { updateShabdalStats, getGameHistory, SHABDAL_STATS_KEY, SHABDAL_PROGRESS_PREFIX } from '../../../utils/storage.js';
import { pushCloudStats } from '../../../utils/cloudStats.js';
import { GAME_ID_SHABDAL } from '../../../gamesMeta.js';
import { evaluateGuess } from '../../../utils/wordUtils.js';

const FREE_INVALID_GUESSES = 2;

let hindiWordSet = null;
function getHindiWordSet() {
  if (!hindiWordSet) hindiWordSet = new Set(VALID_WORDS_HINDI);
  return hindiWordSet;
}

export function useShabdal(overrideDateStr = null, user = null, statsVersion = 0) {
  const { target, dateStr, gameNumber } = getDailyWord(overrideDateStr);
  const targetConsonants = target.map(p => p.c);
  const targetVowels = target.map(p => p.v);

  const [guesses, setGuesses] = useState([]);
  const [status, setStatus] = useState('playing');
  const [error, setError] = useState('');
  const [invalidCount, setInvalidCount] = useState(0);
  const [stats, setStats] = useState({ history: getGameHistory(SHABDAL_STATS_KEY) });

  useEffect(() => { setStats({ history: getGameHistory(SHABDAL_STATS_KEY) }); }, [statsVersion]);

  useEffect(() => {
    const key = SHABDAL_PROGRESS_PREFIX + dateStr;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGuesses(data.guesses || []);
        setStatus(data.status || 'playing');
        setInvalidCount(data.invalidCount || 0);
      } catch (e) {}
    } else {
      setGuesses([]);
      setStatus('playing');
      setInvalidCount(0);
    }
  }, [dateStr, target]);

  const persist = useCallback((newGuesses, newStatus, newInvalidCount) => {
    const key = SHABDAL_PROGRESS_PREFIX + dateStr;
    localStorage.setItem(key, JSON.stringify({ guesses: newGuesses, status: newStatus, invalidCount: newInvalidCount }));
  }, [dateStr]);

  const submitGuess = useCallback((consonants) => {
    if (consonants.length !== 4) {
      setError('4 व्यंजन चाहिए');
      return false;
    }
    if (status !== 'playing') return false;

    const formed = consonants.map((c, i) => formSyllable(c, targetVowels[i])).join('');
    const isValid = getHindiWordSet().has(formed);
    let newInvalidCount = invalidCount;

    if (!isValid) {
      if (invalidCount >= FREE_INVALID_GUESSES) {
        setError(`"${formed}" मान्य शब्द नहीं है`);
        return false;
      }
      newInvalidCount = invalidCount + 1;
      setInvalidCount(newInvalidCount);
    }

    const colors = evaluateGuess(consonants, targetConsonants);
    const won = colors.every(c => c === 'green');
    const newGuesses = [...guesses, { consonants, colors, formed, invalid: !isValid }];
    let newStatus = 'playing';

    if (won) {
      newStatus = 'won';
    } else if (newGuesses.length >= 6) {
      newStatus = 'lost';
    }

    setGuesses(newGuesses);
    setStatus(newStatus);
    persist(newGuesses, newStatus, newInvalidCount);

    if (newStatus === 'won' || newStatus === 'lost') {
      const newStats = updateShabdalStats(newStatus === 'won' ? newGuesses.length : 0, dateStr);
      setStats(newStats);
      if (user) pushCloudStats(user.uid, GAME_ID_SHABDAL, newStats.history).catch(console.error);
    }

    if (!isValid) {
      setError(`"${formed}" मान्य नहीं — ${newInvalidCount}/${FREE_INVALID_GUESSES} छूट`);
    } else {
      setError('');
    }
    return true;
  }, [status, targetConsonants, targetVowels, guesses, invalidCount, dateStr, persist, user]);

  return {
    target,
    targetConsonants,
    targetVowels,
    dateStr,
    gameNumber,
    guesses,
    status,
    error,
    invalidCount,
    freeGuessesLeft: FREE_INVALID_GUESSES - invalidCount,
    stats,
    setError,
    submitGuess,
    formedTarget: formWordFromPairs(target),
  };
}
