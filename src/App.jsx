import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header.jsx';
import Game from './games/chainword/components/Game.jsx';
import WordleGame from './games/wordle/components/WordleGame.jsx';
import TilesGame from './games/tiles/components/TilesGame.jsx';
import SquaresGame from './games/squares/components/SquaresGame.jsx';
import HowToPlay from './games/chainword/components/HowToPlay.jsx';
import StatsModal from './components/StatsModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import FriendsModal from './components/FriendsModal.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useGame } from './games/chainword/hooks/useGame.js';
import { useWordle } from './games/wordle/hooks/useWordle.js';
import { useTiles } from './games/tiles/hooks/useTiles.js';
import { useSquares } from './games/squares/hooks/useSquares.js';
import { loadTheme, saveTheme } from './utils/storage.js';
import { loadWordList } from './words.js';

export default function App() {
  const [activeGame, setActiveGame] = useState('chainword');
  const [darkMode, setDarkMode] = useState(() => loadTheme() === 'dark');
  const [hardMode, setHardMode] = useState(() => localStorage.getItem('chainword_hard_mode') === 'true');
  const [wordListReady, setWordListReady] = useState(false);

  // Modals
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const { user, signInWithGoogle, signOut } = useAuth();
  const game = useGame(user, wordListReady, hardMode);
  const wordle = useWordle(wordListReady);
  const tiles = useTiles();
  const squares = useSquares();

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

  // Show stats after completing a game
  useEffect(() => {
    if (game.status === 'won') {
      setTimeout(() => setShowStats(true), 1500);
    }
  }, [game.status]);


  function handleReset() {
    Object.keys(localStorage)
      .filter(k => k.startsWith('chainword'))
      .forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Toaster position="top-center" />

      <Header
        activeGame={activeGame}
        onSelectGame={setActiveGame}
        gameNumber={activeGame === 'chainword' ? game.gameNumber : wordle.gameNumber}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onHowToPlay={() => setShowHelp(true)}
        onStats={() => setShowStats(true)}
        onAuth={() => setShowAuth(true)}
        onFriends={() => setShowFriends(true)}
        user={user}
      />

      <main className="flex-1 overflow-hidden">
        {activeGame === 'chainword' ? (
          <Game
            game={game}
            wordListReady={wordListReady}
            hardMode={hardMode}
            onToggleHardMode={() => {
              const next = !hardMode;
              setHardMode(next);
              localStorage.setItem('chainword_hard_mode', next ? 'true' : 'false');
            }}
          />
        ) : activeGame === '4word' ? (
          <WordleGame game={wordle} wordListReady={wordListReady} />
        ) : activeGame === 'squares' ? (
          <SquaresGame game={squares} />
        ) : (
          <TilesGame game={tiles} />
        )}
      </main>

      {/* Modals */}
      <HowToPlay open={showHelp} onClose={() => setShowHelp(false)} />

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={activeGame === '4word' ? wordle.stats : activeGame === 'tiles' ? tiles.stats : game.stats}
        onReset={handleReset}
        isWordle={activeGame === '4word'}
        isTiles={activeGame === 'tiles'}
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
    </div>
  );
}
