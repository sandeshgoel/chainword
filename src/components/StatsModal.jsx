import { useState } from 'react';
import Modal from './Modal.jsx';
import { GAME_ID_WORD4 } from '../gamesMeta.js';
import { getParStepsForDate } from '../games/chainword/data/dailyPairs.js';
import { computeStreaks } from '../utils/storage.js';
import { calcScoreFromWord } from '../games/tiles/hooks/useTiles.js';
import {
  chainwordTier, word4Tier, tilesTier, squaresTier, shabdalTier,
  TIER_CONFIG, TIER_GOLD, TIER_SILVER, TIER_BRONZE, TIER_UNSOLVED,
} from '../utils/awards.js';

function formatDate(dateStr) {
  // "2025-04-15" → "Apr 15, 2025"
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function HistoryTable({ history, isChainword, isWord4, isTiles, isSquares, isShabdal, hardMode }) {
  if (!history || history.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
        No history yet. Play some games first!
      </p>
    );
  }

  return (
    <div className="overflow-auto max-h-72 rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 sticky top-0">
            <th className="text-left px-3 py-2 font-semibold">Date</th>
            {isChainword && <>
              <th className="text-center px-2 py-2 font-semibold">Award</th>
              <th className="text-center px-2 py-2 font-semibold">Guesses</th>
              <th className="text-center px-2 py-2 font-semibold">Hints</th>
              <th className="text-center px-2 py-2 font-semibold">Result</th>
            </>}
            {isWord4 && <>
              <th className="text-center px-2 py-2 font-semibold">Award</th>
              <th className="text-center px-2 py-2 font-semibold">Guesses</th>
            </>}
            {isTiles && <>
              <th className="text-center px-2 py-2 font-semibold">Award</th>
              <th className="text-center px-2 py-2 font-semibold">Score</th>
              <th className="text-center px-2 py-2 font-semibold">Optimal</th>
            </>}
            {isSquares && <>
              <th className="text-center px-2 py-2 font-semibold">Award</th>
              <th className="text-center px-2 py-2 font-semibold">Hints Used</th>
            </>}
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => {
            const isArchive = h.playedDate && h.playedDate !== h.dateStr;
            const rowClass = i % 2 === 0
              ? 'bg-white dark:bg-gray-800'
              : 'bg-gray-50 dark:bg-gray-750';

            return (
              <tr key={h.dateStr} className={`${rowClass} border-t border-gray-100 dark:border-gray-700/50`}>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(h.dateStr)}
                  {isArchive && (
                    <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-medium">(archive)</span>
                  )}
                </td>

                {isChainword && (() => {
                  const parSteps = getParStepsForDate(h.dateStr, hardMode);
                  const tier = chainwordTier(h.won, h.guesses, h.hintsUsed, parSteps);
                  return (<>
                    <td className="text-center px-2 py-2 text-base">{TIER_CONFIG[tier].emoji}</td>
                    <td className="text-center px-2 py-2 text-gray-700 dark:text-gray-300">{h.guesses ?? '—'}</td>
                    <td className="text-center px-2 py-2 text-gray-700 dark:text-gray-300">{h.hintsUsed ?? 0}</td>
                    <td className="text-center px-2 py-2">
                      {h.won
                        ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">Won</span>
                        : <span className="text-red-500 font-medium">Lost</span>}
                    </td>
                  </>);
                })()}

                {isWord4 && (() => {
                  const tier = word4Tier(h.won, h.guesses);
                  return (<>
                    <td className="text-center px-2 py-2 text-base">{TIER_CONFIG[tier].emoji}</td>
                    <td className="text-center px-2 py-2 text-gray-700 dark:text-gray-300">
                      {h.won ? h.guesses : '—'}
                    </td>
                  </>);
                })()}

                {isTiles && (() => {
                  const bestScore = Math.max(0, ...(h.words ?? []).map(w => calcScoreFromWord(w)));
                  const isOptimal = bestScore >= h.optimalScore;
                  const tier = tilesTier(bestScore, h.optimalScore);
                  return (<>
                    <td className="text-center px-2 py-2 text-base">{TIER_CONFIG[tier].emoji}</td>
                    <td className={`text-center px-2 py-2 font-medium ${isOptimal ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {bestScore}
                    </td>
                    <td className="text-center px-2 py-2 text-gray-500 dark:text-gray-400">{h.optimalScore}</td>
                  </>);
                })()}

                {isSquares && (() => {
                  const hints = h.hintsUsed ?? 0;
                  const tier = squaresTier(hints);
                  return (<>
                    <td className="text-center px-2 py-2 text-base">{TIER_CONFIG[tier].emoji}</td>
                    <td className="text-center px-2 py-2 text-gray-700 dark:text-gray-300">{hints}</td>
                  </>);
                })()}

                {isShabdal && (() => {
                  const tier = shabdalTier(h.won, h.guesses);
                  return (<>
                    <td className="text-center px-2 py-2 text-base">{TIER_CONFIG[tier].emoji}</td>
                    <td className="text-center px-2 py-2 text-gray-700 dark:text-gray-300">
                      {h.won ? h.guesses : '—'}
                    </td>
                  </>);
                })()}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ResetButton({ onReset, onClose, gameName }) {
  const [confirming, setConfirming] = useState(false);
  function handleReset() {
    if (!confirming) { setConfirming(true); return; }
    onReset(); setConfirming(false); onClose();
  }
  return (
    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={handleReset}
        onBlur={() => setConfirming(false)}
        className={[
          'w-full py-2 rounded-xl text-xs font-medium transition-colors',
          confirming
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700'
            : 'text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50',
        ].join(' ')}
      >
        {confirming ? '⚠ Tap again to confirm reset' : `Reset ${gameName} stats`}
      </button>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function TilesStats({ stats }) {
  const history = stats.history || [];
  const played = history.length;
  const optimalAchieved = history.filter(h => h.score >= h.optimalScore).length;
  const { currentStreak, maxStreak } = computeStreaks(history, h => h.score >= h.optimalScore);
  const optimalRate = played > 0 ? Math.round((optimalAchieved / played) * 100) : 0;

  const recent = history.slice(0, 10);
  const maxOptimal = recent.length > 0 ? Math.max(...recent.map(h => h.optimalScore)) : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        <StatBox value={played} label="Played" />
        <StatBox value={`${optimalRate}%`} label="Optimal" />
        <StatBox value={currentStreak} label="Cur Streak" />
        <StatBox value={maxStreak} label="Best Streak" />
      </div>

      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent days</h3>
          <div className="space-y-2">
            {recent.map((h) => {
              const scorePct = Math.round((h.score / h.optimalScore) * 100);
              const barPct = Math.round((h.score / maxOptimal) * 100);
              return (
                <div key={h.dateStr} className="flex items-center gap-2 text-sm">
                  <span className="w-24 text-xs text-gray-500 dark:text-gray-400 shrink-0 tabular-nums">
                    {h.dateStr.slice(5)}
                    {h.score >= h.optimalScore && ' 🥇'}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${h.score >= h.optimalScore ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-indigo-500 dark:bg-indigo-400'}`}
                      style={{ width: `${Math.max(barPct, 10)}%` }}
                    >
                      <span className="text-xs font-bold text-white">{h.score}</span>
                    </div>
                  </div>
                  <span className="w-10 text-xs text-right text-gray-400 dark:text-gray-500 shrink-0">
                    {scorePct}%
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Bar shows score vs day's optimal. 🥇 = optimal achieved.
          </p>
        </div>
      )}

      {played === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          No games played yet. Try today's puzzle!
        </p>
      )}
    </div>
  );
}

function SquaresStats({ stats, hintsDistribution }) {
  const history = stats.history || [];
  const played = history.length;
  const won = history.filter(h => h.won).length;
  const { currentStreak, maxStreak } = computeStreaks(history, h => h.won);
  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
  const distKeys = [0, 1, 2, 3, 4];
  const maxCount = Math.max(1, ...distKeys.map(k => hintsDistribution[k] || 0));
  const labels = {
    0: '🥇 No hints',
    1: '🥈 1 hint',
    2: '🥉 2 hints',
    3: '3 hints',
    4: '4 hints',
  };
  const barColors = ['bg-yellow-400', 'bg-slate-400', 'bg-orange-400', 'bg-red-400', 'bg-red-400'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        <StatBox value={played} label="Played" />
        <StatBox value={`${winRate}%`} label="Win Rate" />
        <StatBox value={currentStreak} label="Cur Streak" />
        <StatBox value={maxStreak} label="Best Streak" />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Score Distribution</h3>
        <div className="space-y-2">
          {distKeys.map((k) => {
            const count = hintsDistribution[k] || 0;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={k} className="flex items-center gap-2 text-sm">
                <span className="w-28 text-gray-600 dark:text-gray-400 shrink-0">{labels[k]}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${barColors[k]}`}
                    style={{ width: `${Math.max(pct, count > 0 ? 10 : 0)}%` }}
                  >
                    {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {played === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          No games played yet. Start today's puzzle!
        </p>
      )}
    </div>
  );
}

export default function StatsModal({ open, onClose, stats, onReset, isWord4, isTiles, isSquares, isShabdal, hardMode }) {
  const [view, setView] = useState('stats');
  const isChainword = !isWord4 && !isTiles && !isSquares && !isShabdal;
  const gameName = isWord4 ? GAME_ID_WORD4 : isTiles ? 'Tiles' : isSquares ? 'Squares' : isShabdal ? 'शब्दल' : 'Chainword';
  const history = stats.history || [];
  const played = (isTiles || isSquares) ? 0 : history.length;
  const won = history.filter(h => h.won).length;
  const { currentStreak, maxStreak } = (isTiles || isSquares) ? { currentStreak: 0, maxStreak: 0 }
    : computeStreaks(history, h => h.won);

  const winRate = isChainword || isWord4 ? (played > 0 ? Math.round((won / played) * 100) : 0) : 0;

  // Chainword: compute tier distribution from history in real time
  const distribution = (() => {
    if (!isChainword) return null;
    const dist = { gold: 0, silver: 0, bronze: 0, unsolved: 0 };
    for (const h of (stats.history || [])) {
      const parSteps = getParStepsForDate(h.dateStr, hardMode);
      const tier = chainwordTier(h.won, h.guesses, h.hintsUsed, parSteps);
      dist[tier] = (dist[tier] || 0) + 1;
    }
    return dist;
  })();

  // 4word: compute distribution from history in real time
  const wordleDistribution = (() => {
    if (!isWord4) return null;
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const h of (stats.history || [])) {
      if (h.won && h.guesses >= 1 && h.guesses <= 6) dist[String(h.guesses)] = (dist[String(h.guesses)] || 0) + 1;
    }
    return dist;
  })();

  // Shabdal: compute distribution (same as 4word)
  const shabdalDistribution = (() => {
    if (!isShabdal) return null;
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const h of (stats.history || [])) {
      if (h.won && h.guesses >= 1 && h.guesses <= 6) dist[String(h.guesses)] = (dist[String(h.guesses)] || 0) + 1;
    }
    return dist;
  })();

  // Squares: compute hintsDistribution from history in real time (rendered inside SquaresStats)
  const squaresDistribution = (() => {
    if (!isSquares) return null;
    const dist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const h of (stats.history || [])) {
      const k = String(Math.min(h.hintsUsed ?? 0, 4));
      dist[k] = (dist[k] || 0) + 1;
    }
    return dist;
  })();

  const TIER_KEYS = [TIER_GOLD, TIER_SILVER, TIER_BRONZE, TIER_UNSOLVED];
  const distKeys = isWord4 ? [1, 2, 3, 4, 5, 6] : isShabdal ? [1, 2, 3, 4, 5, 6] : TIER_KEYS;
  const distData = isWord4 ? wordleDistribution : isShabdal ? shabdalDistribution : distribution;
  const maxCount = (isChainword || isWord4 || isShabdal) ? Math.max(1, ...distKeys.map(k => distData[k] || 0)) : 1;
  const distBarColor = isWord4 || isShabdal
    ? k => k <= 4 ? 'bg-yellow-400' : k === 5 ? 'bg-slate-400' : 'bg-orange-400'
    : k => ({ [TIER_GOLD]: 'bg-yellow-400', [TIER_SILVER]: 'bg-slate-400', [TIER_BRONZE]: 'bg-orange-400', [TIER_UNSOLVED]: 'bg-red-400' }[k]);
  const labels = isWord4 || isShabdal ? {
    1: '1 Guess', 2: '2 Guesses', 3: '3 Guesses',
    4: '4 Guesses', 5: '5 Guesses', 6: '6 Guesses',
  } : {
    [TIER_GOLD]:     `${TIER_CONFIG[TIER_GOLD].emoji} ${TIER_GOLD.toUpperCase()}`,
    [TIER_SILVER]:   `${TIER_CONFIG[TIER_SILVER].emoji} ${TIER_SILVER.toUpperCase()}`,
    [TIER_BRONZE]:   `${TIER_CONFIG[TIER_BRONZE].emoji} ${TIER_BRONZE.toUpperCase()}`,
    [TIER_UNSOLVED]: `${TIER_CONFIG[TIER_UNSOLVED].emoji} ${TIER_UNSOLVED.toUpperCase()}`,
  };

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <div className="space-y-6">

        {/* Tab toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 text-sm font-medium">
          {['stats', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`flex-1 py-1.5 capitalize transition-colors ${
                view === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'stats' ? 'Summary' : 'History'}
            </button>
          ))}
        </div>

        {view === 'history' ? (
          <HistoryTable
            history={history}
            isChainword={isChainword}
            isWord4={isWord4}
            isTiles={isTiles}
            isSquares={isSquares}
            isShabdal={isShabdal}
            hardMode={hardMode}
          />
        ) : (
          <>
            {!isWord4 && !isTiles && !isSquares && !isShabdal && (
              <div className="flex justify-center">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  hardMode
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {hardMode ? 'Hard Mode' : 'Easy Mode'}
                </span>
              </div>
            )}
            {isTiles ? (
              <TilesStats stats={stats} />
            ) : isSquares ? (
              <SquaresStats stats={stats} hintsDistribution={squaresDistribution} />
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { value: played, label: 'Played' },
                    { value: `${winRate}%`, label: 'Win Rate' },
                    { value: currentStreak, label: 'Cur Streak' },
                    { value: maxStreak, label: 'Best Streak' },
                  ].map(({ value, label }) => (
                    <StatBox key={label} value={value} label={label} />
                  ))}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Guess Distribution</h3>
                  <div className="space-y-2">
                    {distKeys.map((k) => {
                      const count = distData[k] || 0;
                      const pct = Math.round((count / maxCount) * 100);
                      return (
                        <div key={k} className="flex items-center gap-2 text-sm">
                          <span className="w-28 text-gray-600 dark:text-gray-400 shrink-0">{labels[k]}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 ${distBarColor(k)}`}
                              style={{ width: `${Math.max(pct, count > 0 ? 10 : 0)}%` }}
                            >
                              {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {played === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    No games played yet. Start today's puzzle!
                  </p>
                )}
              </>
            )}
          </>
        )}

        <ResetButton onReset={onReset} onClose={onClose} gameName={gameName} />
      </div>
    </Modal>
  );
}
