import { useState, useEffect, useCallback } from 'react';
import { getDailySquare } from '../data/dailySquares.js';
import { getWordSet } from '../../../words.js';
import { updateSquaresStats, getGameHistory, SQUARES_STATS_KEY, SQUARES_PROGRESS_PREFIX } from '../../../utils/storage.js';
import { pushCloudStats } from '../../../utils/cloudStats.js';
import { GAME_ID_SQUARES } from '../../../gamesMeta.js';

function loadState(dateStr) {
  try {
    const saved = localStorage.getItem(SQUARES_PROGRESS_PREFIX + dateStr);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveState(dateStr, data) {
  localStorage.setItem(SQUARES_PROGRESS_PREFIX + dateStr, JSON.stringify(data));
}

const EMPTY_SLOTS = ['', '', '', ''];

export function useSquares(overrideDateStr = null, user = null, statsVersion = 0) {
  const { square, dateStr, gameNumber } = getDailySquare(overrideDateStr);
  const [top, left, right, bottom] = square;

  // Correct corner letters derived from puzzle: TL, TR, BL, BR
  const answer = [top[0], top[3], bottom[0], bottom[3]];

  // slots[0..3] = TL, TR, BL, BR (each '' or a letter)
  const [slots, setSlots] = useState(() => loadState(dateStr)?.slots || [...EMPTY_SLOTS]);
  const [cursorPos, setCursorPos] = useState(0);
  const [winLetters, setWinLetters] = useState(() => loadState(dateStr)?.winLetters || null);
  const [status, setStatus] = useState(() => loadState(dateStr)?.status || 'playing');
  const [attempts, setAttempts] = useState(() => loadState(dateStr)?.attempts || 0);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  // hintedCorners[i] = true if corner i was revealed by a hint
  const [hintedCorners, setHintedCorners] = useState(() => loadState(dateStr)?.hintedCorners || [false, false, false, false]);
  const [hintsUsed, setHintsUsed] = useState(() => loadState(dateStr)?.hintsUsed || 0);
  const [stats, setStats] = useState(() => { history: getGameHistory(SQUARES_STATS_KEY) });

  useEffect(() => { setStats({ history: getGameHistory(SQUARES_STATS_KEY) }); }, [statsVersion]);

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
    setHintedCorners(saved?.hintedCorners || [false, false, false, false]);
    setHintsUsed(saved?.hintsUsed || 0);
  }, [dateStr]);

  const persist = useCallback((newStatus, newWinLetters, newAttempts, newSlots, newHintedCorners, newHintsUsed) => {
    saveState(dateStr, {
      status: newStatus,
      winLetters: newWinLetters || null,
      attempts: newAttempts,
      slots: newSlots,
      hintedCorners: newHintedCorners,
      hintsUsed: newHintsUsed,
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

  // Reveal the correct letter for the current corner
  function useHint() {
    if (status !== 'playing') return;
    const pos = Math.min(cursorPos, 3);
    if (feedback) {
      setFeedback(null);
      setSlots([...EMPTY_SLOTS]);
    }
    const newSlots = feedback ? [...EMPTY_SLOTS] : [...slots];
    newSlots[pos] = answer[pos];
    setSlots(newSlots);

    const newHintedCorners = [...hintedCorners];
    let newHintsUsed = hintsUsed;
    if (!newHintedCorners[pos]) {
      newHintedCorners[pos] = true;
      newHintsUsed = hintsUsed + 1;
      setHintedCorners(newHintedCorners);
      setHintsUsed(newHintsUsed);
    }

    const nextPos = Math.min(pos + 1, 3);
    setCursorPos(nextPos);
    setError('');
    persist(status, null, attempts, newSlots, newHintedCorners, newHintsUsed);
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

    // If the current slot has content, clear it in place
    const effectivePos = Math.min(cursorPos, 3);
    if (slots[effectivePos]) {
      const newSlots = [...slots];
      newSlots[effectivePos] = '';
      setSlots(newSlots);
      setCursorPos(effectivePos);
      setError('');
      return;
    }

    // Current slot empty — move back and clear previous
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
      persist('won', [tl, tr, bl, br], newAttempts, [...EMPTY_SLOTS], hintedCorners, hintsUsed);
      const newStats = updateSquaresStats(dateStr, hintsUsed);
      setStats(newStats);
      if (user) pushCloudStats(user.uid, GAME_ID_SQUARES, newStats.history).catch(console.error);
    } else {
      setFeedback({
        letters: [tl, tr, bl, br],
        topValid, leftValid, rightValid, bottomValid,
        topWord, leftWord, rightWord, bottomWord,
      });
      setSlots([...EMPTY_SLOTS]);
      setCursorPos(0);
      persist(status, null, newAttempts, [...EMPTY_SLOTS], hintedCorners, hintsUsed);
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
    hintsUsed,
    hintedCorners,
    stats,
    addLetter,
    deleteLetter,
    submitGuess,
    setCursorAt,
    useHint,
    setError,
  };
}
