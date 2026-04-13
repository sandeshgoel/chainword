import { PAIRS_5 } from './pairs_5.js';
import { PAIRS_6 } from './pairs_6.js';

// Returns today's pair based on IST date (UTC+5:30)
// Changes at midnight IST
export function getDailyInfo(hardMode = false) {
  const now = new Date();
  // Offset to IST: UTC+5:30 = 330 minutes
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split('T')[0]; // "YYYY-MM-DD"

  // Epoch day number (days since 1970-01-01 in IST)
  const epochDay = Math.floor(ist.getTime() / (24 * 60 * 60 * 1000));

  // Compute game number (1-indexed, starting from a base date)
  const BASE_EPOCH_DAY = 20555; // 2026-04-12 in IST roughly
  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);

  const pairs = hardMode ? PAIRS_6 : PAIRS_5;
  const chain = pairs[(gameNumber - 1) % pairs.length];
  const pair = { start: chain[0], end: chain[chain.length - 1] };
  return { pair, pairpath: chain, dateStr, gameNumber };
}
