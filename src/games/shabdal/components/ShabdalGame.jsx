import { useState, useEffect, useRef } from 'react';
import ShabdalKeyboard from './ShabdalKeyboard.jsx';
import ResultBanner from '../../../components/ResultBanner.jsx';
import Modal from '../../../components/Modal.jsx';
import { formSyllable, MATRAS } from '../../../utils/hindiUtils.js';
import { buildShabdalShareText, shareOrCopy } from '../../../utils/sharing.js';
import { shabdalTier } from '../../../utils/awards.js';

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

// ── Tile ─────────────────────────────────────────────────────────────────────
// consonant: the guessed consonant (null if empty)
// vowel: pre-set vowel for this position (always known)
// When empty: shows the vowel matra as a hint (or 'अ' for the inherent vowel)
function Tile({ consonant, vowel, color, revealPhase }) {
  const useReveal = revealPhase !== undefined;
  const showColor = !useReveal || revealPhase === 'in' || revealPhase === 'done';

  const effectiveColor = (() => {
    if (!showColor) return consonant ? 'active' : 'empty';
    return color;
  })();

  let bgClass = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  if (effectiveColor === 'green') bgClass = 'border-green-500 bg-green-500 text-white';
  else if (effectiveColor === 'orange') bgClass = 'border-orange-400 bg-orange-400 text-white';
  else if (effectiveColor === 'gray') bgClass = 'border-gray-500 bg-gray-500 text-white dark:border-gray-600 dark:bg-gray-600';
  else if (effectiveColor === 'active') bgClass = 'border-orange-400 bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300';
  else if (effectiveColor === 'next') bgClass = 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 ring-4 ring-orange-200 dark:ring-orange-900/50 scale-105 shadow-sm';
  else if (effectiveColor === 'empty') bgClass = 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500';

  let tileStyle = {};
  if (revealPhase === 'out') tileStyle = { transform: 'scaleY(0)', transition: 'transform 250ms ease-in' };
  else if (revealPhase === 'in') tileStyle = { transform: 'scaleY(1)', transition: 'transform 250ms ease-out' };

  // Filled: show consonant+matra. Empty: show matra hint (or 'अ' for inherent vowel).
  const display = consonant
    ? formSyllable(consonant, vowel)
    : (MATRAS[vowel] || '');

  return (
    <div
      className={`w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold border-2 ${bgClass}`}
      style={{ ...tileStyle, fontFamily: 'Noto Sans Devanagari, sans-serif' }}
    >
      {display}
    </div>
  );
}

