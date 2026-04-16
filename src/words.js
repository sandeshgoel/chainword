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

const BASE_EPOCH_DAY = 20555; // 2026-04-12

// Returns daily 4Word target for today (IST) or a specific override date.
export function getDaily4WordTarget(overrideDateStr = null) {
  let dateStr, epochDay;
  if (overrideDateStr) {
    dateStr = overrideDateStr;
    epochDay = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / (24 * 60 * 60 * 1000));
  } else {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(Date.now() + istOffset);
    epochDay = Math.floor(ist.getTime() / (24 * 60 * 60 * 1000));
    dateStr = ist.toISOString().split('T')[0];
  }

  const target = COMMON_WORDS[epochDay % COMMON_WORDS.length];
  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);
  return { target, dateStr, gameNumber };
}
