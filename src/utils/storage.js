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

export function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || 'null') || defaultStats();
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

export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (_) {}
}

export function updateStatsOnWin(stars, dateStr) {
  const stats = loadStats();
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
  const key = String(Math.min(extra, 3));
  stats.distribution[key] = (stats.distribution[key] || 0) + 1;

  saveStats(stats);
  return stats;
}

export function updateStatsOnGiveUp(dateStr) {
  const stats = loadStats();
  stats.played++;
  // streak broken if not already played today
  if (stats.lastPlayedDate !== dateStr) {
    stats.currentStreak = 0;
    stats.lastPlayedDate = dateStr;
  }
  saveStats(stats);
  return stats;
}

function getPreviousDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

// --- Theme ---

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
