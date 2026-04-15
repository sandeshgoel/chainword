import { PAIRS_5 } from './pairs_5.js';
import { PAIRS_6 } from './pairs_6.js';

const BASE_EPOCH_DAY = 20555; // 2026-04-12

// Returns daily info for today (IST) or a specific override date.
export function getDailyInfo(hardMode = false, overrideDateStr = null) {
  let dateStr, epochDay;
  if (overrideDateStr) {
    dateStr = overrideDateStr;
    epochDay = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / (24 * 60 * 60 * 1000));
  } else {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(Date.now() + istOffset);
    dateStr = ist.toISOString().split('T')[0];
    epochDay = Math.floor(ist.getTime() / (24 * 60 * 60 * 1000));
  }

  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);
  const pairs = hardMode ? PAIRS_6 : PAIRS_5;
  const chain = pairs[(gameNumber - 1) % pairs.length];
  const pair = { start: chain[0], end: chain[chain.length - 1] };
  return { pair, pairpath: chain, dateStr, gameNumber };
}

export function getParStepsForDate(dateStr, hardMode = false) {
  const { pairpath } = getDailyInfo(hardMode, dateStr);
  return pairpath.length - 1;
}
