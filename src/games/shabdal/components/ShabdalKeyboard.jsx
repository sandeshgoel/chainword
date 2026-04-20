import { HINDI_CONSONANTS, HINDI_VOWELS } from '../../../utils/hindiUtils.js';

const KEYBOARD_ROWS = [
  HINDI_VOWELS,
  HINDI_CONSONANTS.slice(0, 10),
  HINDI_CONSONANTS.slice(10, 20),
  HINDI_CONSONANTS.slice(20, 29),
  ['ENTER', ...HINDI_CONSONANTS.slice(29), '⌫'],
];

// Traditional Hindi varga groupings
const GROUPS = [
  { keys: ['क','ख','ग','घ','ङ'],       cls: 'bg-indigo-100  dark:bg-indigo-900/50  text-indigo-900  dark:text-indigo-100'  },
  { keys: ['च','छ','ज','झ','ञ'],       cls: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100' },
  { keys: ['ट','ठ','ड','ढ','ण'],       cls: 'bg-teal-100    dark:bg-teal-900/50    text-teal-900    dark:text-teal-100'    },
  { keys: ['त','थ','द','ध','न'],       cls: 'bg-violet-100  dark:bg-violet-900/50  text-violet-900  dark:text-violet-100'  },
  { keys: ['प','फ','ब','भ','म'],       cls: 'bg-amber-100   dark:bg-amber-900/50   text-amber-900   dark:text-amber-100'   },
  { keys: ['य','र','ल','व'],           cls: 'bg-sky-100     dark:bg-sky-900/50     text-sky-900     dark:text-sky-100' },
  { keys: ['श','ष','स','ह'],           cls: 'bg-rose-100    dark:bg-rose-900/50    text-rose-900    dark:text-rose-100'    },
];

const GROUP_COLOR = {};
for (const { keys, cls } of GROUPS) {
  for (const k of keys) GROUP_COLOR[k] = cls;
}

const VOWEL_SET = new Set(HINDI_VOWELS);

const EVAL_COLORS = {
  green:  'bg-green-500 text-white',
  orange: 'bg-orange-400 text-white',
  gray:   'bg-gray-400 dark:bg-gray-600 text-white opacity-50',
};

export default function ShabdalKeyboard({ letterStates = {}, onKey, disableVowels = false }) {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-2">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-0.5 sm:gap-1">
          {row.map((key) => {
            const isVowel = VOWEL_SET.has(key);
            const disabled = isVowel && disableVowels;
            const state = letterStates[key];
            const colorClass = disabled
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
              : state
                ? (EVAL_COLORS[state] ?? GROUP_COLOR[key] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100')
                : (GROUP_COLOR[key] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100');
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <button
                key={key}
                onMouseDown={(e) => { e.preventDefault(); if (!disabled) onKey(key); }}
                disabled={disabled}
                className={`
                  ${isWide ? 'px-1 min-w-[38px] sm:min-w-[46px] text-[10px]' : 'flex-1 max-w-[32px] text-sm sm:text-base'}
                  h-11 rounded font-bold flex items-center justify-center
                  transition-colors select-none touch-manipulation ${colorClass}
                  ${disabled ? 'cursor-not-allowed' : ''}
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
