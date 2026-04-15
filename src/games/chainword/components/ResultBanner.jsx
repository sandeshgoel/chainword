import { getStars, getScoreLabel } from '../../../utils/wordUtils.js';

export default function ResultBanner({ status, userSteps, parSteps, hintsUsed, optimalPath, onShare }) {
  if (status === 'playing') return null;

  const gaveUp = status === 'gaveUp';
  const guesses = userSteps - 1;
  const stars = gaveUp ? 0 : getStars(userSteps + (hintsUsed || 0), parSteps);
  const label = gaveUp ? 'Better luck tomorrow!' : getScoreLabel(stars);

  return (
    <div className={[
      'rounded-2xl p-5 text-center space-y-3',
      gaveUp
        ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800',
    ].join(' ')}>
      <div className="text-3xl">
        {gaveUp ? '❌' : '⭐'.repeat(stars) + '☆'.repeat(3 - stars)}
      </div>
      <p className={`font-bold text-lg ${gaveUp ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
        {gaveUp ? 'Gave Up' : 'Well done!'} — {label}
      </p>
      {!gaveUp && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {guesses} guess{guesses !== 1 ? 'es' : ''}
          {hintsUsed > 0 && ` • 💡 ${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}`}
        </p>
      )}
      {gaveUp && optimalPath && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-1">Optimal solution ({optimalPath.length - 2} guess{optimalPath.length - 2 !== 1 ? 'es' : ''}):</p>
          <div className="flex flex-wrap justify-center gap-1">
            {optimalPath.map((w, i) => (
              <span key={i} className="font-mono font-bold text-sm">
                {w.toUpperCase()}{i < optimalPath.length - 1 ? ' →' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onShare}
        className="mt-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors"
      >
        Share Result
      </button>
    </div>
  );
}
