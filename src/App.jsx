import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header.jsx';
import Game from './games/chainword/components/Game.jsx';
import Word4Game from './games/word4/components/Word4Game.jsx';
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
import { useWord4 } from './games/word4/hooks/useWord4.js';
import { useTiles } from './games/tiles/hooks/useTiles.js';
import { useSquares } from './games/squares/hooks/useSquares.js';
import {
  loadTheme, saveTheme,
  HARD_MODE_KEY,
  CHAINWORD_STATS_KEY, CHAINWORD_STATS_HARD_KEY,
  WORD4_STATS_KEY, TILES_STATS_KEY, SQUARES_STATS_KEY, SHABDAL_STATS_KEY,
  CHAINWORD_PROGRESS_PREFIX, WORD4_PROGRESS_PREFIX, TILES_PROGRESS_PREFIX, SQUARES_PROGRESS_PREFIX, SHABDAL_PROGRESS_PREFIX,
} from './utils/storage.js';
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
  if (pathname.startsWith('/word4')) return 'word4';
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
  const [hardMode, setHardMode] = useState(() => localStorage.getItem(HARD_MODE_KEY) === 'true');
  const [wordListReady, setWordListReady] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);
  const [gamesConfig, setGamesConfig] = useState(DEFAULT_GAMES_CONFIG);
  const [globalConfig, setGlobalConfig] = useState(DEFAULT_GLOBAL_CONFIG); // eslint-disable-line no-unused-vars

  // Per-game archive date overrides (null = today)
  const [archiveDates, setArchiveDates] = useState({
    chainword: null, word4: null, tiles: null, squares: null, shabdal: null,
  });

  // Modals
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const {
    user, userProfile, lastUser, signingIn,
    signInWithGoogle, signOut,
    pendingSync, acceptSync, declineSync,
    sessionConflict, resolveSession,
  } = useAuth(() => setStatsVersion(v => v + 1));
  const game = useGame(user, wordListReady, hardMode, archiveDates.chainword, statsVersion);
  const fourWord = useWord4(wordListReady, archiveDates.word4, user, statsVersion);
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
      chainword: [CHAINWORD_STATS_KEY, CHAINWORD_STATS_HARD_KEY],
      word4: [WORD4_STATS_KEY],
      tiles: [TILES_STATS_KEY],
      squares: [SQUARES_STATS_KEY],
      shabdal: [SHABDAL_STATS_KEY],
    };
    const localPrefixes = {
      chainword: CHAINWORD_PROGRESS_PREFIX,
      word4: WORD4_PROGRESS_PREFIX,
      tiles: TILES_PROGRESS_PREFIX,
      squares: SQUARES_PROGRESS_PREFIX,
      shabdal: SHABDAL_PROGRESS_PREFIX,
    };
    const cloudKeys = {
      chainword: ['chainword', 'chainword_hard'],
      word4: ['word4'],
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
          lastUser={lastUser}
          signingIn={signingIn}
          gamesConfig={gamesConfig}
        />
        <AuthModal
          open={showAuth}
          onClose={() => setShowAuth(false)}
          user={user}
          userProfile={userProfile}
          lastUser={lastUser}
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
          mergeResult={pendingSync?.mergeResult}
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
        gameNumber={activeGame === 'word4' ? fourWord.gameNumber : activeGame === 'tiles' ? tiles.gameNumber : activeGame === 'squares' ? squares.gameNumber : activeGame === 'shabdal' ? shabdal.gameNumber : game.gameNumber}
        dateStr={activeGame === 'word4' ? fourWord.dateStr : activeGame === 'tiles' ? tiles.dateStr : activeGame === 'squares' ? squares.dateStr : activeGame === 'shabdal' ? shabdal.dateStr : game.dateStr}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onHowToPlay={() => setShowHelp(true)}
        onStats={() => setShowStats(true)}
        onAuth={() => setShowAuth(true)}
        onFriends={() => setShowFriends(true)}
        user={user}
        userProfile={userProfile}
        lastUser={lastUser}
        signingIn={signingIn}
        isAdmin={userProfile?.admin ?? false}
        gamesConfig={gamesConfig}
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
                  localStorage.setItem(HARD_MODE_KEY, next ? 'true' : 'false');
                }}
                onArchive={() => setShowArchive(true)}
                archiveDate={archiveDates.chainword}
              />
          } />
          <Route path="/word4" element={
            gamesConfig.word4?.paid && !userProfile?.paid
              ? <Navigate to="/" replace />
              : <Word4Game
                game={fourWord}
                wordListReady={wordListReady}
                onArchive={() => setShowArchive(true)}
                archiveDate={archiveDates.word4}
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
        stats={activeGame === 'word4' ? fourWord.stats : activeGame === 'tiles' ? tiles.stats : activeGame === 'squares' ? squares.stats : activeGame === 'shabdal' ? shabdal.stats : game.stats}
        onReset={handleReset}
        isWord4={activeGame === 'word4'}
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
        lastUser={lastUser}
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
        mergeResult={pendingSync?.mergeResult}
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
