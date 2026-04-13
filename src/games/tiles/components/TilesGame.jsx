import { calcScore, SLOT_MULTIPLIERS } from '../hooks/useTiles.js';
import { formatDate } from '../../../utils/wordUtils.js';

const MULTIPLIER_LABEL = { 2: 'DL', 3: 'TL' };
const MULTIPLIER_COLOR = {
  2: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
  3: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
};
const MULTIPLIER_TEXT = {
  2: 'text-blue-500 dark:text-blue-400',
  3: 'text-red-500 dark:text-red-400',
};

function ScrabbleTile({ letter, points, used, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={used}
      className={`relative w-12 h-12 rounded-lg text-xl font-extrabold flex items-center justify-center select-none transition-[transform,box-shadow]
        ${used
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
          : 'text-amber-900 dark:text-amber-100 cursor-pointer active:translate-y-[3px]'
        }`}
      style={used ? {} : {
        background: 'linear-gradient(170deg, #fef9c3 0%, #fde68a 55%, #fbbf24 100%)',
        border: '1px solid #d97706',
        boxShadow: '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)',
      }}
      onMouseDown={(e) => {
        if (!used) e.currentTarget.style.boxShadow = '0 1px 0 #92400e, 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)';
      }}
      onMouseUp={(e) => {
        if (!used) e.currentTarget.style.boxShadow = '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)';
      }}
      onMouseLeave={(e) => {
        if (!used) e.currentTarget.style.boxShadow = '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)';
      }}
    >
      {letter}
      {!used && (
        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-700">
          {points}
        </span>
      )}
    </button>
  );
}

function SlotCell({ tile, multiplier, onClick }) {
  const label = MULTIPLIER_LABEL[multiplier];

  return (
    <button
      onClick={onClick}
      className={`relative w-14 h-14 rounded-xl flex flex-col items-center justify-center text-2xl font-extrabold transition-[transform,box-shadow]
        ${tile
          ? 'text-amber-900 dark:text-amber-100 cursor-pointer active:translate-y-[3px]'
          : 'border-2 border-dashed bg-white dark:bg-gray-800 cursor-default'
        } ${!tile && label === 'DL' ? 'border-blue-300 dark:border-blue-700'
          : !tile && label === 'TL' ? 'border-red-300 dark:border-red-700'
          : !tile ? 'border-gray-300 dark:border-gray-600' : ''}`}
      style={tile ? {
        background: 'linear-gradient(170deg, #fef9c3 0%, #fde68a 55%, #fbbf24 100%)',
        border: '1px solid #d97706',
        boxShadow: '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)',
      } : {}}
    >
      {tile ? (
        <>
          {tile.letter}
          <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-600 dark:text-amber-400">
            {tile.points}
          </span>
          {label && (
            <span className={`absolute top-0.5 right-1 text-[8px] font-extrabold leading-none ${MULTIPLIER_TEXT[multiplier]}`}>{label}</span>
          )}
        </>
      ) : label ? (
        <span className={`text-xs font-extrabold tracking-wide ${MULTIPLIER_TEXT[multiplier]}`}>{label}</span>
      ) : null}
    </button>
  );
}

export default function TilesGame({ game }) {
  const {
    tiles, slots, dateStr, gameNumber,
    error, submissions, bestScore, optimalScore, optimalWord,
    placeTile, removeFromSlot, clearSlots, shuffleTiles, submitWord,
  } = game;

  const filledCount = slots.filter(Boolean).length;
  const currentScore = calcScore(slots);
  const currentWord = slots.filter(Boolean).map(t => t.letter).join('');

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center gap-6 px-4 py-6 max-w-sm mx-auto w-full">

        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(dateStr)} &nbsp;•&nbsp; Daily Tiles #{gameNumber}
          </p>
        </div>

        {/* Template */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Your word</p>
          <div className="flex gap-2.5">
            {slots.map((tile, i) => (
              <SlotCell
                key={i}
                tile={tile}
                multiplier={SLOT_MULTIPLIERS[i]}
                onClick={() => tile && removeFromSlot(i)}
              />
            ))}
          </div>
          <div className="h-6 flex items-center">
            {filledCount === 4 ? (
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {currentWord} &nbsp;—&nbsp;
                <span className="text-indigo-600 dark:text-indigo-400">{currentScore} pts</span>
              </p>
            ) : filledCount > 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {4 - filledCount} more tile{4 - filledCount !== 1 ? 's' : ''} needed
              </p>
            ) : null}
          </div>
        </div>

        {/* Tile rack */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Your tiles — tap to place</p>
            <button
              onClick={shuffleTiles}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              🔀 Shuffle
            </button>
          </div>
          <div className="flex gap-1.5 justify-center">
            {tiles.map(tile => (
              <ScrabbleTile
                key={tile.id}
                letter={tile.letter}
                points={tile.points}
                used={tile.used}
                onClick={() => placeTile(tile.id)}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 font-medium animate-shake -mt-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={clearSlots}
            disabled={filledCount === 0}
            className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
          <button
            onClick={submitWord}
            disabled={filledCount !== 4}
            className="px-6 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            Submit
          </button>
        </div>

        {/* Best word — always visible once any valid word submitted */}
        {submissions.length > 0 && (() => {
          const best = submissions.reduce((a, b) => b.score > a.score ? b : a);
          const isOptimal = best.score === optimalScore;
          return (
            <div className={`w-full rounded-2xl px-4 py-4 border ${isOptimal ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider text-center mb-3 ${isOptimal ? 'text-emerald-500 dark:text-emerald-400' : 'text-indigo-400 dark:text-indigo-500'}`}>
                {isOptimal ? '★ Best word — optimal!' : 'Best word so far'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {best.slots.map((t, j) => {
                    const mult = SLOT_MULTIPLIERS[j];
                    const label = MULTIPLIER_LABEL[mult];
                    return (
                      <div
                        key={j}
                        className="relative w-11 h-11 rounded-lg flex flex-col items-center justify-center text-lg font-extrabold text-amber-900"
                        style={{
                          background: 'linear-gradient(170deg, #fef9c3 0%, #fde68a 55%, #fbbf24 100%)',
                          border: '1px solid #d97706',
                          boxShadow: '0 3px 0 #92400e, 0 4px 6px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)',
                        }}
                      >
                        {t.letter}
                        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-700">{t.points}</span>
                        {label && (
                          <span className={`absolute top-0.5 left-1 text-[8px] font-extrabold leading-none ${MULTIPLIER_TEXT[mult]}`}>{label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${isOptimal ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>{best.score}</p>
                  <p className={`text-xs font-medium ${isOptimal ? 'text-emerald-400 dark:text-emerald-500' : 'text-indigo-400 dark:text-indigo-500'}`}>
                    / {optimalScore} pts max
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Show target score before first submission */}
        {submissions.length === 0 && optimalScore > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Best possible score today: <span className="font-bold text-gray-600 dark:text-gray-300">{optimalScore} pts</span>
          </p>
        )}

        {/* All attempts */}
        {submissions.length > 0 && (
          <div className="w-full space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">All attempts</p>
            {[...submissions].reverse().map((sub, i) => {
              const isBest = sub.score === bestScore;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                    isBest
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <span className={`font-mono font-extrabold text-base tracking-widest ${isBest ? 'text-indigo-800 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                    {sub.word}
                  </span>
                  <span className={`font-bold text-sm ${isBest ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isBest && '★ '}{sub.score} pts
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
