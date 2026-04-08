# Chainword 🔗

A daily word ladder puzzle web app. Connect two 4-letter words by changing one letter at a time. The fewer steps, the better your score!

## Features

- **Daily puzzle** — new word pair every day at midnight IST (UTC+5:30)
- **Offline-first** — progress saved to localStorage; works without signing in
- **Scoring** — star rating based on how close you get to the optimal path
- **Share** — share your result without spoiling the solution
- **Google Sign-In** — optional; syncs progress to the cloud via Firebase
- **Friends** — see friends' scores on today's puzzle (requires sign-in)
- **Dark mode** — full dark/light theme support
- **Hints** — reveal the next optimal step (affects score)
- **Cross-platform** — works on any modern browser (iOS, Android, desktop)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Firebase Setup (optional — for Google Sign-In & cloud sync)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a **Web app** and copy the config
4. Enable **Authentication → Google** sign-in method
5. Enable **Firestore Database** (start in production mode)
6. Copy `.env.example` → `.env` and fill in your values

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /games/{gameId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }

      match /friends/{friendId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }

    // Allow users to read other users' public profile & game scores (for friends feature)
    match /users/{uid} {
      allow read: if request.auth != null;
      match /games/{gameId} {
        allow read: if request.auth != null;
      }
    }
  }
}
```

## Build for Production

```bash
npm run build
```

Outputs to `dist/`. Deploy to any static hosting (Netlify, Vercel, Firebase Hosting, etc.)

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Firebase v10 (Auth + Firestore)
- react-hot-toast

## How the Game Works

1. You're given a **start** word and an **end** word (both 4 letters)
2. Change one letter at a time to move from start to end
3. Every intermediate word must be a valid English word
4. The BFS algorithm computes the optimal (shortest) path — this is your **par**
5. Fewer steps = better score:
   - ⭐⭐⭐ Optimal (at or under par)
   - ⭐⭐ Great (+1 step)
   - ⭐ Good (+2 steps)
   - Completed (+3 or more steps)

## Word Dictionary

The app embeds ~1,500 common 4-letter English words as a fallback and fetches the [ENABLE word list](https://github.com/dolph/dictionary) (public domain, ~4,500 four-letter words) on first use, caching it in localStorage for offline play.
