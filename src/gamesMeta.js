// Game ID constants — single source of truth for all game identifier strings.
// Import these everywhere instead of using raw string literals.
export const GAME_ID_CHAINWORD      = 'chainword';
export const GAME_ID_WORD4          = 'word4';
export const GAME_ID_TILES          = 'tiles';
export const GAME_ID_SQUARES        = 'squares';
export const GAME_ID_SHABDAL        = 'shabdal';
export const GAME_ID_CRYPTIC        = 'cryptic';
// Firestore key for chainword hard mode (not a standalone game, but referenced alongside game IDs)
export const GAME_ID_CHAINWORD_HARD = 'chainword_hard';

// Single source of truth for game identity: id, route, icon, default name,
// and landing-page tile appearance.  Components that need only a subset
// (e.g. the hamburger menu) can still import this and pick what they need.
export const GAMES_META = [
  {
    id: GAME_ID_CHAINWORD,
    route: '/' + GAME_ID_CHAINWORD,
    emoji: '🔗',
    from: '#6366f1',
    to: '#4f46e5',
    shadow: '#3730a3',
    badge: 'Word Chain',
  },
  {
    id: GAME_ID_WORD4,
    route: '/' + GAME_ID_WORD4,
    emoji: '🔤',
    from: '#10b981',
    to: '#059669',
    shadow: '#065f46',
    badge: 'Wordle',
  },
  {
    id: GAME_ID_TILES,
    route: '/' + GAME_ID_TILES,
    emoji: '🎯',
    from: '#f59e0b',
    to: '#d97706',
    shadow: '#92400e',
    badge: 'Scrabble',
  },
  {
    id: GAME_ID_SQUARES,
    route: '/' + GAME_ID_SQUARES,
    emoji: '🔲',
    from: '#ec4899',
    to: '#db2777',
    shadow: '#9d174d',
    badge: 'Logic',
  },
  {
    id: GAME_ID_SHABDAL,
    route: '/' + GAME_ID_SHABDAL,
    // emoji is an image path — components should render <img> instead of a text emoji
    emoji: '/shabdal-icon.png',
    from: '#f97316',
    to: '#ea580c',
    shadow: '#9a3412',
    badge: 'Hindi Wordle',
  },
  {
    id: GAME_ID_CRYPTIC,
    route: '/' + GAME_ID_CRYPTIC,
    emoji: '🧩',
    from: '#7c3aed',
    to: '#6d28d9',
    shadow: '#4c1d95',
    badge: 'Cryptic Clues',
  },
];

// Keyed lookup for O(1) access by game id
export const GAMES_META_BY_ID = Object.fromEntries(GAMES_META.map(g => [g.id, g]));
