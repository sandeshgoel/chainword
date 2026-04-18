import { firebaseConfigured } from '../firebase.js';
import { dbGet, dbSet, dbGetAll, dbDelete, dbTimestamp } from './db.js';
import {
  getGameHistory, setGameHistory,
  CHAINWORD_STATS_KEY, CHAINWORD_HARD_STATS_KEY, WORD4_STATS_KEY, TILES_STATS_KEY, SQUARES_STATS_KEY, SHABDAL_STATS_KEY, CRYPTIC_STATS_KEY,
} from './storage.js';
import {
  GAME_ID_CHAINWORD, GAME_ID_CHAINWORD_HARD, GAME_ID_WORD4, GAME_ID_TILES, GAME_ID_SQUARES, GAME_ID_SHABDAL, GAME_ID_CRYPTIC,
} from '../gamesMeta.js';

// Maps Firestore game key → localStorage key
export const CLOUD_TO_LOCAL = {
  [GAME_ID_CHAINWORD]:      CHAINWORD_STATS_KEY,
  [GAME_ID_CHAINWORD_HARD]: CHAINWORD_HARD_STATS_KEY,
  [GAME_ID_WORD4]:          WORD4_STATS_KEY,
  [GAME_ID_TILES]:          TILES_STATS_KEY,
  [GAME_ID_SQUARES]:        SQUARES_STATS_KEY,
  [GAME_ID_SHABDAL]:        SHABDAL_STATS_KEY,
  [GAME_ID_CRYPTIC]:        CRYPTIC_STATS_KEY,
};

export const CLOUD_GAME_KEYS = Object.keys(CLOUD_TO_LOCAL);

const statsPath = (uid, gameKey) => ['users', uid, 'stats', gameKey];

async function fetchCloudHistory(uid, gameKey) {
  const data = await dbGet(statsPath(uid, gameKey));
  return data ? (data.history || []) : [];
}

// Stable JSON comparison: sorts keys so insertion-order differences don't cause false conflicts.
function stableJson(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return JSON.stringify(obj);
  const sorted = {};
  Object.keys(obj).sort().forEach(k => { sorted[k] = obj[k]; });
  return JSON.stringify(sorted);
}

// Merge local + cloud histories. Cloud wins on conflicting dateStr;
// entries that only exist on one side are kept (no data is discarded).
// Returns { merged, conflicts: [{dateStr, local, cloud}] }
export function mergeHistories(localHistory, cloudHistory) {
  const localMap = new Map((localHistory || []).map(e => [e.dateStr, e]));
  const cloudMap = new Map((cloudHistory || []).map(e => [e.dateStr, e]));

  // Detect days where both sides have a result but they differ (value comparison, order-insensitive)
  const conflicts = [];
  for (const [dateStr, cloudEntry] of cloudMap) {
    const localEntry = localMap.get(dateStr);
    if (localEntry && stableJson(localEntry) !== stableJson(cloudEntry)) {
      conflicts.push({ dateStr, local: localEntry, cloud: cloudEntry });
    }
  }

  // Cloud wins on conflicts; unique local-only entries are preserved
  const allDates = new Set([...localMap.keys(), ...cloudMap.keys()]);
  const merged = Array.from(allDates).map(d => cloudMap.get(d) || localMap.get(d));
  merged.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  if (merged.length > 100) merged.length = 100;

  return { merged, conflicts };
}

// Compute what merging cloud into local would look like, without saving.
// Returns { mergeResult, conflictsByGame, cloudAddedCount }
// mergeResult[gameKey] = { localKey, localHistory, cloudHistory, merged, conflicts }
export async function computeMerge(uid) {
  if (!firebaseConfigured) return { mergeResult: {}, conflictsByGame: {}, cloudAddedCount: 0 };

  const mergeResult = {};
  const conflictsByGame = {};
  let cloudAddedCount = 0;

  await Promise.all(CLOUD_GAME_KEYS.map(async (gameKey) => {
    const localKey = CLOUD_TO_LOCAL[gameKey];
    const localHistory = getGameHistory(localKey);
    const cloudHistory = await fetchCloudHistory(uid, gameKey);
    const { merged, conflicts } = mergeHistories(localHistory, cloudHistory);
    mergeResult[gameKey] = { localKey, localHistory, cloudHistory, merged, conflicts };
    if (conflicts.length > 0) conflictsByGame[gameKey] = conflicts.length;
    // Count entries added from cloud that weren't in local
    cloudAddedCount += Math.max(0, merged.length - localHistory.length);
  }));

  return { mergeResult, conflictsByGame, cloudAddedCount };
}

// Apply computed merge: only write when data actually changed.
export async function applyMerge(uid, mergeResult) {
  if (!firebaseConfigured) return;
  await Promise.all(
    Object.entries(mergeResult).map(async ([gameKey, { localKey, localHistory, cloudHistory, merged }]) => {
      const mergedJson = JSON.stringify(merged);
      // Only update localStorage if merged differs from what was there
      if (mergedJson !== JSON.stringify(localHistory)) {
        setGameHistory(localKey, merged);
      }
      // Only push to cloud if merged differs from what cloud had
      if (mergedJson !== JSON.stringify(cloudHistory)) {
        await dbSet(statsPath(uid, gameKey), { history: merged, updatedAt: dbTimestamp() });
      }
    })
  );
}

// Push local history for one game to cloud (ongoing sync after game completion).
export async function pushCloudStats(uid, gameKey, history) {
  if (!firebaseConfigured) return;
  await dbSet(statsPath(uid, gameKey), { history, updatedAt: dbTimestamp() });
}

// Clear all cloud stats (called when user resets while signed in).
export async function clearAllCloudStats(uid) {
  if (!firebaseConfigured) return;
  await Promise.all(
    CLOUD_GAME_KEYS.map(gameKey =>
      dbSet(statsPath(uid, gameKey), { history: [], updatedAt: dbTimestamp() })
    )
  );
}

// Clear all cloud game progress (in-progress chains stored in users/{uid}/games/).
export async function clearAllCloudProgress(uid) {
  if (!firebaseConfigured) return;
  const docs = await dbGetAll(['users', uid, 'games']);
  await Promise.all(docs.map(d => dbDelete(['users', uid, 'games', d.id])));
}
