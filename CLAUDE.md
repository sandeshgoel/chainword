# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
```

There are no lint or test scripts configured.

## Architecture

Chainword is a daily word puzzle web app built with React 18 + Vite + Tailwind CSS + Firebase. It hosts four games: **Chainword** (word ladder), **4Word** (Wordle-style), **Tiles**, and **Squares**.

### Key Files

- [src/App.jsx](src/App.jsx) — Main router, global state (darkMode, hardMode, modals, archiveDates), midnight reload logic, and build update detection
- [src/pages/LandingPage.jsx](src/pages/LandingPage.jsx) — Home page with game selection
- [src/hooks/useAuth.js](src/hooks/useAuth.js) — Firebase Auth + one-time-per-session cloud sync
- [src/firebase.js](src/firebase.js) — Firebase initialization (reads from `.env`)

Each game lives under [src/games/](src/games/) and follows the same pattern:
- `components/Game.jsx` — UI and input handling
- `hooks/useGame.js` (or `useWordle.js`, etc.) — all game state and logic
- `data/` — puzzle data (daily pairs, word sets)

Shared utilities:
- [src/utils/wordUtils.js](src/utils/wordUtils.js) — BFS shortest-path algorithm, word validation
- [src/utils/storage.js](src/utils/storage.js) — localStorage read/write helpers
- [src/utils/cloudStats.js](src/utils/cloudStats.js) — Firestore sync and conflict merge logic
- [src/utils/sharing.js](src/utils/sharing.js) — Share result encoding (no spoilers)
- [src/utils/awards.js](src/utils/awards.js) — Star rating calculations

### Data Flow

1. `App.jsx` routes to a game component and passes down global state
2. Each game hook calls `getDailyInfo()` to get today's puzzle (or archive date)
3. `loadWordList()` fetches the ENABLE word list (~4,500 four-letter words) from GitHub, falling back to the ~1,500-word embedded set in [src/commonWords.js](src/commonWords.js); cached in localStorage
4. `bfs()` in `wordUtils.js` computes the optimal word ladder path (determines par/star rating)
5. Game progress is persisted to localStorage immediately; mirrored to Firestore if user is signed in
6. On sign-in, `useAuth` runs a one-time sync (guarded by `sessionStorage.braingym_synced`) and shows a conflict resolution modal if local and cloud stats diverge

### State Management

- **Global**: `App.jsx` holds darkMode, hardMode, modal visibility, and archive dates
- **Per-game**: Each game's custom hook manages chain state, optimal path, win/loss status, and stats
- **localStorage keys**: `chainword_progress` (all game states by date), `braingym_chainword_stats`, `braingym_4word_stats`, etc.; hard mode uses separate keys
- **Firestore paths**: `/users/{uid}/games/{dateStr}` (daily progress), `/users/{uid}/friends/{friendId}`

### IST Date Handling

All puzzle selection uses IST (UTC+5:30). `getTodayIST()` converts the current time to a `YYYY-MM-DD` string in IST. Every 30 minutes, the app checks if midnight has passed and reloads, and also checks if a new JS bundle has been deployed.

### Environment Variables

Firebase config requires a `.env` file with six values (see `.env.example` if present). The app will load but Firebase features (auth, cloud sync, friends) will fail without valid credentials.
