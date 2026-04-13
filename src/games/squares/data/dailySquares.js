import { SQUARES } from '../../../../util/squares.js';

// Returns today's square based on IST date (UTC+5:30)
// Changes at midnight IST
export function getDailySquare() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split('T')[0]; // "YYYY-MM-DD"

  const epochDay = Math.floor(ist.getTime() / (24 * 60 * 60 * 1000));
  const BASE_EPOCH_DAY = 20555; // same base as other games
  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);

  // square = [top, left, right, bottom]
  // top[0] === left[0]  (TL corner)
  // top[3] === right[0] (TR corner)
  // bottom[0] === left[3] (BL corner)
  // bottom[3] === right[3] (BR corner)
  const square = SQUARES[(gameNumber - 1) % SQUARES.length];

  return { square, dateStr, gameNumber };
}
