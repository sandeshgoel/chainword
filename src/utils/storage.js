// ── Single source of truth for all localStorage key names ──
// Every key starts with 'braingym_'.  Import these constants; never use raw strings.

// Global state
export const THEME_KEY      = 'braingym_theme';
export const HARD_MODE_KEY  = 'braingym_hard_mode';

// Auth / session (used in useAuth.js)
export const SESSION_ID_KEY = 'braingym_session_id';
export const LAST_USER_KEY  = 'braingym_last_user';

// Per-game stats history
export const CHAINWORD_STATS_KEY      = 'braingym_stats_chainword';
export const CHAINWORD_HARD_STATS_KEY = 'braingym_stats_chainword_hard';
export const WORD4_STATS_KEY          = 'braingym_stats_word4';
export const TILES_STATS_KEY          = 'braingym_stats_tiles';
export const SQUARES_STATS_KEY        = 'braingym_stats_squares';
export const SHABDAL_STATS_KEY        = 'braingym_stats_shabdal';
export const CRYPTIC_STATS_KEY        = 'braingym_stats_cryptic';

// Per-date game progress prefixes  (append YYYY-MM-DD)
export const CHAINWORD_PROGRESS_PREFIX = 'braingym_pg_chainword_';
export const CHAINWORD_HARD_PROGRESS_PREFIX = 'braingym_pg_chainword_hard_';
export const WORD4_PROGRESS_PREFIX     = 'braingym_pg_word4_';
export const TILES_PROGRESS_PREFIX     = 'braingym_pg_tiles_';
export const SQUARES_PROGRESS_PREFIX   = 'braingym_pg_squares_';
export const SHABDAL_PROGRESS_PREFIX   = 'braingym_pg_shabdal_';
export const CRYPTIC_PROGRESS_PREFIX   = 'braingym_pg_cryptic_';

// Convenience arrays for auth / reset flows
export const ALL_STAT_KEYS = [
  CHAINWORD_STATS_KEY,
  CHAINWORD_HARD_STATS_KEY,
  WORD4_STATS_KEY,
  TILES_STATS_KEY,
  SQUARES_STATS_KEY,
  SHABDAL_STATS_KEY,
  CRYPTIC_STATS_KEY,
];

export const ALL_PROGRESS_PREFIXES = [
  CHAINWORD_PROGRESS_PREFIX,
  CHAINWORD_HARD_PROGRESS_PREFIX,
  WORD4_PROGRESS_PREFIX,
  TILES_PROGRESS_PREFIX,
  SQUARES_PROGRESS_PREFIX,
  SHABDAL_PROGRESS_PREFIX,
  CRYPTIC_PROGRESS_PREFIX,
];

const HISTORY_LIMIT = 100;

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

// --- Chainword per-date progress ---
// progressKey is dateStr for easy mode, dateStr_hard for hard mode.

export function getDateProgress(progressKey) {
  try { return JSON.parse(localStorage.getItem(CHAINWORD_PROGRESS_PREFIX + progressKey) || 'null'); }
  catch { return null; }
}

export function saveDateProgress(progressKey, data) {
  try { localStorage.setItem(CHAINWORD_PROGRESS_PREFIX + progressKey, JSON.stringify(data)); } catch (_) {}
}

// --- Shared helpers ---

function upsertHistory(history, entry) {
  const idx = history.findIndex(h => h.dateStr === entry.dateStr);
  if (idx === -1) {
    history.unshift(entry);
    if (history.length > HISTORY_LIMIT) history.pop();
  } else {
    const existing = history[idx];
    // If the puzzle was originally played on time, don't demote it to archive via a later replay
    const keepPlayedDate = existing.playedDate === existing.dateStr && entry.playedDate !== entry.dateStr;
    history[idx] = keepPlayedDate ? { ...entry, playedDate: existing.playedDate } : entry;
  }
}

export function getPreviousDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

