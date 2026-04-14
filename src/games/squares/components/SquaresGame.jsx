import { formatDate } from '../../../utils/wordUtils.js';
import { getWordSet } from '../../../words.js';

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
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

function GridCell({ letter, variant, cornerNum, onClick }) {
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
    <div
      className={`${base} ${styles[variant] || styles.empty} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      onClick={onClick}
    >
      {content}
    </div>
  );
}

function SquareGrid({ square, slots, cursorPos, winLetters, feedback, status, liveValidity, onCornerClick }) {
  const [top, left, right, bottom] = square;

  // Corner cell info: letter + variant
  function getCornerInfo(idx) {
    if (status === 'won') {
      return { letter: winLetters?.[idx] ?? '?', variant: 'corner-correct' };
    }
    if (feedback) return { letter: feedback.letters[idx], variant: 'corner-typed' };
    if (slots[idx]) return { letter: slots[idx], variant: cursorPos === idx ? 'corner-cursor' : 'corner-typed' };
    if (cursorPos === idx) return { letter: null, variant: 'corner-cursor' };
    return { letter: null, variant: 'corner-empty' };
  }

  // Middle letter cells: post-submit feedback → live typing check → neutral
  function letterVariant(feedbackValid, liveKey) {
    if (status === 'won') return 'letter-valid';
    if (feedback !== null) return feedbackValid ? 'letter-valid' : 'letter-invalid';
    const live = liveValidity?.[liveKey];
    if (live === true)  return 'letter-valid';
    if (live === false) return 'letter-invalid';
    return 'letter';
  }

  const tl = getCornerInfo(0);
  const tr = getCornerInfo(1);
  const bl = getCornerInfo(2);
  const br = getCornerInfo(3);

  const topV    = letterVariant(feedback?.topValid,    'top');
  const leftV   = letterVariant(feedback?.leftValid,   'left');
  const rightV  = letterVariant(feedback?.rightValid,  'right');
  const bottomV = letterVariant(feedback?.bottomValid, 'bottom');

  const cornerClick = (idx) => onCornerClick ? () => onCornerClick(idx) : undefined;

  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Row 0 */}
      <GridCell letter={tl.letter} variant={tl.variant} cornerNum={1} onClick={cornerClick(0)} />
      <GridCell letter={top[1]}    variant={topV} />
      <GridCell letter={top[2]}    variant={topV} />
      <GridCell letter={tr.letter} variant={tr.variant} cornerNum={2} onClick={cornerClick(1)} />

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
      <GridCell letter={bl.letter} variant={bl.variant} cornerNum={3} onClick={cornerClick(2)} />
      <GridCell letter={bottom[1]} variant={bottomV} />
      <GridCell letter={bottom[2]} variant={bottomV} />
      <GridCell letter={br.letter} variant={br.variant} cornerNum={4} onClick={cornerClick(3)} />
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

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

export default function SquaresGame({ game, onArchive, archiveDate }) {
  const {
    square, dateStr, gameNumber,
    slots, cursorPos, winLetters, attempts, feedback, status, error,
    addLetter, deleteLetter, submitGuess, setCursorAt,
  } = game;

  const isPlaying = status === 'playing';
  const isWon = status === 'won';
  const [top, left, right, bottom] = square;

  // Compute live word validity as the user types each corner
  const liveValidity = (() => {
    if (!isPlaying || feedback !== null) return null;
    const ws = getWordSet();
    if (!ws || slots.every(s => !s)) return null;
    const [tl, tr, bl, br] = slots;
    const result = {};
    if (tl && tr) result.top    = ws.has(tl + top[1]    + top[2]    + tr);
    if (tl && bl) result.left   = ws.has(tl + left[1]   + left[2]   + bl);
    if (tr && br) result.right  = ws.has(tr + right[1]  + right[2]  + br);
    if (bl && br) result.bottom = ws.has(bl + bottom[1] + bottom[2] + br);
    return result;
  })();

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
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {formatDate(dateStr)} &nbsp;•&nbsp; Daily Squares #{gameNumber}
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            Guess the <span className="font-semibold">4 corners</span> so all four edge words are valid.
            Order: <span className="font-semibold">①TL → ②TR → ③BL → ④BR</span>
          </p>

          {/* Archive banner */}
          {archiveDate && archiveDate !== getTodayIST() && (
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
              <span className="text-amber-700 dark:text-amber-300 font-medium">Viewing past puzzle</span>
              <button onClick={onArchive} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">Change date</button>
            </div>
          )}

          <SquareGrid
            square={square}
            slots={slots}
            cursorPos={cursorPos}
            winLetters={winLetters}
            feedback={feedback}
            status={status}
            liveValidity={liveValidity}
            onCornerClick={isPlaying ? setCursorAt : null}
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

          {/* Archive button */}
          <button
            onClick={onArchive}
            className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2"
          >
            Archives &nbsp;📅
          </button>

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
