import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Header from './components/Header.jsx';
import Game from './components/Game.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import StatsModal from './components/StatsModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import FriendsModal from './components/FriendsModal.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useGame } from './hooks/useGame.js';
import { loadTheme, saveTheme, loadStats } from './utils/storage.js';
import { loadWordList } from './words.js';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => loadTheme() === 'dark');
  const [wordListReady, setWordListReady] = useState(false);

  // Modals
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const { user, authLoading, signInWithGoogle, signOut } = useAuth();
  const game = useGame(user, wordListReady);

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
      toast.success('Puzzle complete!', { duration: 2000 });
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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Toaster position="top-center" />

      <Header
        gameNumber={game.gameNumber}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onHowToPlay={() => setShowHelp(true)}
        onStats={() => setShowStats(true)}
        onAuth={() => setShowAuth(true)}
        onFriends={() => setShowFriends(true)}
        user={user}
      />

      <main>
        <Game game={game} wordListReady={wordListReady} />
      </main>

      {/* Modals */}
      <HowToPlay open={showHelp} onClose={() => setShowHelp(false)} />

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={game.stats}
        onReset={handleReset}
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
