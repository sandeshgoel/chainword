import Modal from './Modal.jsx';
import { GAME_DISPLAY_NAMES } from '../utils/cloudStats.js';

export default function StatsConflictModal({ open, conflictsByGame, onAccept, onDecline }) {
  const entries = Object.entries(conflictsByGame);

  return (
    <Modal open={open} onClose={onDecline} title="Stats Conflict Detected">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your local stats differ from your cloud stats for the following game(s):
        </p>

        <ul className="space-y-1">
          {entries.map(([gameKey, count]) => (
            <li key={gameKey} className="flex items-center justify-between text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {GAME_DISPLAY_NAMES[gameKey] || gameKey}
              </span>
              <span className="text-amber-700 dark:text-amber-400 text-xs">
                {count} date{count !== 1 ? 's' : ''} differ
              </span>
            </li>
          ))}
        </ul>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Continuing will keep your <strong>local stats</strong> for conflicting dates and merge in any cloud-only entries.
        </p>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onAccept}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Continue &amp; Keep Local Stats
          </button>
          <button
            onClick={onDecline}
            className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Cancel Sign-In
          </button>
        </div>
      </div>
    </Modal>
  );
}
