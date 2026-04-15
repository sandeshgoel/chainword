import { useState, useRef, useEffect } from 'react';
import { buildWordleShareText, shareOrCopy } from '../../../utils/sharing.js';
import ResultBanner from '../../../components/ResultBanner.jsx';
import Modal from '../../../components/Modal.jsx';
import { wordleTier, TIER_CONFIG } from '../../../utils/awards.js';

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

function getLetterStates(guesses) {
  const states = {};
  for (const guess of guesses) {
    guess.word.split('').forEach((ch, i) => {
      const letter = ch.toUpperCase();
      const color = guess.colors[i];
      if (color === 'green') {
        states[letter] = 'green';
      } else if (color === 'orange' && states[letter] !== 'green') {
        states[letter] = 'orange';
      } else if (color === 'gray' && !states[letter]) {
        states[letter] = 'gray';
      }
    });
  }
  return states;
}

function Keyboard({ letterStates, onKey }) {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-3">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1">
          {row.map((key) => {
            const state = letterStates[key] || 'unused';
            let keyClass;
            if (state === 'green') {
              keyClass = 'bg-green-500 text-white';
            } else if (state === 'orange') {
              keyClass = 'bg-orange-400 text-white';
            } else if (state === 'gray') {
              keyClass = 'bg-gray-400 dark:bg-gray-600 text-white line-through opacity-50';
            } else {
              keyClass = 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
            }
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <button
                key={key}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onKey(key);
                }}
                className={`${isWide ? 'px-2 min-w-[46px]' : 'w-8'} h-12 rounded text-xs font-bold flex items-center justify-center transition-colors select-none touch-manipulation ${keyClass}`}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// revealPhase: undefined (normal) | null (not yet) | 'out' (flip out) | 'in' (flip in) | 'done'
function Tile({ char, color, revealPhase }) {
  // When animating: before flip = uncolored, after flip midpoint = colored
  const useReveal = revealPhase !== undefined;
  const showColor = !useReveal || revealPhase === 'in' || revealPhase === 'done';

  const effectiveColor = (() => {
    if (!showColor) return char ? 'active' : 'empty';
    return color;
  })();

  let bgClass = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  if (effectiveColor === 'green') {
    bgClass = 'border-green-500 bg-green-500 text-white';
  } else if (effectiveColor === 'orange') {
    bgClass = 'border-orange-400 bg-orange-400 text-white';
  } else if (effectiveColor === 'gray') {
    bgClass = 'border-gray-500 bg-gray-500 text-white dark:border-gray-600 dark:bg-gray-600';
  } else if (effectiveColor === 'active') {
    bgClass = 'border-indigo-400 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300';
  } else if (effectiveColor === 'next') {
    bgClass = 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 ring-4 ring-indigo-200 dark:ring-indigo-900/50 scale-105 shadow-sm';
  } else if (effectiveColor === 'empty') {
    bgClass = 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  }

  let tileStyle = {};
  if (revealPhase === 'out') {
    tileStyle = { transform: 'scaleY(0)', transition: 'transform 250ms ease-in' };
  } else if (revealPhase === 'in') {
    tileStyle = { transform: 'scaleY(1)', transition: 'transform 250ms ease-out' };
  }

  return (
    <div
      className={`w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold border-2 ${bgClass}`}
      style={tileStyle}
    >
      {char ? char.toUpperCase() : ''}
    </div>
  );
}

function WordRow({ word, colors, isActive, inputLength, revealPhases }) {
  const letters = word.padEnd(4, ' ').split('');
  return (
    <div className="flex gap-2">
      {letters.map((ch, i) => {
        const filled = ch !== ' ';
        let color = 'empty';
        if (colors && colors[i]) {
          color = colors[i];
        } else if (filled) {
          color = 'active';
        } else if (isActive && i === inputLength) {
          color = 'next';
        }
        return (
          <Tile
            key={i}
            char={filled ? ch : ''}
            color={color}
            revealPhase={revealPhases ? revealPhases[i] : undefined}
          />
        );
      })}
    </div>
  );
}

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

export default function WordleGame({ game, wordListReady, onArchive, archiveDate }) {
  const { target, dateStr, gameNumber, guesses, status, error, submitGuess, setError } = game;
  const [inputValue, setInputValue] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const currentRowRef = useRef(null);

  // Reveal animation state
  // { rowIndex, phases: Array<null|'out'|'in'|'done'> }
  const [revealState, setRevealState] = useState(null);
  const prevGuessCount = useRef(guesses.length); // skip animating pre-loaded guesses
  const revealTimers = useRef([]);

  const isPlaying = status === 'playing';

  function startReveal(rowIndex) {
    revealTimers.current.forEach(clearTimeout);
    revealTimers.current = [];
    setRevealState({ rowIndex, phases: [null, null, null, null] });

    for (let i = 0; i < 4; i++) {
      // Flip out (scaleY → 0), uncolored
      revealTimers.current.push(setTimeout(() => {
        setRevealState(prev => prev ? { ...prev, phases: prev.phases.map((p, j) => j === i ? 'out' : p) } : null);
      }, i * 500));
      // Flip in (scaleY → 1), colored
      revealTimers.current.push(setTimeout(() => {
        setRevealState(prev => prev ? { ...prev, phases: prev.phases.map((p, j) => j === i ? 'in' : p) } : null);
      }, i * 500 + 250));
      // Done
      revealTimers.current.push(setTimeout(() => {
        setRevealState(prev => prev ? { ...prev, phases: prev.phases.map((p, j) => j === i ? 'done' : p) } : null);
      }, i * 500 + 500));
    }
    // Clear reveal state after all letters done
    revealTimers.current.push(setTimeout(() => setRevealState(null), 3 * 500 + 550));
  }

  // Detect new guess and start reveal
  useEffect(() => {
    if (guesses.length > prevGuessCount.current) {
      prevGuessCount.current = guesses.length;
      startReveal(guesses.length - 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses.length]);

  // Cleanup timers on unmount
  useEffect(() => () => revealTimers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!isPlaying || !wordListReady) return;
    const id = setTimeout(() => {
      inputRef.current?.focus();
      currentRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    return () => clearTimeout(id);
  }, [isPlaying, wordListReady]);

  function refocus() {
    setTimeout(() => {
      inputRef.current?.focus();
      currentRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  function handleChange(e) {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 4);
    setInputValue(raw);
    if (error) setError('');
    setTimeout(() => {
      currentRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 10);
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (inputValue.length !== 4) return;
    const ok = submitGuess(inputValue);
    if (ok) setInputValue('');
    refocus();
  }

  function handleKeyboardKey(key) {
    if (key === '⌫') {
      setInputValue(prev => prev.slice(0, -1));
      if (error) setError('');
    } else if (key === 'ENTER') {
      handleSubmit();
    } else {
      setInputValue(prev => {
        if (prev.length >= 4) return prev;
        if (error) setError('');
        return prev + key.toLowerCase();
      });
    }
  }

  const letterStates = getLetterStates(guesses);

  const shareText = status !== 'playing'
    ? buildWordleShareText({ gameNumber, dateStr, guesses, status })
    : '';

  async function handleShare() {
    await shareOrCopy(shareText, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const rows = [];
  const maxRows = status === 'won' ? guesses.length : 6;
  for (let i = 0; i < maxRows; i++) {
    const isRevealingRow = revealState?.rowIndex === i;
    if (i < guesses.length) {
      rows.push(
        <WordRow
          key={i}
          word={guesses[i].word}
          colors={guesses[i].colors}
          revealPhases={isRevealingRow ? revealState.phases : undefined}
        />
      );
    } else if (i === guesses.length && isPlaying) {
      rows.push(
        <div key={i} onClick={refocus} className="cursor-text" ref={currentRowRef}>
          <WordRow word={inputValue} isActive={true} inputLength={inputValue.length} />
        </div>
      );
    } else {
      rows.push(<WordRow key={i} word="" />);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-4 px-4 py-6 max-w-sm mx-auto w-full">

          <div className="flex flex-col gap-2">
            {rows}
          </div>

          {archiveDate && archiveDate !== getTodayIST() && (
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
              <span className="text-amber-700 dark:text-amber-300 font-medium">Viewing past puzzle</span>
              <button onClick={onArchive} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">Change date</button>
            </div>
          )}

          {status !== 'playing' && (
            <div className="mt-4 w-full">
              <ResultBanner
                tier={wordleTier(status === 'won', guesses.length)}
                title={status === 'won' ? 'You got it!' : 'Game Over'}
                details={status === 'won' ? `In ${guesses.length} / 6` : `The word was ${target.toUpperCase()}`}
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

          {status !== 'playing' && (() => {
            const tier = wordleTier(status === 'won', guesses.length);
            const cfg = TIER_CONFIG[tier];
            return (
              <Modal open={showShare} onClose={() => setShowShare(false)} title="Share Your Result">
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-3xl">{cfg.emoji}</div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">4word #{gameNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {status === 'won'
                        ? `Solved in ${guesses.length} / 6`
                        : `The word was ${target.toUpperCase()}`}
                    </p>
                  </div>
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
            );
          })()}

          <button
            onClick={onArchive}
            className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2"
          >
            Archives &nbsp;📅
          </button>

        </div>
      </div>

      {isPlaying && (
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 pt-2 pb-4">
          <div className="max-w-sm mx-auto">
            <input
              ref={inputRef}
              type="text"
              inputMode="none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={!wordListReady}
              maxLength={4}
              className="sr-only"
              aria-label="Enter word"
            />
            {!wordListReady && (
              <p className="text-xs text-center text-gray-400 animate-pulse mb-1">Loading dictionary…</p>
            )}
            {error && (
              <p className="text-sm text-center text-red-500 dark:text-red-400 font-medium animate-shake mb-1">
                {error}
              </p>
            )}
            <Keyboard letterStates={letterStates} onKey={handleKeyboardKey} />
          </div>
        </div>
      )}
    </div>
  );
}
