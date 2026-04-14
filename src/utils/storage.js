const PROGRESS_KEY = 'chainword_progress';
const STATS_KEY = 'chainword_stats';
const THEME_KEY = 'chainword_theme';

// --- Progress (per-day game state) ---

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveProgress(allProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  } catch (_) {}
}

export function getDateProgress(dateStr) {
  return loadProgress()[dateStr] || null;
}

export function saveDateProgress(dateStr, data) {
  const all = loadProgress();
  all[dateStr] = data;
  saveProgress(all);
}

// --- Statistics ---

export function loadStats(key = STATS_KEY) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || defaultStats();
  } catch {
    return defaultStats();
  }
}

function defaultStats() {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    // distribution: extra steps above par → count
    distribution: { 0: 0, 1: 0, 2: 0, 3: 0 },
    lastPlayedDate: null,
  };
}

export function saveStats(stats, key = STATS_KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (_) {}
}

export function updateStatsOnWin(stars, dateStr, key = STATS_KEY) {
  const stats = loadStats(key);
  stats.played++;
  stats.won++;

  // Maintain streak
  const yesterday = getPreviousDateStr(dateStr);
  if (stats.lastPlayedDate === yesterday) {
    stats.currentStreak++;
  } else if (stats.lastPlayedDate !== dateStr) {
    stats.currentStreak = 1;
  }
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastPlayedDate = dateStr;

  // Distribution: extra steps = 3 - stars (0 extra means 3 stars)
  const extra = Math.max(0, 3 - stars);
  const k = String(Math.min(extra, 3));
  stats.distribution[k] = (stats.distribution[k] || 0) + 1;

  saveStats(stats, key);
  return stats;
}

export function updateStatsOnGiveUp(dateStr, key = STATS_KEY) {
  const stats = loadStats(key);
  stats.played++;
  // streak broken if not already played today
  if (stats.lastPlayedDate !== dateStr) {
    stats.currentStreak = 0;
    stats.lastPlayedDate = dateStr;
  }
  saveStats(stats, key);
  return stats;
}

function getPreviousDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

// --- Wordle Statistics ---

const WORDLE_STATS_KEY = 'chainword_wordle_stats';

export function loadWordleStats() {
  try {
    return JSON.parse(localStorage.getItem(WORDLE_STATS_KEY) || 'null') || defaultWordleStats();
  } catch {
    return defaultWordleStats();
  }
}

function defaultWordleStats() {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    // distribution: 1 to 6 guesses
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    lastPlayedDate: null,
  };
}

export function saveWordleStats(stats) {
  try {
    localStorage.setItem(WORDLE_STATS_KEY, JSON.stringify(stats));
  } catch (_) {}
}

export function updateWordleStats(guessesCount, dateStr) {
  const stats = loadWordleStats();
  stats.played++;
  
  if (guessesCount > 0) {
    stats.won++;
    const yesterday = getPreviousDateStr(dateStr);
    if (stats.lastPlayedDate === yesterday) {
      stats.currentStreak++;
    } else if (stats.lastPlayedDate !== dateStr) {
      stats.currentStreak = 1;
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    
    // Add to distribution
    const key = String(guessesCount);
    stats.distribution[key] = (stats.distribution[key] || 0) + 1;
  } else {
    // broke streak
    stats.currentStreak = 0;
  }
  
  stats.lastPlayedDate = dateStr;
  saveWordleStats(stats);
  return stats;
}


// --- Tiles Statistics ---

const TILES_STATS_KEY = 'chainword_tiles_stats';

export function loadTilesStats() {
  try {
    return JSON.parse(localStorage.getItem(TILES_STATS_KEY) || 'null') || defaultTilesStats();
  } catch {
    return defaultTilesStats();
  }
}

function defaultTilesStats() {
  return {
    played: 0,
    optimalAchieved: 0,
    bestScore: 0,
    lastPlayedDate: null,
    // history: [{dateStr, score, optimalScore, isOptimal}], most recent first, capped at 30
    history: [],
  };
}

export function saveTilesStats(stats) {
  try {
    localStorage.setItem(TILES_STATS_KEY, JSON.stringify(stats));
  } catch (_) {}
}

// Called every time the user achieves a new best score for the day.
export function updateTilesStats(dateStr, score, optimalScore) {
  const stats = loadTilesStats();
  const isOptimal = score >= optimalScore;
  const existingIdx = stats.history.findIndex(h => h.dateStr === dateStr);

  if (existingIdx === -1) {
    // First submission today
    stats.played++;
    if (isOptimal) stats.optimalAchieved++;
    stats.history.unshift({ dateStr, score, optimalScore, isOptimal });
    if (stats.history.length > 30) stats.history.pop();
  } else {
    const prev = stats.history[existingIdx];
    // If newly achieved optimal this session, count it
    if (isOptimal && !prev.isOptimal) stats.optimalAchieved++;
    stats.history[existingIdx] = { dateStr, score, optimalScore, isOptimal };
  }

  stats.bestScore = Math.max(stats.bestScore, score);
  stats.lastPlayedDate = dateStr;
  saveTilesStats(stats);
  return stats;
}

// --- Squares Statistics ---

const SQUARES_STATS_KEY = 'chainword_squares_stats';

export function loadSquaresStats() {
  try {
    return JSON.parse(localStorage.getItem(SQUARES_STATS_KEY) || 'null') || defaultSquaresStats();
  } catch {
    return defaultSquaresStats();
  }
}

function defaultSquaresStats() {
  return {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    // hintsDistribution: hints used (0–4) → count
    hintsDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
    lastPlayedDate: null,
  };
}

export function saveSquaresStats(stats) {
  try {
    localStorage.setItem(SQUARES_STATS_KEY, JSON.stringify(stats));
  } catch (_) {}
}

export function updateSquaresStats(dateStr, hintsUsed) {
  const stats = loadSquaresStats();
  stats.played++;
  stats.won++;

  const yesterday = getPreviousDateStr(dateStr);
  if (stats.lastPlayedDate === yesterday) {
    stats.currentStreak++;
  } else if (stats.lastPlayedDate !== dateStr) {
    stats.currentStreak = 1;
  }
  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastPlayedDate = dateStr;

  const k = String(Math.min(hintsUsed, 4));
  stats.hintsDistribution[k] = (stats.hintsDistribution[k] || 0) + 1;

  saveSquaresStats(stats);
  return stats;
}

// --- Theme ---

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
