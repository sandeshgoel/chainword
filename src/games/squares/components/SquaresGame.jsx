import { formatDate } from '../../../utils/wordUtils.js';

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['⌫','Z','X','C','V','B','N','M','ENTER'],
];

function Keyboard({ onKey }) {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-2">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <button
                key={key}
                onMouseDown={(e) => { e.preventDefault(); onKey(key); }}
                className={`${isWide ? 'px-2 min-w-[46px]' : 'w-8'} h-12 rounded text-xs font-bold flex items-center justify-center transition-colors select-none touch-manipulation bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95`}
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

function GridCell({ letter, variant, cornerNum }) {
  // variant: 'letter' | 'letter-valid' | 'letter-invalid' |
  //          'corner-empty' | 'corner-cursor' | 'corner-typed' | 'corner-correct' | 'empty'
  const base = 'w-12 h-12 flex items-center justify-center text-lg font-extrabold rounded-lg border-2 transition-all duration-150 select-none';

  const styles = {
    letter:           'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    'letter-valid':   'border-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
    'letter-invalid': 'border-red-300 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    'corner-empty':   'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600',
    'corner-cursor':  'border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-800 shadow-sm',
    'corner-typed':   'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    'corner-correct': 'border-emerald-500 bg-emerald-500 text-white',
    empty:            'border-transparent bg-transparent',
  };

  let content;
  if (variant === 'corner-empty') {
    content = <span className="text-xs font-bold">{cornerNum}</span>;
  } else if (variant === 'corner-cursor') {
    content = <span className="w-0.5 h-5 bg-indigo-500 dark:bg-indigo-400 animate-pulse inline-block rounded" />;
  } else if (letter) {
    content = letter.toUpperCase();
  }

  return (
    <div className={`${base} ${styles[variant] || styles.empty}`}>
      {content}
    </div>
  );
}

function SquareGrid({ square, input, winLetters, feedback, status }) {
  const [top, left, right, bottom] = square;

  // Corner cell info: letter + variant
  function getCornerInfo(idx) {
    if (status === 'won') {
      return { letter: winLetters?.[idx] ?? '?', variant: 'corner-correct' };
    }
    if (feedback) return { letter: feedback.letters[idx], variant: 'corner-typed' };
    if (input.length > idx) return { letter: input[idx], variant: 'corner-typed' };
    if (input.length === idx) return { letter: null, variant: 'corner-cursor' };
    return { letter: null, variant: 'corner-empty' };
  }

  // Middle letter cells: colored by word validity when feedback is present
  function letterVariant(wordValid) {
    if (status === 'won') return 'letter-valid';
    if (feedback !== null) return wordValid ? 'letter-valid' : 'letter-invalid';
    return 'letter';
  }

  const tl = getCornerInfo(0);
  const tr = getCornerInfo(1);
  const bl = getCornerInfo(2);
  const br = getCornerInfo(3);

  const topV    = letterVariant(feedback?.topValid);
  const leftV   = letterVariant(feedback?.leftValid);
  const rightV  = letterVariant(feedback?.rightValid);
  const bottomV = letterVariant(feedback?.bottomValid);

  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Row 0 */}
      <GridCell letter={tl.letter} variant={tl.variant} cornerNum={1} />
      <GridCell letter={top[1]}    variant={topV} />
      <GridCell letter={top[2]}    variant={topV} />
      <GridCell letter={tr.letter} variant={tr.variant} cornerNum={2} />

      {/* Row 1 */}
      <GridCell letter={left[1]}  variant={leftV} />
      <GridCell variant="empty" />
      <GridCell variant="empty" />
      <GridCell letter={right[1]} variant={rightV} />

      {/* Row 2 */}
      <GridCell letter={left[2]}  variant={leftV} />
      <GridCell variant="empty" />
      <GridCell variant="empty" />
      <GridCell letter={right[2]} variant={rightV} />

      {/* Row 3 */}
      <GridCell letter={bl.letter} variant={bl.variant} cornerNum={3} />
      <GridCell letter={bottom[1]} variant={bottomV} />
      <GridCell letter={bottom[2]} variant={bottomV} />
      <GridCell letter={br.letter} variant={br.variant} cornerNum={4} />
    </div>
  );
}

// Small label showing which word each invalid edge spells out
function InvalidWords({ feedback }) {
  if (!feedback) return null;
  const invalid = [];
  if (!feedback.topValid)    invalid.push({ label: 'Top',    word: feedback.topWord });
  if (!feedback.leftValid)   invalid.push({ label: 'Left',   word: feedback.leftWord });
  if (!feedback.rightValid)  invalid.push({ label: 'Right',  word: feedback.rightWord });
  if (!feedback.bottomValid) invalid.push({ label: 'Bottom', word: feedback.bottomWord });
  if (invalid.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {invalid.map(({ label, word }) => (
        <span key={label} className="text-xs px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
          {label}: <span className="font-mono font-bold tracking-wider">{word.toUpperCase()}</span>
        </span>
      ))}
    </div>
  );
}

export default function SquaresGame({ game }) {
  const {
    square, dateStr, gameNumber,
    input, winLetters, attempts, feedback, status, error,
    addLetter, deleteLetter, submitGuess,
  } = game;

  const isPlaying = status === 'playing';
  const isWon = status === 'won';

  function handleKeyboardKey(key) {
    if (key === '⌫') deleteLetter();
    else if (key === 'ENTER') submitGuess();
    else addLetter(key);
  }

  return (
    <div className="h-full flex flex-col">

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 px-4 py-6 max-w-sm mx-auto w-full">

          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(dateStr)} &nbsp;•&nbsp; Daily Squares #{gameNumber}
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            Guess the <span className="font-semibold">4 corners</span> so all four edge words are valid.
            Order: <span className="font-semibold">①TL → ②TR → ③BL → ④BR</span>
          </p>

          <SquareGrid
            square={square}
            input={input}
            winLetters={winLetters}
            feedback={feedback}
            status={status}
          />

          {/* Invalid word badges after a wrong guess */}
          <InvalidWords feedback={feedback} />

          {feedback && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Red edges are not valid words. Type to try again.
            </p>
          )}

          {attempts > 0 && !isWon && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
            </p>
          )}

          {isWon && (
            <div className="w-full rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-4 text-center">
              <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                All words valid — you win!
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                Solved in {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
              </p>
            </div>
          )}

        </div>
      </div>

      {isPlaying && (
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 pt-2 pb-4">
          <div className="max-w-sm mx-auto">
            {error && (
              <p className="text-sm text-center text-red-500 dark:text-red-400 font-medium animate-shake mb-1">
                {error}
              </p>
            )}
            <Keyboard onKey={handleKeyboardKey} />
          </div>
        </div>
      )}

    </div>
  );
}
