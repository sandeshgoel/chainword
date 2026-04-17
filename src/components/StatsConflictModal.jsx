import Modal from './Modal.jsx';
import { GAME_DISPLAY_NAMES } from '../utils/cloudStats.js';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

const FIELD_LABELS = {
  won:          'Result',
  guesses:      'Guesses',
  hintsUsed:    'Hints used',
  score:        'Score',
  optimalScore: 'Max score',
  playedDate:   'Played on',
};

function formatValue(val) {
  if (val === true)  return 'Won';
  if (val === false) return 'Lost';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return formatDate(val);
  return val == null ? '—' : String(val);
}

// Returns only the keys (excluding dateStr) where local and cloud differ.
// Uses JSON.stringify per-value which is fine at the leaf level (primitives).
function diffKeys(local, cloud) {
  return Object.keys({ ...local, ...cloud }).filter(
    k => k !== 'dateStr' && JSON.stringify(local?.[k]) !== JSON.stringify(cloud?.[k])
  );
}

// Guard: if diffKeys finds nothing (e.g. only key-order differed), skip this conflict row.
function hasVisibleDiff(local, cloud) {
  return diffKeys(local, cloud).length > 0;
}

export default function StatsConflictModal({ open, mergeResult, onAccept, onDecline }) {
  const gamesWithConflicts = Object.entries(mergeResult || {})
    .filter(([, v]) => v.conflicts?.length > 0)
    .map(([gameKey, { conflicts }]) => ({ gameKey, conflicts }));

  const totalConflicts = gamesWithConflicts.reduce((n, g) => n + g.conflicts.length, 0);

  return (
    <Modal open={open} onClose={onDecline} title="Stats Conflict">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {totalConflicts === 1
            ? 'One date has different results in your local stats vs the cloud.'
            : `${totalConflicts} dates have different results in your local stats vs the cloud.`}
          {' '}Cloud stats will overwrite local for the conflicting dates.
        </p>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {gamesWithConflicts.map(({ gameKey, conflicts }) => (
            <div key={gameKey}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                {GAME_DISPLAY_NAMES[gameKey] || gameKey}
              </p>
              <div className="space-y-1">
                {conflicts.filter(({ local, cloud }) => hasVisibleDiff(local, cloud)).map(({ dateStr, local, cloud }) => {
                  const keys = diffKeys(local, cloud);
                  return (
                    <div key={dateStr} className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 space-y-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300">{formatDate(dateStr)}</p>
                      {keys.map(k => (
                        <div key={k} className="flex items-center gap-1.5">
                          <span className="text-gray-400 dark:text-gray-500 w-20 shrink-0">
                            {FIELD_LABELS[k] ?? k}:
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 line-through">{formatValue(local?.[k])}</span>
                          <span className="text-gray-400 dark:text-gray-500">→</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{formatValue(cloud?.[k])}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onAccept}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Use Cloud Stats
          </button>
          <button
            onClick={onDecline}
            className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Sign Out (keep local stats unchanged)
          </button>
        </div>
      </div>
    </Modal>
  );
}
