// Single source of truth for game identity: id, route, icon, default name,
// and landing-page tile appearance.  Components that need only a subset
// (e.g. the hamburger menu) can still import this and pick what they need.

export const GAMES_META = [
  {
    id: 'chainword',
    route: '/chainword',
    emoji: '🔗',
    name: 'Chainword',
    desc: 'Link 4-letter words one step at a time',
    from: '#6366f1',
    to: '#4f46e5',
    shadow: '#3730a3',
    badge: 'Word Chain',
  },
  {
    id: 'word4',
    route: '/word4',
    emoji: '🔤',
    name: 'Word4',
    desc: 'Guess the 4-letter word in 6 tries',
    from: '#10b981',
    to: '#059669',
    shadow: '#065f46',
    badge: 'Wordle',
  },
  {
    id: 'tiles',
    route: '/tiles',
    emoji: '🎯',
    name: 'Tiles',
    desc: 'Build the top scoring word from your rack',
    from: '#f59e0b',
    to: '#d97706',
    shadow: '#92400e',
    badge: 'Scrabble',
  },
  {
    id: 'squares',
    route: '/squares',
    emoji: '🔲',
    name: 'Squares',
    desc: 'Fill the corners to form valid words',
    from: '#ec4899',
    to: '#db2777',
    shadow: '#9d174d',
    badge: 'Logic',
  },
  {
    id: 'shabdal',
    route: '/shabdal',
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
    id: 'cryptic',
    route: '/cryptic',
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
