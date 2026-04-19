import { COMMON_WORDS } from '../../../commonWords.js';

const BASE_EPOCH_DAY = 20555; // 2026-04-12

export function getDailyWord4Target(overrideDateStr = null) {
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

  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);
  const target = COMMON_WORDS[(gameNumber - 1) % COMMON_WORDS.length];

  return { target, dateStr, gameNumber };
}
