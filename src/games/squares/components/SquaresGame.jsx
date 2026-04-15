import { useEffect, useState } from 'react';
import { getWordSet } from '../../../words.js';
import { buildSquaresShareText, shareOrCopy } from '../../../utils/sharing.js';
import ResultBanner from '../../../components/ResultBanner.jsx';
import Modal from '../../../components/Modal.jsx';
import { squaresTier, TIER_CONFIG } from '../../../utils/awards.js';

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
  const base = 'relative w-12 h-12 flex items-center justify-center text-lg font-extrabold rounded-lg border-2 transition-all duration-150 select-none';

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
    content = null;
  } else if (variant === 'corner-cursor') {
    content = (
      <>
        {letter && (
          <span className="absolute text-lg font-extrabold text-indigo-300 dark:text-indigo-600 select-none">
            {letter.toUpperCase()}
          </span>
        )}
        <span className="relative w-0.5 h-5 bg-indigo-500 dark:bg-indigo-400 animate-pulse inline-block rounded" />
      </>
    );
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
    hintsUsed, hintedCorners,
    addLetter, deleteLetter, submitGuess, setCursorAt, useHint,
  } = game;

  const [confirmingHint, setConfirmingHint] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = buildSquaresShareText({ gameNumber, dateStr, hintedCorners, square });

  async function handleShare() {
    await shareOrCopy(shareText, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
    setConfirmingHint(false);
    if (key === '⌫') deleteLetter();
    else if (key === 'ENTER') submitGuess();
    else addLetter(key);
  }

  // Arrow-key navigation between corners:
  //   TL(0) ←→ TR(1)      BL(2) ←→ BR(3)
  //   TL(0) ↕  BL(2)      TR(1) ↕  BR(3)
  const ARROW_MOVE = {
    ArrowRight: [1, 3, 3, 3],   // from idx → target
    ArrowLeft:  [0, 0, 2, 2],
    ArrowDown:  [2, 3, 2, 3],
    ArrowUp:    [0, 1, 0, 1],
  };

  useEffect(() => {
    if (!isPlaying) return;
    function onKeyDown(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (ARROW_MOVE[e.key]) {
        e.preventDefault();
        setCursorAt(ARROW_MOVE[e.key][Math.min(cursorPos, 3)]);
      } else if (e.key === 'Backspace') { e.preventDefault(); deleteLetter(); }
      else if (e.key === 'Enter') { e.preventDefault(); submitGuess(); }
      else if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); addLetter(e.key.toUpperCase()); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, cursorPos, setCursorAt, addLetter, deleteLetter, submitGuess]);

  return (
    <div className="h-full flex flex-col">

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 px-4 py-6 max-w-sm mx-auto w-full">

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            Guess the <span className="font-semibold">4 corners</span> so all four edge words are valid.
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

          {isWon && (() => {
            const tier = squaresTier(hintsUsed);
            const cfg = TIER_CONFIG[tier];
            const [topW, leftW, rightW, bottomW] = square;
            const ce = (i) => hintedCorners[i] ? '🟥' : '🟩';
            const edgeLetter = (ch) => (
              <span className="text-gray-600 dark:text-gray-400 text-sm font-bold">{ch.toUpperCase()}</span>
            );
            const ResultGrid = () => (
              <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-center items-center justify-items-center font-mono leading-none">
                <span className="text-xl">{ce(0)}</span>
                {edgeLetter(topW[1])}
                {edgeLetter(topW[2])}
                <span className="text-xl">{ce(1)}</span>
                {edgeLetter(leftW[1])}
                <span /><span />
                {edgeLetter(rightW[1])}
                {edgeLetter(leftW[2])}
                <span /><span />
                {edgeLetter(rightW[2])}
                <span className="text-xl">{ce(2)}</span>
                {edgeLetter(bottomW[1])}
                {edgeLetter(bottomW[2])}
                <span className="text-xl">{ce(3)}</span>
              </div>
            );
            return (<>
              <ResultBanner
                tier={tier}
                title={hintsUsed === 0 ? 'No hints used!' : `${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''} used`}
              >
                {(!archiveDate || archiveDate === getTodayIST()) && (
                  <button
                    onClick={() => setShowShare(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Share Result
                  </button>
                )}
              </ResultBanner>

              <Modal open={showShare} onClose={() => setShowShare(false)} title="Share Your Result">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{cfg.emoji}</div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Squares #{gameNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hintsUsed === 0 ? 'No hints used!' : `${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''} used`}
                    </p>
                    <div className="flex justify-center pt-1"><ResultGrid /></div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 font-mono text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {shareText}
                  </div>
                  <button
                    onClick={handleShare}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    {copied ? 'Copied!' : 'Share Result'}
                  </button>
                </div>
              </Modal>
            </>);
          })()}

          {/* Hint + Submit + Archive */}
          {isPlaying && (
            <div className="flex flex-col items-center gap-2 w-full">
              {confirmingHint ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">Reveal this corner?</span>
                  <button
                    onClick={() => setConfirmingHint(false)}
                    className="px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { useHint(); setConfirmingHint(false); }}
                    className="px-2 py-1 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                  >
                    Reveal
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingHint(true)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    💡 Hint{hintsUsed > 0 ? ` (${hintsUsed})` : ''}
                  </button>
                  <button
                    onClick={submitGuess}
                    disabled={slots.some(s => !s)}
                    className="px-6 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onArchive}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2"
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
