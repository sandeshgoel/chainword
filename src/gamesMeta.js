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
    name: 'Chainword',
    desc: 'Link 4-letter words one step at a time',
    from: '#6366f1',
    to: '#4f46e5',
    shadow: '#3730a3',
    badge: 'Word Chain',
  },
  {
    id: GAME_ID_WORD4,
    route: '/' + GAME_ID_WORD4,
    emoji: '🔤',
    name: 'Word4',
    desc: 'Guess the 4-letter word in 6 tries',
    from: '#10b981',
    to: '#059669',
    shadow: '#065f46',
    badge: 'Wordle',
  },
  {
    id: GAME_ID_TILES,
    route: '/' + GAME_ID_TILES,
    emoji: '🎯',
    name: 'Tiles',
    desc: 'Build the top scoring word from your rack',
    from: '#f59e0b',
    to: '#d97706',
    shadow: '#92400e',
    badge: 'Scrabble',
  },
  {
    id: GAME_ID_SQUARES,
    route: '/' + GAME_ID_SQUARES,
    emoji: '🔲',
    name: 'Squares',
    desc: 'Fill the corners to form valid words',
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
    name: 'शब्दल',
    desc: 'Guess the Hindi word in 6 tries',
    from: '#f97316',
    to: '#ea580c',
    shadow: '#9a3412',
    badge: 'Hindi Wordle',
  },
  {
    id: GAME_ID_CRYPTIC,
    route: '/' + GAME_ID_CRYPTIC,
    emoji: '🧩',
    name: 'Cryptic',
    desc: 'Solve a daily cryptic crossword clue',
    from: '#7c3aed',
    to: '#6d28d9',
    shadow: '#4c1d95',
    badge: 'Cryptic Clues',
  },
];

// Keyed lookup for O(1) access by game id
export const GAMES_META_BY_ID = Object.fromEntries(GAMES_META.map(g => [g.id, g]));
