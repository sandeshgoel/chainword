// Renders a single word as 4 letter tiles.
// prevWord: previous word in chain (to highlight changed letter)
// endWord: target end word (to highlight letters already in the right position)
// variant: 'start' | 'end' | 'step' | 'active'
export default function WordRow({ word, prevWord, variant = 'step', stepNumber, endWord }) {
  const letters = word.toUpperCase().split('');

  const baseCell = 'w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold select-none';

  function cellClass(i) {
    const changed = prevWord && prevWord[i] !== word[i];
    const matchesEnd = endWord && word[i].toLowerCase() === endWord[i];

    if (variant === 'start') {
      return `${baseCell} bg-indigo-600 text-white`;
    }
    if (variant === 'end') {
      return `${baseCell} bg-emerald-500 text-white`;
    }
    if (variant === 'active') {
      return `${baseCell} border-2 border-indigo-400 dark:border-indigo-500 text-gray-800 dark:text-gray-200 bg-indigo-50 dark:bg-indigo-900/30`;
    }
    // 'step': match end word position → green; else changed → amber; else gray
    if (matchesEnd) {
      return `${baseCell} bg-emerald-500 dark:bg-emerald-600 text-white`;
    }
    if (changed) {
      return `${baseCell} bg-amber-400 dark:bg-amber-500 text-white`;
    }
    return `${baseCell} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`;
  }

  return (
    <div className="relative flex justify-center items-center">
      {stepNumber !== undefined && variant !== 'start' && variant !== 'end' && (
        <span className="absolute left-0 text-xs font-medium text-gray-400 dark:text-gray-500">
          {stepNumber}
        </span>
      )}
      <div className="flex gap-1.5">
        {letters.map((letter, i) => (
          <div key={i} className={cellClass(i)}>
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}
