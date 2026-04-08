// Renders a single word as 4 letter tiles.
// prevWord: previous word in chain (to highlight changed letter)
// variant: 'start' | 'end' | 'step' | 'active'
export default function WordRow({ word, prevWord, variant = 'step', stepNumber }) {
  const letters = word.toUpperCase().split('');

  const baseCell = 'w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold select-none';

  function cellClass(i) {
    const changed = prevWord && prevWord[i] !== word[i];

    if (variant === 'start') {
      return `${baseCell} bg-indigo-600 text-white`;
    }
    if (variant === 'end') {
      return `${baseCell} bg-emerald-500 text-white`;
    }
    if (variant === 'active') {
      return `${baseCell} border-2 border-indigo-400 dark:border-indigo-500 text-gray-800 dark:text-gray-200 bg-indigo-50 dark:bg-indigo-900/30`;
    }
    // 'step': normal completed step
    if (changed) {
      return `${baseCell} bg-amber-400 dark:bg-amber-500 text-white`;
    }
    return `${baseCell} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Step number badge */}
      <div className="w-6 text-right">
        {stepNumber !== undefined && variant !== 'start' && variant !== 'end' && (
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {stepNumber}
          </span>
        )}
      </div>
      <div className="flex gap-1.5">
        {letters.map((letter, i) => (
          <div key={i} className={cellClass(i)}>
            {letter}
          </div>
        ))}
      </div>
      {/* Label */}
      <div className="text-xs text-gray-400 dark:text-gray-500 ml-1">
        {variant === 'start' && 'start'}
        {variant === 'end' && 'end'}
      </div>
    </div>
  );
}
