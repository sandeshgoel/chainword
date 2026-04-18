import { useState, useRef, useEffect } from 'react';
import WordRow from './WordRow.jsx';
import ResultBanner from '../../../components/ResultBanner.jsx';
import Modal from '../../../components/Modal.jsx';
import { chainwordTier } from '../../../utils/awards.js';
import { showRewardedAd } from '../../../utils/ads.js';
import { buildChainwordShareText, shareOrCopy } from '../../../utils/sharing.js';


const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

function Keyboard({ onKey }) {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-2">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <button
                key={key}
                onMouseDown={(e) => { e.preventDefault(); onKey(key); }}
                className={`${isWide ? 'px-2 min-w-[46px]' : 'w-8'} h-12 rounded text-xs font-bold flex items-center justify-center transition-colors select-none touch-manipulation bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95`}
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

// Inline input tiles rendered as part of the chain
function InputTiles({ value, currentWord, onClick }) {
  const letters = value.padEnd(4, ' ').split('');
  return (
    <div className="flex justify-center cursor-text" onClick={onClick}>
      <div className="flex gap-1.5">
        {letters.map((ch, i) => {
          const filled = ch !== ' ';
          const changed = filled && currentWord && currentWord[i] !== ch;
          const isCursor = i === value.length;
          return (
            <div
              key={i}
              className={[
                'w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold border-2 transition-all duration-100',
                filled
                  ? changed
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : isCursor
                    ? 'border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-800 shadow-sm'
                    : 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
              ].join(' ')}
            >
              {filled ? ch.toUpperCase() : (isCursor ? <span className="w-0.5 h-5 bg-indigo-500 dark:bg-indigo-400 animate-pulse inline-block rounded" /> : '')}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DifficultyToggle({ hardMode, onToggle }) {
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      onClick={onToggle}
      title={hardMode ? 'Switch to Easy mode' : 'Switch to Hard mode'}
      className="relative flex flex-col w-14 rounded-xl cursor-pointer select-none bg-gray-200 dark:bg-gray-700 p-0.5 shadow-inner"
    >
      {/* Sliding thumb */}
      <div
        className={`absolute left-0.5 right-0.5 h-[calc(50%-2px)] rounded-[10px] shadow-md transition-all duration-300 ${
          hardMode
            ? 'top-[calc(50%+2px)] bg-red-500'
            : 'top-0.5 bg-indigo-600'
        }`}
      />
      {/* Labels */}
      <span className={`relative z-10 text-[10px] font-extrabold text-center py-1.5 transition-colors duration-300 ${!hardMode ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
        Easy
      </span>
      <span className={`relative z-10 text-[10px] font-extrabold text-center py-1.5 transition-colors duration-300 ${hardMode ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}>
        Hard
      </span>
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="flex justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-11 h-11 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
          />
        ))}
      </div>
    </div>
  );
}

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

export default function Game({ game, wordListReady, hardMode, adsEnabled, onToggleHardMode, onArchive, archiveDate }) {
  const {
    pair, dateStr, gameNumber,
    chain, optimalPath, parSteps, userSteps,
    currentWord, status, error, hintsUsed,
    submitWord, undoLastMove, useHint, setError,
  } = game;

  const [showHintModal, setShowHintModal] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const isPlaying = status === 'playing';
  const isFinished = status === 'won';

  const shareText = isFinished ? buildChainwordShareText({
    gameNumber, dateStr,
    start: pair.start, end: pair.end,
    userSteps, parSteps, chain, hintsUsed,
  }) : null;

  async function handleShare() {
    await shareOrCopy(shareText, () => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  useEffect(() => {
    if (!isPlaying || !wordListReady) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [isPlaying, wordListReady]);

  // Auto-scroll to bottom so buttons stay visible after each guess
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chain.length]);

  // Auto-submit when 4th letter typed and word is valid
  useEffect(() => {
    if (!isPlaying || !wordListReady || inputValue.length !== 4) return;
    const ok = submitWord(inputValue);
    if (ok) setInputValue('');
    refocus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  function refocus() {
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleChange(e) {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 4);
    setInputValue(raw);
    if (error) setError('');
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (inputValue.length !== 4) return;
    const ok = submitWord(inputValue);
    if (ok) setInputValue('');
    refocus();
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  function handleKeyboardKey(key) {
    scrollToBottom();
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

  function applyHint() {
    setShowHintModal(false);
    const { hint, newCount } = useHint();
    if (hint) {
      submitWord(hint, newCount);
      setInputValue('');
    }
    refocus();
  }

  function handleHintClick() {
    if (adsEnabled) {
      showRewardedAd({
        name: 'chainword-hint',
        onGranted: applyHint,
        onDismissed: refocus,
        onNoAd: () => setShowHintModal(true), // no ad available → fall back to free hint modal
      });
    } else {
      setShowHintModal(true);
    }
  }

  return (
    <div className="h-full flex flex-col">

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 px-4 py-6 max-w-sm mx-auto w-full">

          {/* Today's info + difficulty toggle */}
          <div className="relative w-full text-center">
            {!parSteps && wordListReady && (
              <p className="text-xs text-amber-500 mt-0.5">
                ⚠ No path found for today's pair (try again tomorrow)
              </p>
            )}
            <div className="absolute top-0 right-0">
              <DifficultyToggle hardMode={hardMode} onToggle={onToggleHardMode} />
            </div>
          </div>

          {/* Chain display */}
          <div className="flex flex-col gap-2 w-full">
            <WordRow word={pair.start} variant="start" />

            {chain.slice(1).map((word, idx) => (
              <WordRow
                key={idx}
                word={word}
                prevWord={chain[idx]}
                variant={word === pair.end ? 'end' : 'step'}
                endWord={word === pair.end ? undefined : pair.end}
              />
            ))}

            {isPlaying && (
              <>
                <InputTiles
                  value={inputValue}
                  currentWord={currentWord}
                  onClick={() => inputRef.current?.focus()}
                />
                {/* Placeholder rows: start with 2 (3 total incl. input), always keep ≥1 after input */}
                {Array.from({ length: Math.max(1, 3 - chain.length) }).map((_, i) => (
                  <EmptyRow key={i} />
                ))}
              </>
            )}

            {isPlaying && <WordRow word={pair.end} variant="end" />}
          </div>

          {/* Buttons + progress */}
          {isPlaying && (
            <div className="flex flex-col items-center gap-3 w-full">
              {!wordListReady && (
                <p className="text-xs text-gray-400 animate-pulse">Loading dictionary…</p>
              )}

              <div className="flex gap-3">
                {chain.length > 1 && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { undoLastMove(); refocus(); }}
                    className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
                  >
                    ↩ Undo
                  </button>
                )}
                {optimalPath && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleHintClick}
                    className="px-4 py-2 text-sm text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
                  >
                    {adsEnabled ? '📺 Hint' : '💡 Hint'}
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userSteps} guess{userSteps !== 1 ? 'es' : ''}
                {hintsUsed > 0 && <span className="text-amber-500 dark:text-amber-400"> • 💡 {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''}</span>}
              </p>
            </div>
          )}

          {/* Archive banner when viewing a past puzzle */}
          {archiveDate && archiveDate !== getTodayIST() && (
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
              <span className="text-amber-700 dark:text-amber-300 font-medium">Viewing past puzzle</span>
              <button onClick={() => onArchive && onArchive()} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">Change date</button>
            </div>
          )}

          {/* Result banner */}
          {isFinished && (() => {
            const tier = chainwordTier(status === 'won', userSteps, hintsUsed, parSteps);
            const detailParts = [];
            if (status === 'won') {
              const steps = userSteps - 1;
              detailParts.push(`${steps} guess${steps !== 1 ? 'es' : ''}`);
              if (hintsUsed > 0) detailParts.push(`${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}`);
            }
            return (
              <ResultBanner
                tier={tier}
                title={status === 'won' ? 'Well done!' : "Couldn't solve it"}
                details={detailParts.join(' · ')}
              >
{(!archiveDate || archiveDate === getTodayIST()) && (
                  <button
                    onClick={() => setShowShare(true)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    Share Result
                  </button>
                )}
              </ResultBanner>
            );
          })()}

          {/* Archive button */}
          <button
            onClick={onArchive}
            className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2"
          >
            Archives &nbsp;📅
          </button>

<Modal open={showHintModal} onClose={() => { setShowHintModal(false); refocus(); }} title="Use a hint?">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A hint will reveal the next word on the optimal path.
                <br />
                <span className="font-semibold text-amber-600 dark:text-amber-400">This counts as +1 guess towards your score.</span>
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowHintModal(false); refocus(); }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyHint}
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors"
                >
                  Yes, show hint
                </button>
              </div>
            </div>
          </Modal>

          <Modal open={showShare} onClose={() => setShowShare(false)} title="Share Your Result">
            <div className="space-y-4">
              <pre className="text-xs bg-gray-50 dark:bg-gray-800 rounded-xl p-3 whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300">
                {shareText}
              </pre>
              <button
                onClick={handleShare}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                {copied ? 'Copied!' : 'Share Result'}
              </button>
            </div>
          </Modal>

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
              aria-label="Enter next word"
            />
            {error && (
              <p className="text-sm text-center text-red-500 dark:text-red-400 font-medium animate-shake mb-1">
                {error}
              </p>
            )}
            <Keyboard onKey={handleKeyboardKey} />
          </div>
        </div>
      )}

    </div>
  );
}
