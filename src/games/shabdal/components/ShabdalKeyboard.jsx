import { HINDI_VOWELS, HINDI_CONSONANTS } from '../../../utils/hindiUtils.js';

const KEYBOARD_ROWS = [
  HINDI_VOWELS,
  HINDI_CONSONANTS.slice(0, 11),
  HINDI_CONSONANTS.slice(11, 22),
  ['ENTER', ...HINDI_CONSONANTS.slice(22), '⌫'],
];

const KEY_COLORS = {
  green:  'bg-green-500 text-white',
  orange: 'bg-orange-400 text-white',
  gray:   'bg-gray-400 dark:bg-gray-600 text-white opacity-50',
  unused: 'bg-orange-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
};

export default function ShabdalKeyboard({ letterStates = {}, onKey }) {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-2">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-0.5 sm:gap-1">
          {row.map((key) => {
            const state = letterStates[key] || 'unused';
            const colorClass = KEY_COLORS[state] ?? KEY_COLORS.unused;
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <button
                key={key}
                onMouseDown={(e) => { e.preventDefault(); onKey(key); }}
                onTouchStart={(e) => { e.preventDefault(); onKey(key); }}
                className={`
                  ${isWide ? 'px-1 min-w-[38px] sm:min-w-[46px] text-[10px]' : 'flex-1 max-w-[32px] text-sm sm:text-base'}
                  h-11 rounded font-bold flex items-center justify-center
                  transition-colors select-none touch-manipulation ${colorClass}
                `}
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
