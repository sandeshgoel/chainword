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

// --- Tier constants ---

export const TIER_GOLD     = 'gold';
export const TIER_SILVER   = 'silver';
export const TIER_BRONZE   = 'bronze';
export const TIER_UNSOLVED = 'unsolved';

// --- Tier computations ---

export function chainwordTier(won, userSteps, hintsUsed, parSteps) {
  if (!won) return TIER_UNSOLVED;
  if (!parSteps) return TIER_BRONZE;
  const score = userSteps + 2 * hintsUsed;
  if (score <= parSteps) return TIER_GOLD;
  if (score === parSteps + 1) return TIER_SILVER;
  return TIER_BRONZE;
}

export function word4Tier(won, guessCount) {
  if (!won) return TIER_UNSOLVED;
  if (guessCount <= 4) return TIER_GOLD;
  if (guessCount === 5) return TIER_SILVER;
  return TIER_BRONZE;
}

export function shabdalTier(won, guessCount) {
  if (!won) return TIER_UNSOLVED;
  if (guessCount <= 4) return TIER_GOLD;
  if (guessCount === 5) return TIER_SILVER;
  return TIER_BRONZE;
}

export function tilesTier(userScore, optimalScore) {
  if (userScore >= optimalScore) return TIER_GOLD;
  if (optimalScore > 0 && userScore / optimalScore >= 0.5) return TIER_SILVER;
  return TIER_BRONZE;
}

export function squaresTier(hintsUsed) {
  if (hintsUsed === 0) return TIER_GOLD;
  if (hintsUsed === 1) return TIER_SILVER;
  return TIER_BRONZE;
}

// --- Display config ---


const TIER_EMOJI_GOLD = '🥇';
const TIER_EMOJI_SILVER = '🥈';
const TIER_EMOJI_BRONZE = '🥉';
const TIER_EMOJI_UNSOLVED = '😢';

export const TIER_CONFIG = {
  [TIER_GOLD]:     { emoji: TIER_EMOJI_GOLD, label: 'Gold',     bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' },
  [TIER_SILVER]:   { emoji: TIER_EMOJI_SILVER, label: 'Silver',   bg: 'bg-slate-100 dark:bg-slate-700/50',  border: 'border-slate-300 dark:border-slate-600',   text: 'text-slate-600 dark:text-slate-300'   },
  [TIER_BRONZE]:   { emoji: TIER_EMOJI_BRONZE, label: 'Bronze',   bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
  [TIER_UNSOLVED]: { emoji: TIER_EMOJI_UNSOLVED, label: 'Unsolved', bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800',       text: 'text-red-600 dark:text-red-40₀'       },
};
