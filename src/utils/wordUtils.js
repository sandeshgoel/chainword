const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// Returns true if two same-length words differ by exactly one letter
export function diffsByOneLetter(a, b) {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diffs++;
      if (diffs > 1) return false;
    }
  }
  return diffs === 1;
}

// BFS to find shortest word ladder from start to end using wordSet.
// Returns the full path (array of words including start and end),
// or null if no path exists.
export function bfs(start, end, wordSet) {
  if (!wordSet.has(start) || !wordSet.has(end)) return null;
  if (start === end) return [start];

  const queue = [[start, [start]]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const [current, path] = queue.shift();

    for (let i = 0; i < current.length; i++) {
      for (let c = 97; c <= 122; c++) { // 'a' to 'z'
        if (current.charCodeAt(i) === c) continue;
        const next =
          current.slice(0, i) + String.fromCharCode(c) + current.slice(i + 1);
        if (next === end) return [...path, next];
        if (wordSet.has(next) && !visited.has(next)) {
          visited.add(next);
          queue.push([next, [...path, next]]);
        }
      }
    }
  }
  return null; // No path found
}

// Returns how many positions differ between two same-length words
export function countDiffs(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }
  return d;
}

// Star rating based on extra steps beyond par
// 0 extra → 3 stars, 1 extra → 2 stars, 2 extra → 1 star, 3+ → 0 stars (but still complete)
export function getStars(userSteps, parSteps) {
  const extra = userSteps - parSteps;
  if (extra <= 0) return 3;
  if (extra === 1) return 2;
  if (extra === 2) return 1;
  return 0;
}

// Returns a score label string
export function getScoreLabel(stars) {
  switch (stars) {
    case 3: return 'Optimal!';
    case 2: return 'Great';
    case 1: return 'Good';
    default: return 'Completed';
  }
}
