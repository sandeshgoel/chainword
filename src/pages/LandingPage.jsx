import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { chainwordHistTier, word4Tier as fourWordTier, tilesTier, squaresTier, TIER_CONFIG } from '../utils/awards.js';
import { getParStepsForDate } from '../games/chainword/data/dailyPairs.js';
import HamburgerMenu from '../components/HamburgerMenu.jsx';
import { GAMES_META, GAME_ID_CHAINWORD, GAME_ID_WORD4, GAME_ID_TILES, GAME_ID_SQUARES, GAME_ID_SHABDAL } from '../gamesMeta.js';
import {
  CHAINWORD_STATS_KEY, CHAINWORD_HARD_STATS_KEY,
  WORD4_STATS_KEY, TILES_STATS_KEY, SQUARES_STATS_KEY, SHABDAL_STATS_KEY,
  CHAINWORD_PROGRESS_PREFIX, CHAINWORD_HARD_PROGRESS_PREFIX, WORD4_PROGRESS_PREFIX, TILES_PROGRESS_PREFIX, SQUARES_PROGRESS_PREFIX, SHABDAL_PROGRESS_PREFIX,
} from '../utils/storage.js';

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

// Returns a tier string ('gold'|'silver'|'bronze'|'unsolved') for finished games,
// or 'started' | 'new'
function getGameStatus(gameId, dateStr) {
  try {
    if (gameId === GAME_ID_CHAINWORD) {
      // Check easy stats first, then hard
      const stats = JSON.parse(localStorage.getItem(CHAINWORD_STATS_KEY) || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return chainwordHistTier(entry.won, entry.guesses, entry.hintsUsed, getParStepsForDate(dateStr, false));
      const hardStats = JSON.parse(localStorage.getItem(CHAINWORD_HARD_STATS_KEY) || 'null');
      const hardEntry = hardStats?.history?.find(h => h.dateStr === dateStr);
      if (hardEntry) return chainwordHistTier(hardEntry.won, hardEntry.guesses, hardEntry.hintsUsed, getParStepsForDate(dateStr, true));
      // Not finished — check if in progress
      const data = JSON.parse(localStorage.getItem(CHAINWORD_PROGRESS_PREFIX + dateStr) || 'null');
      const hardData = JSON.parse(localStorage.getItem(CHAINWORD_HARD_PROGRESS_PREFIX + dateStr) || 'null');
      if (data?.chain?.length > 1 || hardData?.chain?.length > 1) return 'started';
    } else if (gameId === GAME_ID_WORD4) {
      const stats = JSON.parse(localStorage.getItem(WORD4_STATS_KEY) || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return fourWordTier(entry.won, entry.guesses);
      const saved = JSON.parse(localStorage.getItem(WORD4_PROGRESS_PREFIX + dateStr) || 'null');
      if (saved?.guesses?.length > 0) return 'started';
    } else if (gameId === GAME_ID_TILES) {
      const stats = JSON.parse(localStorage.getItem(TILES_STATS_KEY) || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return tilesTier(entry.score, entry.optimalScore);
      const saved = JSON.parse(localStorage.getItem(TILES_PROGRESS_PREFIX + dateStr) || 'null');
      if (saved?.submissions?.length > 0) return 'started';
    } else if (gameId === GAME_ID_SQUARES) {
      const stats = JSON.parse(localStorage.getItem(SQUARES_STATS_KEY) || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return squaresTier(entry.hintsUsed ?? 0);
      const saved = JSON.parse(localStorage.getItem(SQUARES_PROGRESS_PREFIX + dateStr) || 'null');
      if (saved?.attempts > 0) return 'started';
    } else if (gameId === GAME_ID_SHABDAL) {
      const stats = JSON.parse(localStorage.getItem(SHABDAL_STATS_KEY) || 'null');
      const entry = stats?.history?.find(h => h.dateStr === dateStr);
      if (entry) return fourWordTier(entry.won, entry.guesses);
      const saved = JSON.parse(localStorage.getItem(SHABDAL_PROGRESS_PREFIX + dateStr) || 'null');
      if (saved?.guesses?.length > 0) return 'started';
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

function GameTile({ game, status, onClick, isLocked, displayTitle, displayDesc }) {
  function handleClick() {
    if (isLocked) {
      toast('This game requires a premium account', { icon: '🔒' });
    } else {
      onClick();
    }
  }

  return (
    <button
      onClick={handleClick}
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
        {/* Vertical ribbon + lock for premium games */}
        {isLocked && (
          <div className="absolute top-0 right-4 z-10">
            <div
              className="w-7 bg-amber-400 flex flex-col items-center pt-2.5 shadow-lg"
              style={{ height: '52px', clipPath: 'polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)' }}
            >
              <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 7.5V5.5a4 4 0 018 0v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="1.5" y="7.5" width="12" height="9" rx="2.5" fill="white" fillOpacity="0.95"/>
                <circle cx="7.5" cy="12" r="1.6" fill="#d97706"/>
                <rect x="6.8" y="12" width="1.4" height="2.2" rx="0.7" fill="#d97706"/>
              </svg>
            </div>
          </div>
        )}

        {/* Status indicator */}
        {!isLocked && TIER_KEYS.has(status) && (
          <div className="absolute top-3 right-5 text-xl leading-none">
            {TIER_CONFIG[status].emoji}
          </div>
        )}
        {!isLocked && status === 'started' && (
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
          {game.emoji.startsWith('/') ? (
            <img src={game.emoji} alt={game.name} className="w-9 h-9 object-contain rounded" />
          ) : (
            <span className="text-3xl">{game.emoji}</span>
          )}
          <span className="text-xl font-black text-white tracking-tight">{displayTitle}</span>
        </div>

        {/* Description */}
        <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Times New Roman, Times, serif' }}>
          {displayDesc}
        </p>

      </div>
    </button>
  );
}

export default function LandingPage({ darkMode, onToggleDark, onAuth, user, userProfile, lastUser, signingIn, gamesConfig = {} }) {
  const navigate = useNavigate();
  const todayIST = useMemo(() => getTodayIST(), []);
  const statuses = useMemo(
    () => Object.fromEntries(GAMES_META.map(g => [g.id, getGameStatus(g.id, todayIST)])),
    [todayIST]
  );

  return (
    <div className="min-h-dvh bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <HamburgerMenu
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          onSelectGame={id => navigate('/' + id)}
          isAdmin={userProfile?.admin ?? false}
          buttonClassName="p-2 rounded-full hover:bg-white/60 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
        />

        {/* Right: auth */}
        <button
          onClick={onAuth}
          className="p-2 rounded-full hover:bg-white/60 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label={user ? 'Account' : 'Sign in'}
        >
          {signingIn ? (
            <svg className="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : user?.photoURL ? (
            <div className="relative">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className={`w-6 h-6 rounded-full ${userProfile?.paid ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''}`}
                referrerPolicy="no-referrer"
              />
              {userProfile?.admin && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center border border-white dark:border-gray-900">
                  <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ) : lastUser?.photoURL ? (
            <div className="relative">
              <img
                src={lastUser.photoURL}
                alt={lastUser.displayName}
                className="w-6 h-6 rounded-full opacity-50 grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center border border-white dark:border-gray-900">
                <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </div>
            </div>
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
      <div className="flex-1 px-4 pb-6 max-w-sm mx-auto w-full">
        <div className="grid grid-cols-2 gap-4">
          {GAMES_META.map(game => {
            const cfg = gamesConfig[game.id] || {};
            const isLocked = !!cfg.paid && !userProfile?.paid;
            return (
              <GameTile
                key={game.id}
                game={game}
                status={statuses[game.id]}
                onClick={() => navigate(game.route)}
                isLocked={isLocked}
                displayTitle={cfg.title ?? game.name}
                displayDesc={cfg.desc ?? game.desc}
              />
            );
          })}
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 pb-2">
          Brain Gym · Free daily word puzzles
        </p>
      </div>

    </div>
  );
}
