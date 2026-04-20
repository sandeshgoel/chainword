import { SHABDAL_WORDS } from '../../../commonWordsHindi.js';

export function getDailyWord(overrideDateStr = null) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  let now;
  if (overrideDateStr) {
    now = new Date(overrideDateStr + 'T00:00:00Z').getTime() - istOffset;
  } else {
    now = Date.now();
  }

  const nowIST = now + istOffset;
  const dateStr = new Date(nowIST).toISOString().split('T')[0];
  const todayISTStart = new Date(dateStr + 'T00:00:00Z').getTime();

  const epoch = new Date('2026-04-16T00:00:00Z').getTime();
  const dayIndex = Math.floor((todayISTStart - epoch) / 86400000);
  const safeIndex = Math.max(0, dayIndex);
  const gameNumber = safeIndex + 1;
  const target = SHABDAL_WORDS[safeIndex % SHABDAL_WORDS.length];

  return { target, dateStr, gameNumber };
}
