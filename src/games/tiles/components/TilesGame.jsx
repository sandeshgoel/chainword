import { useState, useEffect, useRef } from 'react';
import { SLOT_MULTIPLIERS, calcScore, calcScoreFromWord } from '../hooks/useTiles.js';
import { LETTER_VALUES } from '../data/dailyTiles.js';
import { getWordSet } from '../../../words.js';
import ResultBanner from '../../../components/ResultBanner.jsx';
import Modal from '../../../components/Modal.jsx';
import { tilesTier, TIER_CONFIG } from '../../../utils/awards.js';
import { buildTilesShareText, shareOrCopy } from '../../../utils/sharing.js';

const MULTIPLIER_LABEL = { 2: 'DL', 3: 'TL' };
const MULTIPLIER_TEXT = {
  2: 'text-blue-500 dark:text-blue-400',
  3: 'text-red-500 dark:text-red-400',
};

function ScrabbleTile({ letter, points, used, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={used}
      className={`relative w-10 h-10 rounded-lg text-base font-extrabold flex items-center justify-center select-none transition-[transform,box-shadow]
        ${used
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
          : 'text-amber-900 cursor-pointer active:translate-y-[3px]'
        }`}
      style={used ? {} : {
        background: 'linear-gradient(170deg, #fef9c3 0%, #fde68a 55%, #fbbf24 100%)',
        border: '1px solid #d97706',
        boxShadow: '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)',
      }}
      onMouseDown={(e) => {
        if (!used) e.currentTarget.style.boxShadow = '0 1px 0 #92400e, 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)';
      }}
      onMouseUp={(e) => {
        if (!used) e.currentTarget.style.boxShadow = '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)';
      }}
      onMouseLeave={(e) => {
        if (!used) e.currentTarget.style.boxShadow = '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)';
      }}
    >
      {letter}
      {!used && (
        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-700">
          {points}
        </span>
      )}
    </button>
  );
}

