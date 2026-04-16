const PROGRESS_KEY = 'chainword_progress';
const THEME_KEY    = 'chainword_theme';

const CHAINWORD_STATS_KEY      = 'braingym_chainword_stats';
const CHAINWORD_STATS_HARD_KEY = 'braingym_chainword_stats_hard';
const FOUR_WORD_STATS_KEY      = 'braingym_4word_stats';
const TILES_STATS_KEY          = 'braingym_tiles_stats';
const SQUARES_STATS_KEY        = 'braingym_squares_stats';
const SHABDAL_STATS_KEY        = 'braingym_shabdal_stats';

const HISTORY_LIMIT = 100;

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

// --- Progress (per-day game state) ---

export function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
  catch { return {}; }
}

export function saveProgress(all) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(all)); } catch (_) {}
}

export function getDateProgress(dateStr) { return loadProgress()[dateStr] || null; }

export function saveDateProgress(dateStr, data) {
  const all = loadProgress();
  all[dateStr] = data;
  saveProgress(all);
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

export { CHAINWORD_STATS_KEY, CHAINWORD_STATS_HARD_KEY };

// --- 4word ---

export function load4WordStats() {
  return { history: loadHistory(FOUR_WORD_STATS_KEY) };
}

export function update4WordStats(guessesCount, dateStr) {
  const { history } = load4WordStats();
  upsertHistory(history, { dateStr, guesses: guessesCount, won: guessesCount > 0, playedDate: getTodayIST() });
  saveHistory(FOUR_WORD_STATS_KEY, history);
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
