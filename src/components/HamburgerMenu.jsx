import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { version } from '../../package.json';
import Modal from './Modal.jsx';
import { GAMES_META } from '../gamesMeta.js';

function getLocalDataKeys() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('braingym_'))
    .sort();
}

function clearLocalDataKeys(keys) {
  keys.forEach(k => localStorage.removeItem(k));
  sessionStorage.clear();
  window.location.reload();
}

export default function HamburgerMenu({ darkMode, onToggleDark, onSelectGame, activeGame, onHome, isAdmin, buttonClassName, gamesConfig }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [localKeys, setLocalKeys] = useState([]);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={buttonClassName || 'p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors'}
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
          <div className="py-2">
            {onHome && (
              <>
                <button
                  onClick={() => { onHome(); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <span className="text-xl flex-shrink-0">🏠</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Home</span>
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              </>
            )}
            {GAMES_META.map(g => (
              <button
                key={g.id}
                onClick={() => { onSelectGame(g.id); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${activeGame === g.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
              >
                {g.emoji.startsWith('/')
                  ? <img src={g.emoji} alt={g.id} className="w-6 h-6 rounded flex-shrink-0" />
                  : <span className="text-xl flex-shrink-0">{g.emoji}</span>}
                <span className={`text-sm font-medium ${activeGame === g.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>{gamesConfig?.[g.id]?.title || g.id}</span>
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            {isAdmin && (
              <button
                onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <span className="text-xl flex-shrink-0">🛠️</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Admin Dashboard</span>
              </button>
            )}
            <button
              onClick={() => { setLocalKeys(getLocalDataKeys()); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              <span className="text-sm font-medium text-red-500">Clear Local Data</span>
            </button>
            <button
              onClick={() => { navigate('/debug'); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Debug Screen</span>
            </button>
            <button
              onClick={() => { onToggleDark(); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
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
            <button
              onClick={() => { setShowAbout(true); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <span className="text-xl flex-shrink-0">ℹ️</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">About</span>
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
            <div className="px-4 py-2 text-center text-xs text-gray-400 dark:text-gray-600">
              v{version}
            </div>
          </div>
        </div>
      )}

      <Modal open={localKeys.length > 0} onClose={() => setLocalKeys([])} title="Clear Local Data">
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>The following keys will be permanently deleted. Cloud data (if signed in) will not be affected.</p>
          <ul className="max-h-48 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 text-xs font-mono">
            {localKeys.map(k => (
              <li key={k} className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{k}</li>
            ))}
          </ul>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => clearLocalDataKeys(localKeys)}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Clear All ({localKeys.length})
            </button>
            <button
              onClick={() => setLocalKeys([])}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showAbout} onClose={() => setShowAbout(false)} title="About">
        <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Brain Gym is a growing suite of daily word puzzles. Chainword was our first.
          </p>
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500 dark:text-gray-400">Version</span>
            <span className="font-bold text-gray-900 dark:text-white">v{version}</span>
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
    </div>
  );
}
