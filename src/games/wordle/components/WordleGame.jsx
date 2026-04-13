import { useState, useRef, useEffect } from 'react';
import { buildWordleShareText, shareOrCopy } from '../../../utils/sharing.js';
import { formatDate } from '../../../utils/wordUtils.js';

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['⌫','Z','X','C','V','B','N','M','ENTER'],
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
                  e.preventDefault(); // keep hidden input focused
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

function Tile({ char, color }) {
  let bgClass = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'; // empty

  if (color === 'green') {
    bgClass = 'border-green-500 bg-green-500 text-white';
  } else if (color === 'orange') {
    bgClass = 'border-orange-400 bg-orange-400 text-white';
  } else if (color === 'gray') {
    bgClass = 'border-gray-500 bg-gray-500 text-white dark:border-gray-600 dark:bg-gray-600';
  } else if (color === 'active') {
    bgClass = 'border-indigo-400 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300';
  } else if (color === 'next') {
    bgClass = 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 ring-4 ring-indigo-200 dark:ring-indigo-900/50 scale-105 shadow-sm z-10';
  } else if (color === 'empty') {
    bgClass = 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';
  }

  return (
    <div className={`w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold border-2 transition-all duration-200 transform ${bgClass}`}>
      {char ? char.toUpperCase() : ''}
    </div>
  );
}

function WordRow({ word, colors, isActive, inputLength }) {
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

        return <Tile key={i} char={filled ? ch : ''} color={color} />;
      })}
    </div>
  );
}

export default function WordleGame({ game, wordListReady }) {
  const { target, dateStr, gameNumber, guesses, status, error, submitGuess, setError } = game;
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const currentRowRef = useRef(null);

  const isPlaying = status === 'playing';

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

    // Ensure active row stays in view
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

  async function handleShare() {
    const text = buildWordleShareText({ gameNumber, dateStr, guesses, status });
    await shareOrCopy(text, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const rows = [];
  const maxRows = status === 'won' ? guesses.length : 6;
  for (let i = 0; i < maxRows; i++) {
    if (i < guesses.length) {
      rows.push(<WordRow key={i} word={guesses[i].word} colors={guesses[i].colors} />);
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
      {/* Scrollable area: title + word grid + result card */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-4 px-4 py-6 max-w-sm mx-auto w-full">
          <div className="text-center mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(dateStr)} &nbsp;•&nbsp; Daily Wordle #{gameNumber}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {rows}
          </div>

          {status !== 'playing' && (
            <div className={`mt-4 p-6 rounded-2xl w-full flex flex-col items-center text-center ${status === 'won' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <h2 className={`text-2xl font-black mb-2 ${status === 'won' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {status === 'won' ? 'You got it!' : 'Game Over'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                {status === 'won' ? `Number of guesses: ${guesses.length} / 6` : `The word was ${target.toUpperCase()}`}
              </p>
              <button
                onClick={handleShare}
                className={`w-full py-3 ${status === 'won' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Result
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pinned keyboard footer — only while playing */}
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
