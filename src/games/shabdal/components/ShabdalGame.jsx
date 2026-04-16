import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ShabdalKeyboard from './ShabdalKeyboard.jsx';
import Modal from '../../../components/Modal.jsx';
import { formHindiWord } from '../../../utils/hindiUtils.js';
import { buildShabdalShareText, shareOrCopy } from '../../../utils/sharing.js';

// ── Tile ─────────────────────────────────────────────────────────────────────
function Tile({ char, color, revealPhase }) {
  const useReveal = revealPhase !== undefined;
  const showColor = !useReveal || revealPhase === 'in' || revealPhase === 'done';

  const effectiveColor = (() => {
    if (!showColor) return char ? 'active' : 'empty';
    return color;
  })();

  let bgClass = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  if (effectiveColor === 'green') bgClass = 'border-green-500 bg-green-500 text-white';
  else if (effectiveColor === 'orange') bgClass = 'border-orange-400 bg-orange-400 text-white';
  else if (effectiveColor === 'gray') bgClass = 'border-gray-500 bg-gray-500 text-white dark:border-gray-600 dark:bg-gray-600';
  else if (effectiveColor === 'active') bgClass = 'border-orange-400 bg-white dark:bg-gray-800 text-orange-700 dark:text-orange-300';
  else if (effectiveColor === 'next') bgClass = 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 ring-4 ring-orange-200 dark:ring-orange-900/50 scale-105 shadow-sm';
  else if (effectiveColor === 'empty') bgClass = 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  let tileStyle = {};
  if (revealPhase === 'out') tileStyle = { transform: 'scaleY(0)', transition: 'transform 250ms ease-in' };
  else if (revealPhase === 'in') tileStyle = { transform: 'scaleY(1)', transition: 'transform 250ms ease-out' };

  return (
    <div
      className={`w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold border-2 ${bgClass}`}
      style={{ ...tileStyle, fontFamily: 'Noto Sans Devanagari, sans-serif' }}
    >
      {char || ''}
    </div>
  );
}

// ── WordRow ───────────────────────────────────────────────────────────────────
function WordRow({ letters = [], colors, isActive, inputLength = 0, revealPhases, formedWord }) {
  const padded = [...letters];
  while (padded.length < 4) padded.push(null);

  return (
    <div className="flex items-center gap-3">
      {/* 4-letter grid */}
      <div className="flex gap-2">
        {padded.map((ch, i) => {
          let color = 'empty';
          if (colors && colors[i]) color = colors[i];
          else if (ch) color = 'active';
          else if (isActive && i === inputLength) color = 'next';
          return (
            <Tile
              key={i}
              char={ch || ''}
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
    g.letters.forEach((ch, i) => {
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
  const { target, guesses, status, error, setError, submitGuess, formedTarget, gameNumber, dateStr } = game;
  const [input, setInput] = useState([]); // Array of Devanagari letters
  const [revealState, setRevealState] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
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
    revealTimers.current.push(setTimeout(() => {
      setRevealState(null);
      if (status !== 'playing') setShowResultModal(true);
    }, 3 * 500 + 600));
  }

  useEffect(() => {
    if (guesses.length > prevGuessCount.current) {
      prevGuessCount.current = guesses.length;
      startReveal(guesses.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses.length]);

  useEffect(() => () => revealTimers.current.forEach(clearTimeout), []);

  async function handleShare() {
    const text = buildShabdalShareText({ gameNumber, dateStr, guesses, status });
    await shareOrCopy(text, () => toast.success('Result copied to clipboard!'));
  }

  function handleKey(key) {
    if (!isPlaying) return;
    if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
      if (error) setError('');
    } else if (key === 'ENTER') {
      if (input.length !== 4) { setError('4 अक्षर चाहिए'); return; }
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
          letters={guesses[i].letters}
          colors={guesses[i].colors}
          revealPhases={isRevealingRow ? revealState.phases : undefined}
          formedWord={guesses[i].formed}
        />
      );
    } else if (i === guesses.length && isPlaying) {
      rows.push(
        <WordRow
          key={i}
          letters={input}
          isActive={true}
          inputLength={input.length}
          formedWord={input.length > 0 ? formHindiWord(input) : ''}
        />
      );
    } else {
      rows.push(<WordRow key={i} />);
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
            <div className="mt-4 flex flex-col items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2">
              <button
                onClick={() => setShowResultModal(true)}
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
              >
                Result Analysis
              </button>
              
              <button
                onClick={onArchive}
                className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {archiveDate ? 'Back to Today' : 'Play Past Puzzles'}
              </button>
            </div>
          )}
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

      {/* Result Modal */}
      <Modal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={status === 'won' ? 'शाबाश!' : 'अगली बार!'}
      >
        <div className="text-center space-y-6">
          <div className="text-5xl">{status === 'won' ? '🎉' : '😔'}</div>
          
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              {status === 'won' ? 'आपने शब्द पहचान लिया!' : 'सही शब्द था:'}
            </p>
            <p className="text-3xl font-black mt-1" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
              {formedTarget}
            </p>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-100 dark:shadow-none transition-all group"
          >
            <span>SHARE RESULT</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Shabdal #{gameNumber} • {guesses.length}/6
          </p>
        </div>
      </Modal>
    </div>
  );
}
