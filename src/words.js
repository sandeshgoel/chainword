// Common 4-letter English words — used as embedded fallback dictionary.
import { VALID_WORDS } from './validWords.js';
import { COMMON_WORDS } from './commonWords.js';

// Convert to Set for fast lookup
const wordSet = new Set([...VALID_WORDS, ...COMMON_WORDS]);

export function getWordSet() {
  return wordSet;
}

export function setWordSet(set) {
  // no-op or placeholder if any code relies on it
}

export async function loadWordList() {
  // Instantly return the pre-loaded static list and maintain the await signature
  return wordSet;
}

// Returns today's Wordle target word based on IST date (UTC+5:30)
// Uses the same epoch calculation as Chainword.
export function getDailyWordleTarget() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const epochDay = Math.floor(ist.getTime() / (24 * 60 * 60 * 1000));

  // Choose only from the common dictionary words
  const target = COMMON_WORDS[epochDay % COMMON_WORDS.length];

  const BASE_EPOCH_DAY = 20188; // 2025-04-01 in IST roughly as per dailyPairs.js
  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);
  const dateStr = ist.toISOString().split('T')[0];

  return { target, dateStr, gameNumber };
}
