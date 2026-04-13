export const LETTER_VALUES = {
  A:1, B:3, C:3, D:2, E:1, F:4, G:2, H:4, I:1, J:8, K:5, L:1, M:3,
  N:1, O:1, P:3, Q:10, R:1, S:1, T:1, U:1, V:4, W:4, X:8, Y:4, Z:10,
};

// Scrabble tile distribution (count per letter)
const DISTRIBUTION = {
  A:9, B:2, C:2, D:4, E:12, F:2, G:3, H:2, I:9, J:1, K:1, L:4, M:2,
  N:6, O:8, P:2, Q:1, R:6, S:4, T:6, U:4, V:2, W:2, X:1, Y:2, Z:1,
};

const FULL_BAG = Object.entries(DISTRIBUTION).flatMap(
  ([letter, count]) => Array(count).fill(letter)
);

// Simple seeded LCG random number generator
function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function getDailyTiles() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split('T')[0];
  const epochDay = Math.floor(ist.getTime() / (24 * 60 * 60 * 1000));
  const BASE_EPOCH_DAY = 20555;
  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);

  const rand = seededRand(epochDay * 31337 + 99991);
  const bag = [...FULL_BAG];

  // Fisher-Yates shuffle
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  const tiles = bag.slice(0, 7).map((letter, i) => ({
    id: i,
    letter,
    points: LETTER_VALUES[letter],
  }));

  return { tiles, dateStr, gameNumber };
}
