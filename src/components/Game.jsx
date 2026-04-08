import { useState } from 'react';
import WordRow from './WordRow.jsx';
import WordInput from './WordInput.jsx';
import ResultBanner from './ResultBanner.jsx';
import ShareModal from './ShareModal.jsx';

export default function Game({ game, wordListReady }) {
  const {
    pair, dateStr, gameNumber,
    chain, optimalPath, parSteps, userSteps,
    currentWord, status, error,
    submitWord, giveUp, useHint, setError,
  } = game;

  const [showShare, setShowShare] = useState(false);
  const [hintWord, setHintWord] = useState(null);
  const [hintVisible, setHintVisible] = useState(false);

  const isPlaying = status === 'playing';
  const isFinished = status === 'won' || status === 'gaveUp';

  function handleHint() {
    const hint = useHint();
    if (hint) {
      setHintWord(hint);
      setHintVisible(true);
      setTimeout(() => setHintVisible(false), 4000);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-6 max-w-sm mx-auto w-full">
      {/* Today's info */}
      <div className="text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {dateStr} &nbsp;•&nbsp; Daily Chainword #{gameNumber}
        </p>
        {parSteps !== null ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Par: {parSteps} step{parSteps !== 1 ? 's' : ''}
          </p>
        ) : wordListReady ? (
          <p className="text-xs text-amber-500 mt-0.5">
            ⚠ No path found for today's pair (try again tomorrow)
          </p>
        ) : null}
      </div>

      {/* Word chain display */}
      <div className="flex flex-col gap-2 w-full">
        {/* Start word */}
        <WordRow word={pair.start} variant="start" />

        {/* User's steps (skip the first word which is pair.start) */}
        {chain.slice(1).map((word, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            {/* Connector line */}
            <div className="flex items-center ml-8 gap-2">
              <div className="w-0.5 h-3 bg-gray-200 dark:bg-gray-700 ml-[21px]"></div>
            </div>
            <WordRow
              word={word}
              prevWord={chain[idx]} // chain[idx] is the word before this one
              variant={word === pair.end ? 'end' : 'step'}
              stepNumber={idx + 1}
            />
          </div>
        ))}

        {/* Connector + End word target (only while still trying to reach it) */}
        {isPlaying && currentWord !== pair.end && (
          <>
            <div className="flex items-center ml-8 gap-2">
              <div className="w-0.5 h-3 bg-gray-200 dark:bg-gray-700 ml-[21px]"></div>
            </div>
            <WordRow word={pair.end} variant="end" />
          </>
        )}
      </div>

      {/* Progress indicator */}
      {isPlaying && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {userSteps} step{userSteps !== 1 ? 's' : ''} so far
          {parSteps !== null && (
            <span className={userSteps > parSteps ? ' text-amber-500' : ''}>
              {userSteps <= parSteps ? ' — on track!' : ` (+${userSteps - parSteps} over par)`}
            </span>
          )}
        </div>
      )}

      {/* Word input (only while playing) */}
      {isPlaying && (
        <div className="flex flex-col items-center gap-4 w-full">
          {!wordListReady && (
            <p className="text-xs text-gray-400 animate-pulse">Loading dictionary…</p>
          )}
          <WordInput
            onSubmit={submitWord}
            currentWord={currentWord}
            disabled={!wordListReady}
            error={error}
            onClearError={() => setError('')}
          />

          {/* Hint */}
          {hintVisible && hintWord && (
            <div className="text-sm bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-700">
              Hint: try <strong>{hintWord.toUpperCase()}</strong>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {optimalPath && (
              <button
                onClick={handleHint}
                className="px-4 py-2 text-sm text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
              >
                💡 Hint
              </button>
            )}
            <button
              onClick={giveUp}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Give Up
            </button>
          </div>
        </div>
      )}

      {/* Result banner */}
      {isFinished && (
        <ResultBanner
          status={status}
          userSteps={userSteps}
          parSteps={parSteps}
          optimalPath={status === 'gaveUp' ? optimalPath : null}
          onShare={() => setShowShare(true)}
        />
      )}

      {/* Share modal */}
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        gameData={isFinished ? {
          gameNumber,
          dateStr,
          start: pair.start,
          end: pair.end,
          userSteps,
          parSteps,
          chain,
          gaveUp: status === 'gaveUp',
        } : null}
      />
    </div>
  );
}