// Compute currentStreak and maxStreak from history (most recent first).
// isSuccessFn(entry) → bool
// Only entries played on their release day count toward streaks.
export function computeStreaks(history, isSuccessFn) {
  // Archive plays (playedDate !== dateStr) don't count; old entries without playedDate are assumed on-time.
  const eligible = history.filter(h => !h.playedDate || h.playedDate === h.dateStr);

  let currentStreak = 0;
  let maxStreak = 0;
  let runLen = 0;

  // maxStreak: scan full eligible history
  for (let i = 0; i < eligible.length; i++) {
    const ok = isSuccessFn(eligible[i]);
    const consecutive = i === 0 || eligible[i].dateStr === getPreviousDateStr(eligible[i - 1].dateStr);
    runLen = ok && consecutive ? runLen + 1 : ok ? 1 : 0;
    maxStreak = Math.max(maxStreak, runLen);
  }

  // currentStreak: run from most recent eligible entry backwards
  for (let i = 0; i < eligible.length; i++) {
    if (!isSuccessFn(eligible[i])) break;
    if (i > 0 && eligible[i].dateStr !== getPreviousDateStr(eligible[i - 1].dateStr)) break;
    currentStreak++;
  }

  return { currentStreak, maxStreak };
}

function loadHistory(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null')?.history || []; }
  catch { return []; }
}

function saveHistory(key, history) {
  try { localStorage.setItem(key, JSON.stringify({ history })); } catch (_) {}
}

// Generic accessors used by cloud sync
export function getGameHistory(key) { return loadHistory(key); }
export function setGameHistory(key, history) { saveHistory(key, history); }

// --- Chainword ---

export function loadStats(key = CHAINWORD_STATS_KEY) {
  return { history: loadHistory(key) };
}

export function saveStats({ history }, key = CHAINWORD_STATS_KEY) {
  saveHistory(key, history);
}

export function updateStatsOnWin(guesses, hintsUsed, dateStr, key = CHAINWORD_STATS_KEY) {
  const { history } = loadStats(key);
  upsertHistory(history, { dateStr, guesses, hintsUsed, won: true, playedDate: getTodayIST() });
  saveStats({ history }, key);
  return { history };
}

export function updateStatsOnGiveUp(guesses, hintsUsed, dateStr, key = CHAINWORD_STATS_KEY) {
  const { history } = loadStats(key);
  upsertHistory(history, { dateStr, guesses, hintsUsed, won: false, playedDate: getTodayIST() });
  saveStats({ history }, key);
  return { history };
}

// --- word4 ---

export function loadWord4Stats() {
  return { history: loadHistory(WORD4_STATS_KEY) };
}

export function updateWord4Stats(guessesCount, dateStr) {
  const { history } = loadWord4Stats();
  upsertHistory(history, { dateStr, guesses: guessesCount, won: guessesCount > 0, playedDate: getTodayIST() });
  saveHistory(WORD4_STATS_KEY, history);
  return { history };
}

// --- Tiles ---

export function loadTilesStats() {
  return { history: loadHistory(TILES_STATS_KEY) };
}

export function updateTilesStats(dateStr, score, optimalScore) {
  const { history } = loadTilesStats();
  upsertHistory(history, { dateStr, score, optimalScore, playedDate: getTodayIST() });
  saveHistory(TILES_STATS_KEY, history);
  return { history };
}

// --- Squares ---

export function loadSquaresStats() {
  return { history: loadHistory(SQUARES_STATS_KEY) };
}

export function updateSquaresStats(dateStr, hintsUsed) {
  const { history } = loadSquaresStats();
  upsertHistory(history, { dateStr, hintsUsed, won: true, playedDate: getTodayIST() });
  saveHistory(SQUARES_STATS_KEY, history);
  return { history };
}

// --- Shabdal ---

export function loadShabdalStats() {
  return { history: loadHistory(SHABDAL_STATS_KEY) };
}

export function updateShabdalStats(guessesCount, dateStr) {
  const { history } = loadShabdalStats();
  upsertHistory(history, { dateStr, guesses: guessesCount, won: guessesCount > 0, playedDate: getTodayIST() });
  saveHistory(SHABDAL_STATS_KEY, history);
  return { history };
}

// --- Theme ---

export function loadTheme() { return localStorage.getItem(THEME_KEY) || 'light'; }
export function saveTheme(theme) { localStorage.setItem(THEME_KEY, theme); }
