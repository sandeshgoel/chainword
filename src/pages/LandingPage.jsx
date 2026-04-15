import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { chainwordHistTier, wordleTier, tilesTier, squaresTier, TIER_CONFIG } from '../utils/awards.js';
import { getParStepsForDate } from '../games/chainword/data/dailyPairs.js';

const GAMES = [
  {
    id: 'chainword',
    route: '/chainword',
    emoji: '🔗',
    name: 'Chainword',
    desc: 'Link 4-letter words one step at a time',
    from: '#6366f1',
    to: '#4f46e5',
    shadow: '#3730a3',
    badge: 'Word Chain',
  },
  {
    id: '4word',
    route: '/4word',
    emoji: '🔤',
    name: '4word',
    desc: 'Guess the 4-letter word in 6 tries',
    from: '#10b981',
    to: '#059669',
    shadow: '#065f46',
    badge: 'Wordle',
  },
  {
    id: 'tiles',
    route: '/tiles',
    emoji: '🎯',
    name: 'Tiles',
    desc: 'Build the top scoring word from your rack',
    from: '#f59e0b',
    to: '#d97706',
    shadow: '#92400e',
    badge: 'Scrabble',
  },
  {
    id: 'squares',
    route: '/squares',
    emoji: '🔲',
    name: 'Squares',
    desc: 'Fill the corners to form valid words',
    from: '#ec4899',
    to: '#db2777',
    shadow: '#9d174d',
    badge: 'Logic',
  },
];

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

