// Cumulative Firestore operation counters since app start.
// Each key is a collection path label (e.g. 'users', 'users/stats').

const _stats = {};
const _startTime = Date.now();

function _now() {
  const d = new Date();
  return `${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

function _bump(path, field) {
  if (!_stats[path]) _stats[path] = { reads: 0, writes: 0 };
  _stats[path][field]++;
}

export function trackRead(path) {
  console.log(`[${_now()}] Firestore read: ${path}`);
  _bump(path, 'reads');
}

export function trackWrite(path) {
  console.log(`[${_now()}] Firestore write: ${path}`);
  _bump(path, 'writes');
}

// Returns a snapshot of current stats plus the session start timestamp.
export function getDbStats() {
  const snapshot = {};
  for (const [path, counts] of Object.entries(_stats)) {
    snapshot[path] = { ...counts };
  }
  return { stats: snapshot, startTime: _startTime };
}
