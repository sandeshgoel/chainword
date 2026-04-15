import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header.jsx';
import Game from './games/chainword/components/Game.jsx';
import WordleGame from './games/wordle/components/WordleGame.jsx';
import TilesGame from './games/tiles/components/TilesGame.jsx';
import SquaresGame from './games/squares/components/SquaresGame.jsx';
import HowToPlay from './games/chainword/components/HowToPlay.jsx';
import StatsModal from './components/StatsModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import FriendsModal from './components/FriendsModal.jsx';
import ArchiveModal from './components/ArchiveModal.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useGame } from './games/chainword/hooks/useGame.js';
import { useWordle } from './games/wordle/hooks/useWordle.js';
import { useTiles } from './games/tiles/hooks/useTiles.js';
import { useSquares } from './games/squares/hooks/useSquares.js';
import { loadTheme, saveTheme } from './utils/storage.js';
import { loadWordList } from './words.js';

function getTodayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function msUntilMidnightIST() {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = Date.now() + istOffset;
  const nextMidnightIST = (Math.floor(nowIST / 86400000) + 1) * 86400000;
  return nextMidnightIST - nowIST;
}

function pathToGame(pathname) {
  if (pathname.startsWith('/chainword')) return 'chainword';
  if (pathname.startsWith('/4word')) return '4word';
  if (pathname.startsWith('/tiles')) return 'tiles';
  if (pathname.startsWith('/squares')) return 'squares';
  return null;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeGame = pathToGame(location.pathname);

  const [darkMode, setDarkMode] = useState(() => loadTheme() === 'dark');
  const [hardMode, setHardMode] = useState(() => localStorage.getItem('chainword_hard_mode') === 'true');
  const [wordListReady, setWordListReady] = useState(false);

  // Per-game archive date overrides (null = today)
  const [archiveDates, setArchiveDates] = useState({
    chainword: null, '4word': null, tiles: null, squares: null,
  });

  // Modals
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const { user, signInWithGoogle, signOut } = useAuth();
  const game = useGame(user, wordListReady, hardMode, archiveDates.chainword);
  const wordle = useWordle(wordListReady, archiveDates['4word']);
  const tiles = useTiles(archiveDates.tiles);
  const squares = useSquares(archiveDates.squares);

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveTheme(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load word list on mount
  useEffect(() => {
    loadWordList().then(() => setWordListReady(true));
  }, []);

  // Show how-to-play on very first visit
  useEffect(() => {
    const seen = localStorage.getItem('chainword_seen_help');
    if (!seen) {
      setShowHelp(true);
      localStorage.setItem('chainword_seen_help', '1');
    }
  }, []);

  // Reload when the IST day rolls over (handles long-open tabs)
  useEffect(() => {
    const startDate = getTodayIST();

    function checkAndReload() {
      if (getTodayIST() !== startDate) window.location.reload();
    }

    const midnightTimeout = setTimeout(() => window.location.reload(), msUntilMidnightIST());
    const minuteInterval = setInterval(checkAndReload, 30 * 60_000);
    document.addEventListener('visibilitychange', checkAndReload);

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(minuteInterval);
      document.removeEventListener('visibilitychange', checkAndReload);
    };
  }, []);

  // Reload when a new build is deployed
  useEffect(() => {
    const currentScripts = [...document.querySelectorAll('script[src]')]
      .map(s => s.getAttribute('src'))
      .sort()
      .join(',');

    async function checkForNewVersion() {
      try {
        const res = await fetch('/?_v=' + Date.now(), { cache: 'no-store' });
        const html = await res.text();
        const srcs = [...html.matchAll(/src="([^"]*\.js[^"]*)"/g)]
          .map(m => m[1])
          .sort()
          .join(',');
        if (srcs && srcs !== currentScripts) window.location.reload();
      } catch {}
    }

    const interval = setInterval(checkForNewVersion, 30 * 60_000);
    document.addEventListener('visibilitychange', checkForNewVersion);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', checkForNewVersion);
    };
  }, []);

  function handleArchiveSelect(dateStr) {
    setArchiveDates(prev => ({ ...prev, [activeGame]: dateStr }));
    setShowArchive(false);
  }

  function handleReset() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('chainword'))
      .forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }

  // Landing page — no header/modals chrome
  if (activeGame === null) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Toaster position="top-center" />
        <LandingPage
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onAuth={() => setShowAuth(true)}
          user={user}
        />
        <AuthModal
          open={showAuth}
          onClose={() => setShowAuth(false)}
          user={user}
          onSignIn={signInWithGoogle}
          onSignOut={signOut}
        />
        <Analytics />
      </div>
    );
  }

  // Game pages
  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Toaster position="top-center" />

      <Header
        activeGame={activeGame}
        onSelectGame={g => navigate('/' + g)}
        onHome={() => navigate('/')}
        gameNumber={activeGame === '4word' ? wordle.gameNumber : activeGame === 'tiles' ? tiles.gameNumber : activeGame === 'squares' ? squares.gameNumber : game.gameNumber}
        dateStr={activeGame === '4word' ? wordle.dateStr : activeGame === 'tiles' ? tiles.dateStr : activeGame === 'squares' ? squares.dateStr : game.dateStr}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onHowToPlay={() => setShowHelp(true)}
        onStats={() => setShowStats(true)}
        onAuth={() => setShowAuth(true)}
        onFriends={() => setShowFriends(true)}
        user={user}
      />

      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/chainword" element={
            <Game
              game={game}
              wordListReady={wordListReady}
              hardMode={hardMode}
              onToggleHardMode={() => {
                const next = !hardMode;
                setHardMode(next);
                localStorage.setItem('chainword_hard_mode', next ? 'true' : 'false');
              }}
              onArchive={() => setShowArchive(true)}
              archiveDate={archiveDates.chainword}
            />
          } />
          <Route path="/4word" element={
            <WordleGame
              game={wordle}
              wordListReady={wordListReady}
              onArchive={() => setShowArchive(true)}
              archiveDate={archiveDates['4word']}
            />
          } />
          <Route path="/tiles" element={
            <TilesGame
              game={tiles}
              onArchive={() => setShowArchive(true)}
              archiveDate={archiveDates.tiles}
            />
          } />
          <Route path="/squares" element={
            <SquaresGame
              game={squares}
              onArchive={() => setShowArchive(true)}
              archiveDate={archiveDates.squares}
            />
          } />
        </Routes>
      </main>

      {/* Modals */}
      <HowToPlay open={showHelp} onClose={() => setShowHelp(false)} activeGame={activeGame} />

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={activeGame === '4word' ? wordle.stats : activeGame === 'tiles' ? tiles.stats : activeGame === 'squares' ? squares.stats : game.stats}
        onReset={handleReset}
        isWordle={activeGame === '4word'}
        isTiles={activeGame === 'tiles'}
        isSquares={activeGame === 'squares'}
        hardMode={activeGame === 'chainword' ? hardMode : undefined}
      />

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
      />

      <FriendsModal
        open={showFriends}
        onClose={() => setShowFriends(false)}
        user={user}
        dateStr={game.dateStr}
      />

      <Analytics />
      <ArchiveModal
        open={showArchive}
        onClose={() => setShowArchive(false)}
        activeGame={activeGame}
        hardMode={hardMode}
        selectedDate={archiveDates[activeGame]}
        onSelectDate={handleArchiveSelect}
      />
    </div>
  );
}
