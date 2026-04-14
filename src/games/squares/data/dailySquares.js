import { SQUARES } from '../../../../util/squares.js';

const BASE_EPOCH_DAY = 20555; // same base as other games

// Returns daily square for today (IST) or a specific override date.
export function getDailySquare(overrideDateStr = null) {
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

  // square = [top, left, right, bottom]
  // top[0] === left[0]  (TL corner)
  // top[3] === right[0] (TR corner)
  // bottom[0] === left[3] (BL corner)
  // bottom[3] === right[3] (BR corner)
  const square = SQUARES[(gameNumber - 1) % SQUARES.length];

  return { square, dateStr, gameNumber };
}
