import { useState, useCallback } from 'react';
import { getDailySquare } from '../data/dailySquares.js';
import { getWordSet } from '../../../words.js';

function loadState(dateStr) {
  try {
    const saved = localStorage.getItem(`chainword_squares_${dateStr}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveState(dateStr, data) {
  localStorage.setItem(`chainword_squares_${dateStr}`, JSON.stringify(data));
}

export function useSquares() {
  const { square, dateStr, gameNumber } = getDailySquare();
  const [top, left, right, bottom] = square;

  const [input, setInput] = useState('');
  const [winLetters, setWinLetters] = useState(() => loadState(dateStr)?.winLetters || null);
  const [status, setStatus] = useState(() => loadState(dateStr)?.status || 'playing');
  const [attempts, setAttempts] = useState(() => loadState(dateStr)?.attempts || 0);
  // feedback: which of the 4 words are valid after a wrong guess
  // { letters: string[4], topValid, leftValid, rightValid, bottomValid } | null
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  const persist = useCallback((newStatus, newWinLetters, newAttempts) => {
    saveState(dateStr, { status: newStatus, winLetters: newWinLetters || null, attempts: newAttempts });
  }, [dateStr]);

  function addLetter(letter) {
    if (status !== 'playing') return;
    if (feedback) {
      setFeedback(null);
      setInput(letter.toLowerCase());
    } else {
      if (input.length >= 4) return;
      setInput(prev => prev + letter.toLowerCase());
    }
    setError('');
  }

  function deleteLetter() {
    if (status !== 'playing') return;
    if (feedback) {
      setFeedback(null);
      setInput('');
    } else {
      setInput(prev => prev.slice(0, -1));
    }
    setError('');
  }

  function submitGuess() {
    if (status !== 'playing') return;
    if (input.length !== 4) {
      setError('Enter all 4 corner letters');
      return;
    }

    const ws = getWordSet();
    if (!ws) {
      setError('Dictionary loading, please wait…');
      return;
    }

    const [tl, tr, bl, br] = input.split('');

    // Form the 4 words using the typed corners + the known middle letters
    const topWord    = tl + top[1]    + top[2]    + tr;
    const leftWord   = tl + left[1]   + left[2]   + bl;
    const rightWord  = tr + right[1]  + right[2]  + br;
    const bottomWord = bl + bottom[1] + bottom[2] + br;

    const topValid    = ws.has(topWord);
    const leftValid   = ws.has(leftWord);
    const rightValid  = ws.has(rightWord);
    const bottomValid = ws.has(bottomWord);
    const isWon = topValid && leftValid && rightValid && bottomValid;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isWon) {
      setStatus('won');
      setWinLetters([tl, tr, bl, br]);
      setInput('');
      setFeedback(null);
      persist('won', [tl, tr, bl, br], newAttempts);
    } else {
      setFeedback({
        letters: [tl, tr, bl, br],
        topValid, leftValid, rightValid, bottomValid,
        topWord, leftWord, rightWord, bottomWord,
      });
      setInput('');
      persist(status, null, newAttempts);
    }
    setError('');
  }

  return {
    square,
    dateStr,
    gameNumber,
    input,
    winLetters,
    attempts,
    feedback,
    status,
    error,
    addLetter,
    deleteLetter,
    submitGuess,
    setError,
  };
}