// Returns a tier string ('gold'|'silver'|'bronze'|'unsolved') for finished games,
// or 'started' | 'new'
function getGameStatus(gameId, dateStr) {
  try {
    if (gameId === 'chainword') {
      // Check easy stats first, then hard
      const stats = JSON.parse(localStorage.getItem('braingym_chainword_stats') || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return chainwordHistTier(entry.won, entry.guesses, entry.hintsUsed, getParStepsForDate(dateStr, false));
      const hardStats = JSON.parse(localStorage.getItem('braingym_chainword_hard_stats') || 'null');
      const hardEntry = hardStats?.history?.find(h => h.dateStr === dateStr);
      if (hardEntry) return chainwordHistTier(hardEntry.won, hardEntry.guesses, hardEntry.hintsUsed, getParStepsForDate(dateStr, true));
      // Not finished — check if in progress
      const all = JSON.parse(localStorage.getItem('chainword_progress') || '{}');
      if (all[dateStr]?.chain?.length > 1 || all[dateStr + '_hard']?.chain?.length > 1) return 'started';
    } else if (gameId === '4word') {
      const stats = JSON.parse(localStorage.getItem('braingym_wordle_stats') || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return wordleTier(entry.won, entry.guesses);
      const saved = JSON.parse(localStorage.getItem('chainword_wordle_' + dateStr) || 'null');
      if (saved?.guesses?.length > 0) return 'started';
    } else if (gameId === 'tiles') {
      const stats = JSON.parse(localStorage.getItem('braingym_tiles_stats') || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return tilesTier(entry.score, entry.optimalScore);
      const saved = JSON.parse(localStorage.getItem('chainword_tiles_' + dateStr) || 'null');
      if (saved?.submissions?.length > 0) return 'started';
    } else if (gameId === 'squares') {
      const stats = JSON.parse(localStorage.getItem('braingym_squares_stats') || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return squaresTier(entry.hintsUsed ?? 0);
      const saved = JSON.parse(localStorage.getItem('chainword_squares_' + dateStr) || 'null');
      if (saved?.attempts > 0) return 'started';
    }
  } catch {}
  return 'new';
}

const TIER_KEYS = new Set(['gold', 'silver', 'bronze', 'unsolved']);

function BrainGraphic() {
  return (
    <svg viewBox="0 0 120 100" className="w-32 h-28" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left hemisphere */}
      <path
        d="M60 78 C60 78 30 76 22 62 C14 48 18 34 26 26 C32 20 40 18 46 22 C46 22 44 14 52 12 C58 10 62 16 62 16"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-indigo-500 dark:text-indigo-400"
        fill="none"
      />
      {/* Right hemisphere */}
      <path
        d="M60 78 C60 78 90 76 98 62 C106 48 102 34 94 26 C88 20 80 18 74 22 C74 22 76 14 68 12 C62 10 58 16 58 16"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-indigo-500 dark:text-indigo-400"
        fill="none"
      />
      {/* Centre divider */}
      <path d="M60 16 C60 16 57 28 57 48 C57 62 60 78 60 78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400 dark:text-indigo-500" fill="none" />
      {/* Left folds */}
      <path d="M36 34 C40 30 46 32 46 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400 dark:text-indigo-500" fill="none" />
      <path d="M28 50 C34 44 42 48 40 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400 dark:text-indigo-500" fill="none" />
      <path d="M34 64 C40 60 48 63 46 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400 dark:text-indigo-500" fill="none" />
      {/* Right folds */}
      <path d="M84 34 C80 30 74 32 74 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400 dark:text-indigo-500" fill="none" />
      <path d="M92 50 C86 44 78 48 80 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400 dark:text-indigo-500" fill="none" />
      <path d="M86 64 C80 60 72 63 74 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400 dark:text-indigo-500" fill="none" />
      {/* Stem */}
      <path d="M54 78 L54 86 Q60 90 66 86 L66 78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 dark:text-indigo-400" fill="none" />
      {/* Sparkles */}
      <circle cx="100" cy="18" r="2" className="fill-amber-400" />
      <circle cx="108" cy="28" r="1.2" className="fill-amber-300" />
      <circle cx="96" cy="30" r="1" className="fill-amber-400" />
      <circle cx="20" cy="20" r="2" className="fill-pink-400" />
      <circle cx="13" cy="30" r="1.2" className="fill-pink-300" />
      <circle cx="24" cy="32" r="1" className="fill-pink-400" />
    </svg>
  );
}

function GameTile({ game, status, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left focus:outline-none"
      style={{ perspective: '800px' }}
    >
      <div
        className="relative rounded-2xl px-2.5 py-2.5 transition-all duration-300 ease-out"
        style={{
          background: `linear-gradient(135deg, ${game.from} 0%, ${game.to} 100%)`,
          boxShadow: `0 8px 0 ${game.shadow}, 0 12px 24px rgba(0,0,0,0.25)`,
          transform: 'rotateX(4deg)',
          transformStyle: 'preserve-3d',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'rotateX(0deg) translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 0 ${game.shadow}, 0 18px 32px rgba(0,0,0,0.3)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'rotateX(4deg)';
          e.currentTarget.style.boxShadow = `0 8px 0 ${game.shadow}, 0 12px 24px rgba(0,0,0,0.25)`;
        }}
        onMouseDown={e => {
          e.currentTarget.style.transform = 'rotateX(4deg) translateY(4px)';
          e.currentTarget.style.boxShadow = `0 4px 0 ${game.shadow}, 0 6px 12px rgba(0,0,0,0.2)`;
        }}
        onMouseUp={e => {
          e.currentTarget.style.transform = 'rotateX(0deg) translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 0 ${game.shadow}, 0 18px 32px rgba(0,0,0,0.3)`;
        }}
      >
        {/* Status indicator */}
        {TIER_KEYS.has(status) && (
          <div className="absolute top-3 right-5 text-xl leading-none">
            {TIER_CONFIG[status].emoji}
          </div>
        )}
        {status === 'started' && (
          <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-pulse" />
          </div>
        )}

        {/* Badge */}
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
          {game.badge}
        </span>

        {/* Emoji + Name */}
        <div className="flex items-center gap-2 mb-2 pr-8">
          <span className="text-3xl">{game.emoji}</span>
          <span className="text-xl font-black text-white tracking-tight">{game.name}</span>
        </div>

        {/* Description */}
        <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {game.desc}
        </p>

      </div>
    </button>
  );
}

export default function LandingPage({ darkMode, onToggleDark, onAuth, user }) {
  const navigate = useNavigate();
  const todayIST = useMemo(() => getTodayIST(), []);
  const statuses = useMemo(
    () => Object.fromEntries(GAMES.map(g => [g.id, getGameStatus(g.id, todayIST)])),
    [todayIST]
  );

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 000 14A7 7 0 0012 5z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <button
          onClick={onAuth}
          className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label={user ? 'Account' : 'Sign in'}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center pt-4 pb-8 px-4">
        <BrainGraphic />
        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mt-2">
          Brain <span className="text-indigo-600 dark:text-indigo-400">Gym</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daily word puzzles to flex your mind</p>
      </div>

      {/* Game tiles */}
      <div className="flex-1 px-4 pb-10 max-w-sm mx-auto w-full">
        <div className="grid grid-cols-2 gap-4">
          {GAMES.map(game => (
            <GameTile key={game.id} game={game} status={statuses[game.id]} onClick={() => navigate(game.route)} />
          ))}
        </div>
      </div>

    </div>
  );
}
