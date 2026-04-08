import { useState, useRef, useEffect } from 'react';

export default function WordInput({ onSubmit, currentWord, disabled, error, onClearError }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Auto-focus when not disabled
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleChange(e) {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 4);
    setValue(raw);
    if (error) onClearError();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!value || value.length !== 4) return;
    const ok = onSubmit(value);
    if (ok) setValue('');
  }

  // Show 4 letter boxes with the current input overlaid
  const letters = value.padEnd(4, ' ').split('');

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
      {/* Visual 4-tile display */}
      <div className="flex gap-1.5 mb-1">
        {letters.map((ch, i) => {
          const filled = ch !== ' ';
          const changed = filled && currentWord && currentWord[i] !== ch;
          return (
            <div
              key={i}
              className={[
                'w-11 h-11 flex items-center justify-center rounded-lg text-xl font-extrabold border-2 cursor-text transition-all duration-150',
                filled
                  ? changed
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : i === value.length
                    ? 'border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
              ].join(' ')}
              onClick={() => inputRef.current?.focus()}
            >
              {filled ? ch.toUpperCase() : ''}
            </div>
          );
        })}
      </div>

      {/* Hidden actual input (drives the tiles above) */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={4}
        className="sr-only"
        aria-label="Enter next word"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 font-medium animate-shake">
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={disabled || value.length !== 4}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 font-semibold rounded-xl transition-colors text-sm"
      >
        Submit
      </button>
    </form>
  );
}
