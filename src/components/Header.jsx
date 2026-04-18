import { useState, useRef, useEffect } from 'react';
import { formatDate } from '../utils/wordUtils.js';
import HamburgerMenu from './HamburgerMenu.jsx';
import { GAMES_META_BY_ID } from '../gamesMeta.js';

function ProfileDropdown({ user, onFriends, onSignOut, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
      {user?.displayName && (
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.displayName}</p>
        </div>
      )}
      <button
        onClick={() => { onClose(); onFriends(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Friends
      </button>
      <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
      <button
        onClick={() => { onClose(); onSignOut(); }}
        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign out
      </button>
    </div>
  );
}

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
  onSignOut,
  onFriends,
  user,
  userProfile,
  lastUser,
  signingIn,
  isAdmin,
  gamesConfig,
}) {
  const meta = GAMES_META_BY_ID[activeGame] ?? {};
  const gameTitle = gamesConfig?.[activeGame]?.title || activeGame;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e) {
      if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  // Avatar content (shared between signed-in and signed-out states)
  function AvatarImage({ photo, displayName, dim }) {
    return (
      <div className="relative">
        <img
          src={photo}
          alt={displayName}
          className={`w-6 h-6 rounded-full ${dim ? 'opacity-50 grayscale' : ''} ${userProfile?.paid && !dim ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''}`}
          referrerPolicy="no-referrer"
        />
        {userProfile?.admin && !dim && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center border border-white dark:border-gray-900">
            <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {dim && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center border border-white dark:border-gray-900">
            <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-40">
      {/* Left: menu + how to play */}
      <div className="flex items-center gap-1">
        <HamburgerMenu
          darkMode={darkMode}
          onToggleDark={onToggleDark}
          onSelectGame={onSelectGame}
          activeGame={activeGame}
          onHome={onHome}
          isAdmin={isAdmin}
          gamesConfig={gamesConfig}
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
          {meta.emoji?.startsWith('/')
            ? <><img src={meta.emoji} alt={meta.name} className="inline-block w-7 h-7 -mt-0.5 mr-1 rounded" />{gameTitle}</>
            : `${meta.emoji ?? ''} ${gameTitle}`.trim()}
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

        {/* Profile — spinner while signing in, dropdown when signed in, auth trigger when signed out */}
        <div className="relative" ref={dropdownRef}>
          {signingIn ? (
            <div className="p-2">
              <svg className="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          ) : user ? (
            // Signed in — avatar opens dropdown
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Account menu"
            >
              {user.photoURL
                ? <AvatarImage photo={user.photoURL} displayName={user.displayName} dim={false} />
                : <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
              }
            </button>
          ) : (
            // Signed out — tapping opens auth modal
            <button
              onClick={onAuth}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Sign in"
            >
              {lastUser?.photoURL
                ? <AvatarImage photo={lastUser.photoURL} displayName={lastUser.displayName} dim={true} />
                : <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
              }
            </button>
          )}

          {dropdownOpen && (
            <ProfileDropdown
              user={user}
              onFriends={onFriends}
              onSignOut={onSignOut}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
