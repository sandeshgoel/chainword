import { useState } from 'react';
import Modal from './Modal.jsx';

export default function StatsModal({ open, onClose, stats, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const { played, won, currentStreak, maxStreak, distribution } = stats;

  function handleReset() {
    if (!confirming) { setConfirming(true); return; }
    onReset();
    setConfirming(false);
    onClose();
  }
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

  const distKeys = [0, 1, 2, 3];
  const maxCount = Math.max(1, ...distKeys.map(k => distribution[k] || 0));

  const labels = {
    0: '⭐⭐⭐ Optimal',
    1: '⭐⭐ Great',
    2: '⭐ Good',
    3: 'Completed',
  };

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { value: played, label: 'Played' },
            { value: `${winRate}%`, label: 'Win Rate' },
            { value: currentStreak, label: 'Streak' },
            { value: maxStreak, label: 'Best' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Distribution */}
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
                      {count > 0 && (
                        <span className="text-xs font-bold text-white">{count}</span>
                      )}
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

        {/* Reset — for testing */}
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
      </div>
    </Modal>
  );
}
