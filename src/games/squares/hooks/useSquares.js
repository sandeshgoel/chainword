import { useState, useEffect, useCallback } from 'react';
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

const EMPTY_SLOTS = ['', '', '', ''];

export function useSquares(overrideDateStr = null) {
  const { square, dateStr, gameNumber } = getDailySquare(overrideDateStr);
  const [top, left, right, bottom] = square;

  // slots[0..3] = TL, TR, BL, BR (each '' or a letter)
  const [slots, setSlots] = useState(() => loadState(dateStr)?.slots || [...EMPTY_SLOTS]);
  const [cursorPos, setCursorPos] = useState(0);
  const [winLetters, setWinLetters] = useState(() => loadState(dateStr)?.winLetters || null);
  const [status, setStatus] = useState(() => loadState(dateStr)?.status || 'playing');
  const [attempts, setAttempts] = useState(() => loadState(dateStr)?.attempts || 0);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  // Reset state when date changes (archive navigation)
  useEffect(() => {
    const saved = loadState(dateStr);
    setSlots(saved?.slots || [...EMPTY_SLOTS]);
    setCursorPos(0);
    setWinLetters(saved?.winLetters || null);
    setStatus(saved?.status || 'playing');
    setAttempts(saved?.attempts || 0);
    setFeedback(null);
    setError('');
  }, [dateStr]);

  const persist = useCallback((newStatus, newWinLetters, newAttempts, newSlots) => {
    saveState(dateStr, {
      status: newStatus,
      winLetters: newWinLetters || null,
      attempts: newAttempts,
      slots: newSlots,
    });
  }, [dateStr]);

  // Jump cursor to a specific corner (e.g. on tap)
  function setCursorAt(pos) {
    if (status !== 'playing') return;
    if (feedback) {
      setFeedback(null);
      setSlots([...EMPTY_SLOTS]);
    }
    setCursorPos(pos);
    setError('');
  }

  function addLetter(letter) {
    if (status !== 'playing') return;

    if (feedback) {
      // clear board, start fresh at pos 0
      const newSlots = [...EMPTY_SLOTS];
      newSlots[0] = letter.toLowerCase();
      setFeedback(null);
      setSlots(newSlots);
      setCursorPos(1);
      setError('');
      return;
    }

    if (cursorPos >= 4) return;
    const newSlots = [...slots];
    newSlots[cursorPos] = letter.toLowerCase();
    setSlots(newSlots);
    setCursorPos(Math.min(cursorPos + 1, 4));
    setError('');
  }

  function deleteLetter() {
    if (status !== 'playing') return;

    if (feedback) {
      setFeedback(null);
      setSlots([...EMPTY_SLOTS]);
      setCursorPos(0);
      setError('');
      return;
    }

    if (cursorPos === 0) return;
    const newSlots = [...slots];
    newSlots[cursorPos - 1] = '';
    setSlots(newSlots);
    setCursorPos(cursorPos - 1);
    setError('');
  }

  function submitGuess() {
    if (status !== 'playing') return;

    if (slots.some(s => !s)) {
      setError('Enter all 4 corner letters');
      return;
    }

    const ws = getWordSet();
    if (!ws) {
      setError('Dictionary loading, please wait…');
      return;
    }

    const [tl, tr, bl, br] = slots;

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
      setSlots([...EMPTY_SLOTS]);
      setFeedback(null);
      persist('won', [tl, tr, bl, br], newAttempts, [...EMPTY_SLOTS]);
    } else {
      setFeedback({
        letters: [tl, tr, bl, br],
        topValid, leftValid, rightValid, bottomValid,
        topWord, leftWord, rightWord, bottomWord,
      });
      setSlots([...EMPTY_SLOTS]);
      setCursorPos(0);
      persist(status, null, newAttempts, [...EMPTY_SLOTS]);
    }
    setError('');
  }

  return {
    square,
    dateStr,
    gameNumber,
    slots,
    cursorPos,
    winLetters,
    attempts,
    feedback,
    status,
    error,
    addLetter,
    deleteLetter,
    submitGuess,
    setCursorAt,
    setError,
  };
}
