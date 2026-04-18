import { useState, useEffect } from 'react';
import { getDbStats } from '../utils/dbTracker.js';

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function DebugPage({ darkMode }) {
  const [snapshot, setSnapshot] = useState(() => getDbStats());

  useEffect(() => {
    const id = setInterval(() => setSnapshot(getDbStats()), 1000);
    return () => clearInterval(id);
  }, []);

  const { stats, startTime } = snapshot;
  const elapsed = Date.now() - startTime;

  // Sort rows: highest total ops first
  const rows = Object.entries(stats)
    .map(([path, { reads, writes }]) => ({ path, reads, writes, total: reads + writes }))
    .sort((a, b) => b.total - a.total);

  const totalReads  = rows.reduce((s, r) => s + r.reads,  0);
  const totalWrites = rows.reduce((s, r) => s + r.writes, 0);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-dvh bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 font-mono text-sm">
        <div className="max-w-xl mx-auto space-y-6">

          <div>
            <h1 className="text-xl font-bold tracking-tight">DB Tracker</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {new Date().toLocaleTimeString()} &mdash; Firestore ops since app start ({formatElapsed(elapsed)} ago)
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">No Firestore operations recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-2 font-semibold">Collection</th>
                    <th className="px-4 py-2 font-semibold text-right">Reads</th>
                    <th className="px-4 py-2 font-semibold text-right">Writes</th>
                    <th className="px-4 py-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ path, reads, writes, total }) => (
                    <tr
                      key={path}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400">{path}</td>
                      <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400">{reads}</td>
                      <td className="px-4 py-2 text-right text-amber-600 dark:text-amber-400">{writes}</td>
                      <td className="px-4 py-2 text-right font-semibold">{total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/80 font-bold">
                    <td className="px-4 py-2">TOTAL</td>
                    <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400">{totalReads}</td>
                    <td className="px-4 py-2 text-right text-amber-600 dark:text-amber-400">{totalWrites}</td>
                    <td className="px-4 py-2 text-right">{totalReads + totalWrites}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
