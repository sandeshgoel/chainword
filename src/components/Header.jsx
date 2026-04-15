import { useState, useRef, useEffect } from 'react';
import { formatDate } from '../utils/wordUtils.js';
import Modal from './Modal.jsx';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
      {/* Left: menu + how to play */}
      <div className="flex items-center gap-1 relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onHowToPlay}
          className="w-7 h-7 rounded-full border-2 border-gray-400 dark:border-gray-500 text-gray-400 dark:text-gray-500 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 flex items-center justify-center text-[11px] font-extrabold leading-none transition-colors"
          aria-label="How to play"
        >
          ?
        </button>

        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
            <div className="py-2">
              <button
                onClick={() => { onHome(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <span className="text-xl flex-shrink-0">🏠</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Home</span>
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Games
              </div>
              <button
                onClick={() => { onSelectGame('chainword'); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${activeGame === 'chainword' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                <span className="text-xl flex-shrink-0">🔗</span>
                <div>
                  <div className={`text-sm font-medium ${activeGame === 'chainword' ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>Chainword</div>
                </div>
              </button>
              <button
                onClick={() => { onSelectGame('4word'); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${activeGame === '4word' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                <span className="text-xl flex-shrink-0">🔤</span>
                <div>
                  <div className={`text-sm font-medium ${activeGame === '4word' ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>4word</div>
                </div>
              </button>
              <button
                onClick={() => { onSelectGame('tiles'); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${activeGame === 'tiles' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                <span className="text-xl flex-shrink-0">🎯</span>
                <div>
                  <div className={`text-sm font-medium ${activeGame === 'tiles' ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>Tiles</div>
                </div>
              </button>
              <button
                onClick={() => { onSelectGame('squares'); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${activeGame === 'squares' ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                <span className="text-xl flex-shrink-0">🔲</span>
                <div>
                  <div className={`text-sm font-medium ${activeGame === 'squares' ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>Squares</div>
                </div>
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => { setShowAbout(true); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <span className="text-xl flex-shrink-0">ℹ️</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">About</span>
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => { onToggleDark(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 000 14A7 7 0 0012 5z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </span>
              </button>
            </div>
          </div>
        )}
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
      <Modal open={showAbout} onClose={() => setShowAbout(false)} title="About">
        <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Brain Gym is a growing suite of daily word puzzles. Chainword was our first.
          </p>
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500 dark:text-gray-400">Version</span>
            <span className="font-bold text-gray-900 dark:text-white">v1.0.0</span>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <a
            href="https://sites.google.com/view/chainword/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            <span>Blog</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://sites.google.com/view/chainword/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            <span>View License</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </Modal>
    </header>
  );
}
