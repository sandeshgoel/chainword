import { formatDate } from '../utils/wordUtils.js';
import HamburgerMenu from './HamburgerMenu.jsx';

export default function Header({
  activeGame,
  onSelectGame,
  onHome,
  gameNumber,
  dateStr,
  darkMode,
  onToggleDark,
  onHowToPlay,
  onStats,
  onAuth,
  onFriends,
  user,
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
      {/* Left: menu + how to play */}
      <div className="flex items-center gap-1">
        <HamburgerMenu
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          onSelectGame={onSelectGame}
          activeGame={activeGame}
          onHome={onHome}
        />
        <button
          onClick={onHowToPlay}
          className="w-7 h-7 rounded-full border-2 border-gray-400 dark:border-gray-500 text-gray-400 dark:text-gray-500 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 flex items-center justify-center text-[11px] font-extrabold leading-none transition-colors"
          aria-label="How to play"
        >
          ?
        </button>
      </div>

      {/* Center: title (tapping goes home) */}
      <button onClick={onHome} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none hover:opacity-70 transition-opacity">
        <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {activeGame === '4word' ? '🔤 4word' : activeGame === 'tiles' ? '🎯 Tiles' : activeGame === 'squares' ? '🔲 Squares' : '🔗 Chainword'}
        </span>
        {(gameNumber || dateStr) && (
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
            {dateStr ? formatDate(dateStr) : ''}
            {gameNumber && dateStr ? '  •  ' : ''}
            {gameNumber ? `#${gameNumber}` : ''}
          </span>
        )}
      </button>

      {/* Right: controls */}
      <div className="flex items-center gap-1">
        {/* Friends */}
        <button
          onClick={onFriends}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Friends"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Stats */}
        <button
          onClick={onStats}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Statistics"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>

        {/* Auth */}
        <button
          onClick={onAuth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label={user ? 'Account' : 'Sign in'}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-6 h-6 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
