import { useState } from 'react';
import Modal from './Modal.jsx';

function ResetButton({ onReset, onClose }) {
  const [confirming, setConfirming] = useState(false);
  function handleReset() {
    if (!confirming) { setConfirming(true); return; }
    onReset(); setConfirming(false); onClose();
  }
  return (
    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={handleReset}
        onBlur={() => setConfirming(false)}
        className={[
          'w-full py-2 rounded-xl text-xs font-medium transition-colors',
          confirming
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700'
            : 'text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50',
        ].join(' ')}
      >
        {confirming ? '⚠ Tap again to confirm reset' : 'Reset all game data'}
      </button>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function TilesStats({ stats }) {
  const { played, optimalAchieved, bestScore, history } = stats;
  const optimalRate = played > 0 ? Math.round((optimalAchieved / played) * 100) : 0;
  const avgScore = played > 0
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : 0;

  const recent = history.slice(0, 10);
  const maxScore = recent.length > 0 ? Math.max(...recent.map(h => h.optimalScore)) : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        <StatBox value={played} label="Played" />
        <StatBox value={`${optimalRate}%`} label="Optimal" />
        <StatBox value={bestScore} label="Best" />
        <StatBox value={avgScore || '—'} label="Avg" />
      </div>

      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent days</h3>
          <div className="space-y-2">
            {recent.map((h) => {
              const scorePct = Math.round((h.score / h.optimalScore) * 100);
              const barPct = Math.round((h.score / maxScore) * 100);
              return (
                <div key={h.dateStr} className="flex items-center gap-2 text-sm">
                  <span className="w-24 text-xs text-gray-500 dark:text-gray-400 shrink-0 tabular-nums">
                    {h.dateStr.slice(5)}
                    {h.isOptimal && ' ★'}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${h.isOptimal ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-indigo-500 dark:bg-indigo-400'}`}
                      style={{ width: `${Math.max(barPct, 10)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{h.score}</span>
                    </div>
                  </div>
                  <span className="w-10 text-xs text-right text-gray-400 dark:text-gray-500 shrink-0">
                    {scorePct}%
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Bar shows your score vs today's max. ★ = optimal achieved.
          </p>
        </div>
      )}

      {played === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          No games played yet. Try today's puzzle!
        </p>
      )}
    </div>
  );
}

export default function StatsModal({ open, onClose, stats, onReset, isWordle, isTiles }) {
  const { played, won, currentStreak, maxStreak, distribution } = isTiles ? {} : stats;

  const winRate = !isTiles && played > 0 ? Math.round((won / played) * 100) : 0;
  const distKeys = isWordle ? [1, 2, 3, 4, 5, 6] : [0, 1, 2, 3];
  const maxCount = !isTiles ? Math.max(1, ...distKeys.map(k => distribution[k] || 0)) : 1;
  const labels = isWordle ? {
    1: '1 Guess', 2: '2 Guesses', 3: '3 Guesses',
    4: '4 Guesses', 5: '5 Guesses', 6: '6 Guesses',
  } : {
    0: '⭐⭐⭐ Optimal', 1: '⭐⭐ Great', 2: '⭐ Good', 3: 'Completed',
  };

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="space-y-6">
        {isTiles ? (
          <TilesStats stats={stats} />
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { value: played, label: 'Played' },
                { value: `${winRate}%`, label: 'Win Rate' },
                { value: currentStreak, label: 'Streak' },
                { value: maxStreak, label: 'Best' },
              ].map(({ value, label }) => (
                <StatBox key={label} value={value} label={label} />
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Score Distribution</h3>
              <div className="space-y-2">
                {distKeys.map((k) => {
                  const count = distribution[k] || 0;
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={k} className="flex items-center gap-2 text-sm">
                      <span className="w-28 text-gray-600 dark:text-gray-400 shrink-0">{labels[k]}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(pct, count > 0 ? 10 : 0)}%` }}
                        >
                          {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {played === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                No games played yet. Start today's puzzle!
              </p>
            )}
          </>
        )}

        <ResetButton onReset={onReset} onClose={onClose} />
      </div>
    </Modal>
  );
}
