import { useState, useEffect, useCallback } from 'react';
import { getDailySquare } from '../data/dailySquares.js';
import { getWordSet } from '../../../words.js';
import { updateSquaresStats, getGameHistory, SQUARES_STATS_KEY, SQUARES_PROGRESS_PREFIX } from '../../../utils/storage.js';
import { pushCloudStats } from '../../../utils/cloudStats.js';
import { GAME_ID_SQUARES } from '../../../gamesMeta.js';

const EMPTY_SLOTS = ['', '', '', ''];

function loadState(dateStr) {
  try {
    const saved = localStorage.getItem(SQUARES_PROGRESS_PREFIX + dateStr);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function resolveState(dateStr) {
  const statsEntry = getGameHistory(SQUARES_STATS_KEY).find(h => h.dateStr === dateStr);
  const saved = loadState(dateStr);
  return {
    slots:        statsEntry?.slots || saved?.slots || [...EMPTY_SLOTS],
    status:       statsEntry ? 'won' : (saved?.status || 'playing'),
    hintedCorners: saved?.hintedCorners || [false, false, false, false],
    hintsUsed:    saved?.hintsUsed ?? statsEntry?.hintsUsed ?? 0,
  };
}

function saveState(dateStr, data) {
  localStorage.setItem(SQUARES_PROGRESS_PREFIX + dateStr, JSON.stringify(data));
}

export function useSquares(overrideDateStr = null, user = null, statsVersion = 0) {
  const { square, dateStr, gameNumber } = getDailySquare(overrideDateStr);
  const [top, left, right, bottom] = square;

  // Correct corner letters derived from puzzle: TL, TR, BL, BR
  const answer = [top[0], top[3], bottom[0], bottom[3]];

  const [slots, setSlots] = useState(() => resolveState(dateStr).slots);
  const [cursorPos, setCursorPos] = useState(0);
  const [status, setStatus] = useState(() => resolveState(dateStr).status);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [hintedCorners, setHintedCorners] = useState(() => resolveState(dateStr).hintedCorners);
  const [hintsUsed, setHintsUsed] = useState(() => resolveState(dateStr).hintsUsed);
  const [stats, setStats] = useState(() => ({ history: getGameHistory(SQUARES_STATS_KEY) }));

  useEffect(() => { setStats({ history: getGameHistory(SQUARES_STATS_KEY) }); }, [statsVersion]);

  // Reset state when date changes (archive navigation)
  useEffect(() => {
    const { slots, status, hintedCorners, hintsUsed } = resolveState(dateStr);
    setSlots(slots);
    setCursorPos(0);
    setStatus(status);
    setFeedback(null);
    setError('');
    setHintedCorners(hintedCorners);
    setHintsUsed(hintsUsed);
  }, [dateStr]);

  const persist = useCallback((newStatus, newSlots, newHintedCorners, newHintsUsed) => {
    saveState(dateStr, {
      status: newStatus,
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
    persist(status, newSlots, newHintedCorners, newHintsUsed);
  }

  function doSubmit(slotsToUse) {
    const ws = getWordSet();
    if (!ws) { setError('Dictionary loading, please wait…'); return; }

    const [tl, tr, bl, br] = slotsToUse;
    const topWord    = tl + top[1]    + top[2]    + tr;
    const leftWord   = tl + left[1]   + left[2]   + bl;
    const rightWord  = tr + right[1]  + right[2]  + br;
    const bottomWord = bl + bottom[1] + bottom[2] + br;

    const topValid    = ws.has(topWord);
    const leftValid   = ws.has(leftWord);
    const rightValid  = ws.has(rightWord);
    const bottomValid = ws.has(bottomWord);
    const isWon = topValid && leftValid && rightValid && bottomValid;

    if (isWon) {
      setStatus('won');
      setSlots([tl, tr, bl, br]);
      setFeedback(null);
      persist('won', [tl, tr, bl, br], hintedCorners, hintsUsed);
      const newStats = updateSquaresStats(dateStr, hintsUsed, [tl, tr, bl, br]);
      setStats(newStats);
      if (user) pushCloudStats(user.uid, GAME_ID_SQUARES, newStats.history).catch(console.error);
    } else {
      setFeedback({ letters: [tl, tr, bl, br], topValid, leftValid, rightValid, bottomValid, topWord, leftWord, rightWord, bottomWord });
      setSlots([...EMPTY_SLOTS]);
      setCursorPos(0);
      persist(status, [...EMPTY_SLOTS], hintedCorners, hintsUsed);
    }
    setError('');
  }

  function addLetter(letter) {
    if (status !== 'playing') return;

    if (feedback) {
      const newSlots = [...EMPTY_SLOTS];
      newSlots[0] = letter.toLowerCase();
      setFeedback(null);
      setSlots(newSlots);
      setCursorPos(1);
      setError('');
      persist(status, newSlots, hintedCorners, hintsUsed);
      return;
    }

    if (cursorPos >= 4) return;
    const newSlots = [...slots];
    newSlots[cursorPos] = letter.toLowerCase();
    setSlots(newSlots);
    setCursorPos(Math.min(cursorPos + 1, 4));
    setError('');
    if (newSlots.every(s => s)) {
      const ws = getWordSet();
      const [tl, tr, bl, br] = newSlots;
      if (ws &&
          ws.has(tl + top[1] + top[2] + tr) &&
          ws.has(tl + left[1] + left[2] + bl) &&
          ws.has(tr + right[1] + right[2] + br) &&
          ws.has(bl + bottom[1] + bottom[2] + br)) {
        doSubmit(newSlots);
        return;
      }
    }
    persist(status, newSlots, hintedCorners, hintsUsed);
  }

  function deleteLetter() {
    if (status !== 'playing') return;

    if (feedback) {
      setFeedback(null);
      setSlots([...EMPTY_SLOTS]);
      setCursorPos(0);
      setError('');
      persist(status, [...EMPTY_SLOTS], hintedCorners, hintsUsed);
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
      persist(status, newSlots, hintedCorners, hintsUsed);
      return;
    }

    // Current slot empty — move back and clear previous
    if (cursorPos === 0) return;
    const newSlots = [...slots];
    newSlots[cursorPos - 1] = '';
    setSlots(newSlots);
    setCursorPos(cursorPos - 1);
    setError('');
    persist(status, newSlots, hintedCorners, hintsUsed);
  }

  return {
    square,
    dateStr,
    gameNumber,
    slots,
    cursorPos,
    feedback,
    status,
    error,
    hintsUsed,
    hintedCorners,
    stats,
    addLetter,
    deleteLetter,
    setCursorAt,
    useHint,
    setError,
  };
}
