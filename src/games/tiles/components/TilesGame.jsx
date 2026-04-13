import { calcScore, SLOT_MULTIPLIERS } from '../hooks/useTiles.js';

const MULTIPLIER_LABEL = { 2: 'DL', 3: 'TL' };
const MULTIPLIER_COLOR = {
  2: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
  3: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
};

function ScrabbleTile({ letter, points, used, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={used}
      className={`relative w-12 h-12 rounded-lg text-xl font-extrabold flex items-center justify-center transition-all select-none
        ${used
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-2 border-gray-200 dark:border-gray-700 cursor-not-allowed'
          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 border-2 border-amber-300 dark:border-amber-600 shadow-sm hover:bg-amber-200 dark:hover:bg-amber-800 active:scale-95 cursor-pointer'
        }`}
    >
      {letter}
      {!used && (
        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-600 dark:text-amber-400">
          {points}
        </span>
      )}
    </button>
  );
}

function SlotCell({ tile, slotIndex, multiplier, onClick }) {
  const label = MULTIPLIER_LABEL[multiplier];
  const colorClass = MULTIPLIER_COLOR[multiplier];

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className={`relative w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-extrabold transition-all
          ${tile
            ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-300 dark:border-amber-600 text-amber-900 dark:text-amber-100 shadow-sm hover:bg-amber-200 active:scale-95 cursor-pointer'
            : 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-default'
          }`}
      >
        {tile ? (
          <>
            {tile.letter}
            <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-600 dark:text-amber-400">
              {tile.points}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-300 dark:text-gray-600 font-normal">{slotIndex + 1}</span>
        )}
      </button>
      {label ? (
        <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${colorClass}`}>{label}</span>
      ) : (
        <span className="text-[11px] text-transparent select-none">—</span>
      )}
    </div>
  );
}

export default function TilesGame({ game }) {
  const {
    tiles, slots, dateStr, gameNumber,
    error, submissions, bestScore,
    placeTile, removeFromSlot, clearSlots, submitWord,
  } = game;

  const filledCount = slots.filter(Boolean).length;
  const currentScore = calcScore(slots);
  const currentWord = slots.filter(Boolean).map(t => t.letter).join('');

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center gap-6 px-4 py-6 max-w-sm mx-auto w-full">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Tiles</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dateStr} &nbsp;•&nbsp; Puzzle #{gameNumber}
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
                slotIndex={i}
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
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Your tiles — tap to place</p>
          <div className="flex gap-2 flex-wrap justify-center">
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
          return (
            <div className="w-full rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 px-4 py-4">
              <p className="text-xs font-semibold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider text-center mb-3">Best word</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {best.slots.map((t, j) => {
                    const mult = SLOT_MULTIPLIERS[j];
                    const label = MULTIPLIER_LABEL[mult];
                    return (
                      <div key={j} className="flex flex-col items-center gap-1">
                        <div className="relative w-11 h-11 rounded-lg bg-amber-100 dark:bg-amber-900/60 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center text-lg font-extrabold text-amber-900 dark:text-amber-100">
                          {t.letter}
                          <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-600 dark:text-amber-400">{t.points}</span>
                        </div>
                        {label ? (
                          <span className={`text-[10px] font-extrabold px-1 rounded ${MULTIPLIER_COLOR[mult]}`}>{label}</span>
                        ) : (
                          <span className="text-[10px] text-transparent select-none">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{best.score}</p>
                  <p className="text-xs text-indigo-400 dark:text-indigo-500 font-medium">pts</p>
                </div>
              </div>
            </div>
          );
        })()}

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
