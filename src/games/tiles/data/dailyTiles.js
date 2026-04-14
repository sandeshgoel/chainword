import { DAILY_TILES } from './tilesData.js';

export const LETTER_VALUES = {
  A:1, B:3, C:3, D:2, E:1, F:4, G:2, H:4, I:1, J:8, K:5, L:1, M:3,
  N:1, O:1, P:3, Q:10, R:1, S:1, T:1, U:1, V:4, W:4, X:8, Y:4, Z:10,
};

const BASE_EPOCH_DAY = 20555; // game #1 = 2026-04-12

export function getDailyTiles(overrideDateStr = null) {
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

  const idx = Math.min(gameNumber - 1, DAILY_TILES.length - 1);
  const letters = DAILY_TILES[idx];

  const tiles = letters.split('').map((letter, i) => ({
    id: i,
    letter,
    points: LETTER_VALUES[letter],
  }));

  return { tiles, dateStr, gameNumber };
}