function SlotCell({ tile, multiplier, onClick, exiting }) {
  const label = MULTIPLIER_LABEL[multiplier];

  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-11 rounded-xl flex flex-col items-center justify-center text-lg font-extrabold transition-all duration-500
        ${exiting ? 'opacity-0 scale-50 -translate-y-2' : 'opacity-100 scale-100 translate-y-0'}
        ${tile
          ? 'text-amber-900 cursor-pointer active:translate-y-[3px]'
          : 'border-2 border-dashed bg-white dark:bg-gray-800 cursor-default'
        } ${!tile && label === 'DL' ? 'border-blue-300 dark:border-blue-700'
          : !tile && label === 'TL' ? 'border-red-300 dark:border-red-700'
          : !tile ? 'border-gray-300 dark:border-gray-600' : ''}`}
      style={tile ? {
        background: 'linear-gradient(170deg, #fef9c3 0%, #fde68a 55%, #fbbf24 100%)',
        border: '1px solid #d97706',
        boxShadow: '0 4px 0 #92400e, 0 5px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.8)',
      } : {}}
    >
      {tile ? (
        <>
          {tile.letter}
          <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-700">
            {tile.points}
          </span>
          {label && (
            <span className={`absolute top-0.5 right-1 text-[8px] font-extrabold leading-none ${MULTIPLIER_TEXT[multiplier]}`}>{label}</span>
          )}
        </>
      ) : label ? (
        <span className={`text-xs font-extrabold tracking-wide ${MULTIPLIER_TEXT[multiplier]}`}>{label}</span>
      ) : null}
    </button>
  );
}

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function computeValidWords(tiles) {
  const ws = getWordSet();
  if (!ws) return [];
  const wordScores = new Map();
  const n = tiles.length;
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (b === a) continue;
      for (let c = 0; c < n; c++) {
        if (c === a || c === b) continue;
        for (let d = 0; d < n; d++) {
          if (d === a || d === b || d === c) continue;
            const word = (tiles[a].letter + tiles[b].letter + tiles[c].letter + tiles[d].letter).toLowerCase();
            if (ws.has(word)) {
              const score =
                tiles[a].points * SLOT_MULTIPLIERS[0] +
                tiles[b].points * SLOT_MULTIPLIERS[1] +
                tiles[c].points * SLOT_MULTIPLIERS[2] +
                tiles[d].points * SLOT_MULTIPLIERS[3];
              const current = wordScores.get(word) || 0;
              if (score > current) wordScores.set(word, score);
            }
        }
      }
    }
  }
  return Array.from(wordScores.entries()).map(([word, score]) => ({ word: word.toUpperCase(), score }));
}

export default function TilesGame({ game, onArchive, archiveDate }) {
  const {
    tiles, slots, dateStr, gameNumber,
    submissions, bestScore, optimalScore,
    placeTile, removeFromSlot, clearSlots, shuffleTiles,
    submitWord, clearSlotAt,
  } = game;

  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null); // { word, score }
  const [exitingSet, setExitingSet] = useState(new Set());
  const [showWordsModal, setShowWordsModal] = useState(false);
  const [wordsData, setWordsData] = useState(null);
  const isSubmittingRef = useRef(false);

  function handleShowWords() {
    setWordsData(computeValidWords(tiles));
    setShowWordsModal(true);
  }

  const filledCount = slots.filter(Boolean).length;
  const currentWord = slots.filter(Boolean).map(t => t.letter).join('');

  // Auto-submit when all 4 slots are filled with a valid word
  useEffect(() => {
    if (filledCount !== 4 || isSubmittingRef.current) return;

    const ws = getWordSet();
    if (!ws) return;
    const word = slots.map(t => t ? t.letter.toLowerCase() : '').join('');
    if (!ws.has(word)) return;

    isSubmittingRef.current = true;
    const score = calcScore(slots);
    const result = submitWord();
    if (!result) {
      isSubmittingRef.current = false;
      return;
    }

    const isDuplicate = result === 'duplicate';
    setToast({ word: word.toUpperCase(), score, duplicate: isDuplicate });

    // After 2 seconds, clear slots one tile at a time (right to left)
    setTimeout(async () => {
      for (let i = 3; i >= 0; i--) {
        setExitingSet(prev => new Set([...prev, i]));
        await new Promise(r => setTimeout(r, 600)); // wait for CSS transition
        clearSlotAt(i);
        setExitingSet(prev => {
          const next = new Set(prev);
          next.delete(i);
          return next;
        });
        await new Promise(r => setTimeout(r, 200)); // gap between tiles
      }
      setToast(null);
      isSubmittingRef.current = false;
    }, 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center gap-6 px-4 py-6 max-w-sm mx-auto w-full">

        {/* Header */}
        {/* Archive banner */}
        {archiveDate && archiveDate !== getTodayIST() && (
          <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
            <span className="text-amber-700 dark:text-amber-300 font-medium">Viewing past puzzle</span>
            <button onClick={onArchive} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">Change date</button>
          </div>
        )}

        {/* Template */}
        <div className="flex flex-col items-center gap-3 w-full">
          {optimalScore > 0 && (
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Best possible score: <span className="text-gray-500 dark:text-gray-400">{optimalScore} pts</span>
            </p>
          )}

          {/* Toast — shown prominently above slots when valid word submitted */}
          {toast && (
            toast.duplicate ? (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
                <span className="text-amber-600 dark:text-amber-400 text-lg">↩</span>
                <span className="text-base font-extrabold text-amber-700 dark:text-amber-300 tracking-wide">
                  {toast.word}
                </span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  — already played
                </span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                <span className="text-base font-extrabold text-green-700 dark:text-green-300 tracking-wide">
                  {toast.word}
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  — {toast.score} pts
                </span>
              </div>
            )
          )}

          <div className="flex gap-2.5">
            {slots.map((tile, i) => (
              <SlotCell
                key={i}
                tile={tile}
                multiplier={SLOT_MULTIPLIERS[i]}
                onClick={() => tile && !isSubmittingRef.current && removeFromSlot(i)}
                exiting={exitingSet.has(i)}
              />
            ))}
          </div>

          {/* Status lines below slots */}
          <div className="flex flex-col items-center gap-1">
            {/* Invalid word message */}
            {!toast && filledCount === 4 && (() => {
              const ws = getWordSet();
              const isValid = ws && ws.has(currentWord.toLowerCase());
              if (isValid) return null;
              return (
                <p className="text-sm font-bold text-red-500 dark:text-red-400">
                  {currentWord} — not a word
                </p>
              );
            })()}
            {/* Tap to remove + clear all — shown whenever any tile is placed and not submitting */}
            {!toast && filledCount > 0 && (
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Tap tile to remove
                </p>
                <button
                  onClick={clearSlots}
                  disabled={isSubmittingRef.current}
                  className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
        
        <hr></hr>
        
        {/* Tile rack */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex gap-1.5 justify-center">
            {tiles.map(tile => (
              <ScrabbleTile
                key={tile.id}
                letter={tile.letter}
                points={tile.points}
                used={tile.used}
                onClick={() => placeTile(tile.id)}
              />
            ))}
          </div>
          <div className="flex items-center justify-between w-full">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tap tile to place</p>
            <div className="flex items-center gap-1">
              <button
                onClick={handleShowWords}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ? Words
              </button>
              <button
                onClick={shuffleTiles}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                🔀 Shuffle
              </button>
            </div>
          </div>
        </div>

        {/* Result banner + best word — visible once any valid word submitted */}
        {submissions.length > 0 && (() => {
          const best = submissions.reduce((a, b) => calcScoreFromWord(b.word) > calcScoreFromWord(a.word) ? b : a);
          const bestWordScore = calcScoreFromWord(best.word);
          const isOptimal = bestWordScore === optimalScore;
          const tier = tilesTier(bestWordScore, optimalScore);
          const tierTitles = { gold: 'Optimal score!', silver: 'Great score!', bronze: 'Keep trying!' };
          const shareText = buildTilesShareText({ gameNumber, dateStr, bestScore: bestWordScore, optimalScore, bestWord: best.word });

          async function handleShare() {
            await shareOrCopy(shareText, () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }

          return (<>
            <ResultBanner
              tier={tier}
              title={tierTitles[tier]}
              details={`${bestWordScore} / ${optimalScore} pts`}
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

            {/* All attempts as tiles, sorted by score */}
            <div className="w-full space-y-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">All attempts</p>
              {[...submissions].sort((a, b) => calcScoreFromWord(b.word) - calcScoreFromWord(a.word)).map((sub, i) => {
                const subScore = calcScoreFromWord(sub.word);
                const isBest = subScore === bestScore;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                      isBest
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex gap-1.5">
                      {[...sub.word].map((letter, j) => {
                        const mult = SLOT_MULTIPLIERS[j];
                        const label = MULTIPLIER_LABEL[mult];
                        const points = LETTER_VALUES[letter];
                        return (
                          <div
                            key={j}
                            className="relative w-9 h-9 rounded-lg flex flex-col items-center justify-center text-sm font-extrabold text-amber-900"
                            style={{
                              background: 'linear-gradient(170deg, #fef9c3 0%, #fde68a 55%, #fbbf24 100%)',
                              border: '1px solid #d97706',
                              boxShadow: '0 3px 0 #92400e, 0 4px 6px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)',
                            }}
                          >
                            {letter}
                            <span className="absolute bottom-0.5 right-1 text-[9px] font-bold leading-none text-amber-700">{points}</span>
                            {label && (
                              <span className={`absolute top-0.5 left-1 text-[8px] font-extrabold leading-none ${MULTIPLIER_TEXT[mult]}`}>{label}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <span className={`font-bold text-sm ${isBest ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {subScore} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </>);
        })()}

        {/* Valid words modal */}
        <Modal open={showWordsModal} onClose={() => setShowWordsModal(false)} title="Valid Words">
          {wordsData && (() => {
            const histogram = {};
            wordsData.forEach(({ score }) => {
              histogram[score] = (histogram[score] || 0) + 1;
            });
            const scores = Object.keys(histogram).map(Number).sort((a, b) => a - b);
            const maxCount = Math.max(...Object.values(histogram), 1);
            return (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{wordsData.length}</span>
                  <span className="ml-1">valid {wordsData.length === 1 ? 'word' : 'words'} possible with your rack</span>
                </p>
                {wordsData.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Score distribution (best placement)</p>
                    {scores.map(score => (
                      <div key={score} className="flex items-center gap-2">
                        <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 w-12 text-right shrink-0">{score} pts</span>
                        <div className="flex-1 relative h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-indigo-500 dark:bg-indigo-600 rounded-full transition-all"
                            style={{ width: `${(histogram[score] / maxCount) * 100}%` }}
                          />
                          <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {histogram[score]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>

        {/* Archive button */}
        <button
          onClick={onArchive}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-2"
        >
          Archives &nbsp;📅
        </button>

      </div>
    </div>
  );
}