// ── WordRow ───────────────────────────────────────────────────────────────────
function WordRow({ guessConsonants = [], vowels = [], colors, isActive, inputLength = 0, revealPhases, formedWord }) {
  return (
    <div className="flex items-center gap-3">
      {/* 4-tile grid */}
      <div className="flex gap-2">
        {vowels.map((v, i) => {
          const c = guessConsonants[i] || null;
          let color = 'empty';
          if (colors && colors[i]) color = colors[i];
          else if (c) color = 'active';
          else if (isActive && i === inputLength) color = 'next';
          return (
            <Tile
              key={i}
              consonant={c}
              vowel={v}
              color={color}
              revealPhase={revealPhases ? revealPhases[i] : undefined}
            />
          );
        })}
      </div>

      {/* Formed Hindi word to the right */}
      <div
        className="min-w-[3rem] text-2xl font-bold text-gray-700 dark:text-gray-200"
        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
      >
        {formedWord || ''}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getLetterStates(guesses) {
  const states = {};
  for (const g of guesses) {
    g.consonants.forEach((ch, i) => {
      const color = g.colors[i];
      if (color === 'green') states[ch] = 'green';
      else if (color === 'orange' && states[ch] !== 'green') states[ch] = 'orange';
      else if (color === 'gray' && !states[ch]) states[ch] = 'gray';
    });
  }
  return states;
}

// ── Main Game ─────────────────────────────────────────────────────────────────
export default function ShabdalGame({ game, onArchive, archiveDate }) {
  const { targetVowels, guesses, status, error, setError, submitGuess, formedTarget, gameNumber, dateStr } = game;
  const [input, setInput] = useState([]); // Array of consonants being typed
  const [revealState, setRevealState] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const prevGuessCount = useRef(guesses.length);
  const revealTimers = useRef([]);
  const isPlaying = status === 'playing';

  // Reveal animation
  function startReveal(rowIndex) {
    revealTimers.current.forEach(clearTimeout);
    revealTimers.current = [];
    setRevealState({ rowIndex, phases: [null, null, null, null] });
    for (let i = 0; i < 4; i++) {
      revealTimers.current.push(setTimeout(() =>
        setRevealState(prev => prev ? { ...prev, phases: prev.phases.map((p, j) => j === i ? 'out' : p) } : null),
        i * 500));
      revealTimers.current.push(setTimeout(() =>
        setRevealState(prev => prev ? { ...prev, phases: prev.phases.map((p, j) => j === i ? 'in' : p) } : null),
        i * 500 + 250));
      revealTimers.current.push(setTimeout(() =>
        setRevealState(prev => prev ? { ...prev, phases: prev.phases.map((p, j) => j === i ? 'done' : p) } : null),
        i * 500 + 500));
    }
    revealTimers.current.push(setTimeout(() => setRevealState(null), 3 * 500 + 600));
  }

  useEffect(() => {
    if (guesses.length > prevGuessCount.current) {
      prevGuessCount.current = guesses.length;
      startReveal(guesses.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses.length]);

  useEffect(() => () => revealTimers.current.forEach(clearTimeout), []);

  const shareText = status !== 'playing'
    ? buildShabdalShareText({ gameNumber, dateStr, guesses, status })
    : '';

  async function handleShare() {
    await shareOrCopy(shareText, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleKey(key) {
    if (!isPlaying) return;
    if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
      if (error) setError('');
    } else if (key === 'ENTER') {
      if (input.length !== 4) { setError('4 व्यंजन चाहिए'); return; }
      const ok = submitGuess(input);
      if (ok) setInput([]);
    } else {
      setInput(prev => {
        if (prev.length >= 4) return prev;
        if (error) setError('');
        return [...prev, key];
      });
    }
  }

  const letterStates = getLetterStates(guesses);
  const maxRows = status === 'won' ? guesses.length : 6;

  const rows = [];
  for (let i = 0; i < maxRows; i++) {
    const isRevealingRow = revealState?.rowIndex === i;
    if (i < guesses.length) {
      rows.push(
        <WordRow
          key={i}
          guessConsonants={guesses[i].consonants}
          vowels={targetVowels}
          colors={guesses[i].colors}
          revealPhases={isRevealingRow ? revealState.phases : undefined}
          formedWord={guesses[i].formed}
        />
      );
    } else if (i === guesses.length && isPlaying) {
      rows.push(
        <WordRow
          key={i}
          guessConsonants={input}
          vowels={targetVowels}
          isActive={true}
          inputLength={input.length}
          formedWord={input.length > 0 ? input.map((c, j) => formSyllable(c, targetVowels[j])).join('') : ''}
        />
      );
    } else {
      rows.push(<WordRow key={i} vowels={targetVowels} />);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable game area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-3 px-4 py-6 max-w-sm mx-auto w-full">

          {/* Word grid */}
          <div className="flex flex-col gap-2 mt-2">
            {rows}
          </div>

          {!isPlaying && !revealState && (
            <div className="mt-4 w-full">
              <ResultBanner
                tier={shabdalTier(status === 'won', guesses.length)}
                title={status === 'won' ? 'शाबाश!' : 'अगली बार!'}
                details={status === 'won' ? `${guesses.length} / 6 में सही` : `शब्द था: ${formedTarget}`}
              >
                {(!archiveDate || archiveDate === getTodayIST()) && (
                  <button
                    onClick={() => setShowShare(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Share Result
                  </button>
                )}
              </ResultBanner>
            </div>
          )}

          <button
            onClick={onArchive}
            className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2"
          >
            Archives &nbsp;📅
          </button>
        </div>
      </div>

      {/* Keyboard area */}
      {isPlaying && (
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 pt-2 pb-4">
          <div className="max-w-sm mx-auto">
            {error && (
              <p
                className="text-sm text-center text-red-500 dark:text-red-400 font-medium mb-1"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                {error}
              </p>
            )}
            <ShabdalKeyboard letterStates={letterStates} onKey={handleKey} />
          </div>
        </div>
      )}

      <Modal open={showShare} onClose={() => setShowShare(false)} title="Share Your Result">
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 font-mono text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {shareText}
          </div>
          <button
            onClick={handleShare}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {copied ? 'Copied!' : 'Share Result'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
