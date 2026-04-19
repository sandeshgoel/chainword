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

