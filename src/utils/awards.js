import { getWordSet } from '../words.js';

// Slot multipliers — single source of truth (useTiles.js and sharing.js import from here)
export { SLOT_MULTIPLIERS } from '../games/tiles/hooks/useTiles.js';

// Enumerate all valid 4-permutation scores for a given tile rack.
function allTilesScores(tiles) {
  const ws = getWordSet();
  if (!ws || !tiles || tiles.length < 4) return [];
  const scores = [];
  const n = tiles.length;
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (b === a) continue;
      for (let c = 0; c < n; c++) {
        if (c === a || c === b) continue;
        for (let d = 0; d < n; d++) {
          if (d === a || d === b || d === c) continue;
          const word = (
            tiles[a].letter + tiles[b].letter +
            tiles[c].letter + tiles[d].letter
          ).toLowerCase();
          if (ws.has(word)) {
            scores.push(
              tiles[a].points * SLOT_MULTIPLIERS[0] +
              tiles[b].points * SLOT_MULTIPLIERS[1] +
              tiles[c].points * SLOT_MULTIPLIERS[2] +
              tiles[d].points * SLOT_MULTIPLIERS[3]
            );
          }
        }
      }
    }
  }
  return scores;
}

export function tilesPercentile(userScore, tiles) {
  const scores = allTilesScores(tiles);
  if (scores.length === 0) return 0;
  return Math.round((scores.filter(s => s <= userScore).length / scores.length) * 100);
}

// --- Tier computations ---

// 'gold' | 'silver' | 'bronze' | 'unsolved'

export function chainwordTier(won, userSteps, hintsUsed, parSteps) {
  if (!won) return 'unsolved';
  if (!parSteps) return 'bronze';
  const score = userSteps + 2 * hintsUsed;
  if (score <= parSteps) return 'gold';
  if (score === parSteps + 1) return 'silver';
  return 'bronze';
}

// For history: use stored guesses (may differ from live userSteps by 1 in autoWin case)
export function chainwordHistTier(won, guesses, hintsUsed, parSteps) {
  if (!won) return 'unsolved';
  if (!parSteps) return 'bronze';
  const score = (guesses ?? 0) + 2 * (hintsUsed ?? 0);
  if (score <= parSteps) return 'gold';
  if (score === parSteps + 1) return 'silver';
  return 'bronze';
}

export function word4Tier(won, guessCount) {
  if (!won) return 'unsolved';
  if (guessCount <= 4) return 'gold';
  if (guessCount === 5) return 'silver';
  return 'bronze';
}

export function tilesTier(userScore, optimalScore) {
  if (userScore >= optimalScore) return 'gold';
  if (optimalScore > 0 && userScore / optimalScore >= 0.5) return 'silver';
  return 'bronze';
}

export function squaresTier(hintsUsed) {
  if (hintsUsed === 0) return 'gold';
  if (hintsUsed === 1) return 'silver';
  return 'bronze';
}

// --- Display config ---

export const TIER_CONFIG = {
  gold:     { emoji: '🥇', label: 'Gold',     bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
  silver:   { emoji: '🥈', label: 'Silver',   bg: 'bg-slate-100 dark:bg-slate-700/50',  border: 'border-slate-300 dark:border-slate-600',   text: 'text-slate-600 dark:text-slate-300'   },
  bronze:   { emoji: '🥉', label: 'Bronze',   bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
  unsolved: { emoji: '😢', label: 'Unsolved', bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800',       text: 'text-red-600 dark:text-red-400'       },
};
