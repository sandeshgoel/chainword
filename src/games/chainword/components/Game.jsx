import { useState, useRef, useEffect } from 'react';
import WordRow from './WordRow.jsx';
import ResultBanner from './ResultBanner.jsx';
import ShareModal from './ShareModal.jsx';
import Modal from '../../../components/Modal.jsx';

function Connector() {
  return (
    <div className="self-center w-0.5 h-3 bg-gray-200 dark:bg-gray-700" />
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

export default function Game({ game, wordListReady }) {
  const {
    pair, dateStr, gameNumber,
    chain, optimalPath, parSteps, userSteps,
    currentWord, status, error, hintsUsed,
    submitWord, undoLastMove, giveUp, useHint, setError,
  } = game;

  const [showShare, setShowShare] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const isPlaying = status === 'playing';
  const isFinished = status === 'won' || status === 'gaveUp';

  // Auto-focus when game is active
  useEffect(() => {
    if (!isPlaying || !wordListReady) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [isPlaying, wordListReady]);

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

  function handleHint() {
    setShowHintModal(true);
  }

  function confirmHint() {
    setShowHintModal(false);
    const hint = useHint();
    if (hint) {
      submitWord(hint);
      setInputValue('');
    }
    refocus();
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="flex flex-col items-center gap-5 px-4 py-6 max-w-sm mx-auto w-full">

      {/* Today's info */}
      <div className="text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {dateStr} &nbsp;•&nbsp; Daily Chainword #{gameNumber}
        </p>
        {parSteps !== null ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Par: {parSteps - 1} guess{parSteps - 1 !== 1 ? 'es' : ''}
          </p>
        ) : wordListReady ? (
          <p className="text-xs text-amber-500 mt-0.5">
            ⚠ No path found for today's pair (try again tomorrow)
          </p>
        ) : null}
      </div>

      {/* ── Chain display ── */}
      <div className="flex flex-col w-full">

        {/* Start word */}
        <WordRow word={pair.start} variant="start" />

        {/* Completed steps */}
        {chain.slice(1).map((word, idx) => (
          <div key={idx}>
            <Connector />
            <WordRow
              word={word}
              prevWord={chain[idx]}
              variant={word === pair.end ? 'end' : 'step'}
              stepNumber={idx + 1}
              endWord={word === pair.end ? undefined : pair.end}
            />
          </div>
        ))}

        {/* ── Inline input slot ── */}
        {isPlaying && (
          <>
            <Connector />
            <InputTiles
              value={inputValue}
              currentWord={currentWord}
              onClick={() => inputRef.current?.focus()}
            />
          </>
        )}

        {/* End word target */}
        {isPlaying && (
          <>
            <Connector />
            <WordRow word={pair.end} variant="end" />
          </>
        )}
      </div>

      {/* Hidden real input + submit form */}
      {isPlaying && (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full">
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
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

          {/* Loading */}
          {!wordListReady && (
            <p className="text-xs text-gray-400 animate-pulse">Loading dictionary…</p>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 font-medium animate-shake">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {chain.length > 1 && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { undoLastMove(); refocus(); }}
                className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
              >
                ↩ Undo
              </button>
            )}
            {optimalPath && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleHint}
                className="px-4 py-2 text-sm text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
              >
                💡 Hint
              </button>
            )}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={giveUp}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Give Up
            </button>
          </div>

          {/* Progress */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {userSteps} guess{userSteps !== 1 ? 'es' : ''}
            {hintsUsed > 0 && <span className="text-amber-500 dark:text-amber-400"> • 💡 {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''}</span>}
            {parSteps !== null && (
              <span className={userSteps >= parSteps ? ' text-amber-500' : ''}>
                {userSteps < parSteps ? ' — on track!' : ` (+${userSteps - parSteps + 1} over par)`}
              </span>
            )}
          </p>
        </form>
      )}

      {/* Result banner */}
      {isFinished && (
        <ResultBanner
          status={status}
          userSteps={userSteps}
          parSteps={parSteps}
          hintsUsed={hintsUsed}
          optimalPath={status === 'gaveUp' ? optimalPath : null}
          onShare={() => setShowShare(true)}
        />
      )}

      {/* Share modal */}
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        gameData={isFinished ? {
          gameNumber, dateStr,
          start: pair.start, end: pair.end,
          userSteps, parSteps, chain, hintsUsed,
          gaveUp: status === 'gaveUp',
        } : null}
      />

      {/* Hint confirmation modal */}
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
              onClick={confirmHint}
              className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors"
            >
              Yes, show hint
            </button>
          </div>
        </div>
      </Modal>
    </div>
    </div>
  );
}
