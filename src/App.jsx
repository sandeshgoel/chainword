import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header.jsx';
import Game from './games/chainword/components/Game.jsx';
import FourWordGame from './games/4word/components/FourWordGame.jsx';
import TilesGame from './games/tiles/components/TilesGame.jsx';
import SquaresGame from './games/squares/components/SquaresGame.jsx';
import ShabdalGame from './games/shabdal/components/ShabdalGame.jsx';
import { useShabdal } from './games/shabdal/hooks/useShabdal.js';
import CrypticGame from './games/cryptic/components/CrypticGame.jsx';
import HowToPlay from './games/chainword/components/HowToPlay.jsx';
import StatsModal from './components/StatsModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import StatsConflictModal from './components/StatsConflictModal.jsx';
import SessionConflictModal from './components/SessionConflictModal.jsx';
import FriendsModal from './components/FriendsModal.jsx';
import ArchiveModal from './components/ArchiveModal.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useGame } from './games/chainword/hooks/useGame.js';
import { use4Word } from './games/4word/hooks/use4Word.js';
import { useTiles } from './games/tiles/hooks/useTiles.js';
import { useSquares } from './games/squares/hooks/useSquares.js';
import { loadTheme, saveTheme } from './utils/storage.js';
import { pushCloudStats } from './utils/cloudStats.js';
import { loadWordList } from './words.js';
import { db, firebaseConfigured } from './firebase.js';
import { doc, onSnapshot } from 'firebase/firestore';
import { DEFAULT_GAMES_CONFIG, DEFAULT_GLOBAL_CONFIG } from './hooks/useAdmin.js';

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
  if (pathname.startsWith('/shabdal')) return 'shabdal';
  if (pathname.startsWith('/cryptic')) return 'cryptic';
  return null;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeGame = pathToGame(location.pathname);

  const [darkMode, setDarkMode] = useState(() => loadTheme() === 'dark');
  const [hardMode, setHardMode] = useState(() => localStorage.getItem('chainword_hard_mode') === 'true');
  const [wordListReady, setWordListReady] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);
  const [gamesConfig, setGamesConfig] = useState(DEFAULT_GAMES_CONFIG);
  const [globalConfig, setGlobalConfig] = useState(DEFAULT_GLOBAL_CONFIG); // eslint-disable-line no-unused-vars

  // Per-game archive date overrides (null = today)
  const [archiveDates, setArchiveDates] = useState({
    chainword: null, '4word': null, tiles: null, squares: null, shabdal: null,
  });

  // Modals
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const {
    user, userProfile, signingIn,
    signInWithGoogle, signOut,
    pendingSync, acceptSync, declineSync,
    sessionConflict, resolveSession,
  } = useAuth(() => setStatsVersion(v => v + 1));
  const game = useGame(user, wordListReady, hardMode, archiveDates.chainword, statsVersion);
  const fourWord = use4Word(wordListReady, archiveDates['4word'], user, statsVersion);
  const tiles = useTiles(archiveDates.tiles, user, statsVersion);
  const squares = useSquares(archiveDates.squares, user, statsVersion);
  const shabdal = useShabdal(archiveDates.shabdal, user, statsVersion);

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveTheme(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load word list on mount
  useEffect(() => {
    loadWordList().then(() => setWordListReady(true));
  }, []);

  // Listen to admin config in real time for paid gating
  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsubGames = onSnapshot(doc(db, 'admin', 'games'), snap => {
      if (snap.exists()) setGamesConfig({ ...DEFAULT_GAMES_CONFIG, ...snap.data() });
    }, (err) => { console.error('Failed to fetch games config:', err); });
    const unsubConfig = onSnapshot(doc(db, 'admin', 'config'), snap => {
      if (snap.exists()) setGlobalConfig(snap.data());
    }, (err) => { console.error('Failed to fetch global config:', err); });
    return () => { unsubGames(); unsubConfig(); };
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
      } catch { }
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

  async function handleReset() {
    // Local storage keys per game
    const localStatKeys = {
      chainword: ['braingym_chainword_stats', 'braingym_chainword_stats_hard', 'chainword_progress'],
      '4word': ['braingym_4word_stats'],
      tiles: ['braingym_tiles_stats'],
      squares: ['braingym_squares_stats'],
      shabdal: ['braingym_shabdal_stats'],
    };
    const localPrefixes = {
      chainword: null, // progress stored in single key above
      '4word': 'chainword_wordle_',
      tiles: 'chainword_tiles_',
      squares: 'chainword_squares_',
      shabdal: 'chainword_shabdal_',
    };
    const cloudKeys = {
      chainword: ['chainword', 'chainword_hard'],
      '4word': ['4word'],
      tiles: ['tiles'],
      squares: ['squares'],
      shabdal: ['shabdal'],
    };

    // Remove stat keys
    (localStatKeys[activeGame] || []).forEach(k => localStorage.removeItem(k));
    // Remove per-day progress keys
    const prefix = localPrefixes[activeGame];
    if (prefix) {
      Object.keys(localStorage).filter(k => k.startsWith(prefix)).forEach(k => localStorage.removeItem(k));
    }
    sessionStorage.removeItem('braingym_synced');

    if (user) {
      await Promise.all(
        (cloudKeys[activeGame] || []).map(k => pushCloudStats(user.uid, k, []))
      ).catch(console.error);
    }
    window.location.reload();
  }

  // Admin page
  if (location.pathname === '/admin') {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <Toaster position="top-center" />
        <AdminDashboard user={user} userProfile={userProfile} darkMode={darkMode} />
      </div>
    );
  }

  // Landing page — no header/modals chrome
  if (activeGame === null) {
    return (
      <div className="min-h-dvh bg-gray-200 dark:bg-gray-950 flex justify-center transition-colors">
      <div className="w-full max-w-[430px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors relative overflow-x-hidden">
        <Toaster position="top-center" />
        <LandingPage
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onAuth={() => setShowAuth(true)}
          user={user}
          userProfile={userProfile}
          signingIn={signingIn}
          gamesConfig={gamesConfig}
        />
        <AuthModal
          open={showAuth}
          onClose={() => setShowAuth(false)}
          user={user}
          userProfile={userProfile}
          onSignIn={signInWithGoogle}
          onSignOut={signOut}
        />
        <SessionConflictModal
          open={!!sessionConflict}
          sessionConflict={sessionConflict}
          onSignInHere={() => resolveSession(true)}
          onCancel={() => resolveSession(false)}
        />
        <StatsConflictModal
          open={!!pendingSync}
          conflictsByGame={pendingSync?.conflictsByGame || {}}
          onAccept={acceptSync}
          onDecline={declineSync}
        />
        <Analytics />
        {/* Landscape-rotation overlay */}
        <div className="rotate-overlay fixed inset-0 z-[200] bg-gray-900 text-white flex-col items-center justify-center gap-4 text-center p-8">
          <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18H12.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-semibold">Please rotate your device</p>
          <p className="text-sm text-gray-400">This app is designed for portrait mode</p>
        </div>
      </div>
      </div>
    );
  }

  // Game pages
  return (
    <div className="min-h-dvh bg-gray-200 dark:bg-gray-950 flex justify-center transition-colors">
    <div className="w-full max-w-[430px] h-dvh flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors overflow-hidden relative">
      <Toaster position="top-center" />

      <Header
        activeGame={activeGame}
        onSelectGame={g => navigate('/' + g)}
        onHome={() => navigate('/')}
        gameNumber={activeGame === '4word' ? fourWord.gameNumber : activeGame === 'tiles' ? tiles.gameNumber : activeGame === 'squares' ? squares.gameNumber : activeGame === 'shabdal' ? shabdal.gameNumber : game.gameNumber}
        dateStr={activeGame === '4word' ? fourWord.dateStr : activeGame === 'tiles' ? tiles.dateStr : activeGame === 'squares' ? squares.dateStr : activeGame === 'shabdal' ? shabdal.dateStr : game.dateStr}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onHowToPlay={() => setShowHelp(true)}
        onStats={() => setShowStats(true)}
        onAuth={() => setShowAuth(true)}
        onFriends={() => setShowFriends(true)}
        user={user}
        userProfile={userProfile}
        signingIn={signingIn}
        isAdmin={userProfile?.admin ?? false}
      />

      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/chainword" element={
            gamesConfig.chainword?.paid && !userProfile?.paid
              ? <Navigate to="/" replace />
              : <Game
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
            gamesConfig['4word']?.paid && !userProfile?.paid
              ? <Navigate to="/" replace />
              : <FourWordGame
                game={fourWord}
                wordListReady={wordListReady}
                onArchive={() => setShowArchive(true)}
                archiveDate={archiveDates['4word']}
              />
          } />
          <Route path="/tiles" element={
            gamesConfig.tiles?.paid && !userProfile?.paid
              ? <Navigate to="/" replace />
              : <TilesGame
                game={tiles}
                onArchive={() => setShowArchive(true)}
                archiveDate={archiveDates.tiles}
              />
          } />
          <Route path="/squares" element={
            gamesConfig.squares?.paid && !userProfile?.paid
              ? <Navigate to="/" replace />
              : <SquaresGame
                game={squares}
                onArchive={() => setShowArchive(true)}
                archiveDate={archiveDates.squares}
              />
          } />
          <Route path="/shabdal" element={
            gamesConfig.shabdal?.paid && !userProfile?.paid
              ? <Navigate to="/" replace />
              : <ShabdalGame
                game={shabdal}
                onArchive={() => setShowArchive(true)}
                archiveDate={archiveDates.shabdal}
              />
          } />
          <Route path="/cryptic" element={
            gamesConfig.cryptic?.paid && !userProfile?.paid
              ? <Navigate to="/" replace />
              : <CrypticGame />
          } />
        </Routes>
      </main>

      {/* Modals */}
      <HowToPlay open={showHelp} onClose={() => setShowHelp(false)} activeGame={activeGame} />

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={activeGame === '4word' ? fourWord.stats : activeGame === 'tiles' ? tiles.stats : activeGame === 'squares' ? squares.stats : activeGame === 'shabdal' ? shabdal.stats : game.stats}
        onReset={handleReset}
        is4Word={activeGame === '4word'}
        isTiles={activeGame === 'tiles'}
        isSquares={activeGame === 'squares'}
        isShabdal={activeGame === 'shabdal'}
        hardMode={activeGame === 'chainword' ? hardMode : undefined}
      />

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        user={user}
        userProfile={userProfile}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
      />

      <SessionConflictModal
        open={!!sessionConflict}
        sessionConflict={sessionConflict}
        onSignInHere={() => resolveSession(true)}
        onCancel={() => resolveSession(false)}
      />

      <StatsConflictModal
        open={!!pendingSync}
        conflictsByGame={pendingSync?.conflictsByGame || {}}
        onAccept={acceptSync}
        onDecline={declineSync}
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

      {/* Landscape-rotation overlay */}
      <div className="rotate-overlay fixed inset-0 z-[200] bg-gray-900 text-white flex-col items-center justify-center gap-4 text-center p-8">
        <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18H12.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-semibold">Please rotate your device</p>
        <p className="text-sm text-gray-400">This app is designed for portrait mode</p>
      </div>
    </div>
    </div>
  );
}
