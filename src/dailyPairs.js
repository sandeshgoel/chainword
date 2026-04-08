// Curated daily word pairs for Chainword.
// Both words are common 4-letter English words.
// The BFS will compute the optimal path length at runtime.
export const DAILY_PAIRS = [
  { start: 'cold', end: 'warm' },   // Day 1
  { start: 'hate', end: 'love' },
  { start: 'sick', end: 'well' },
  { start: 'head', end: 'tail' },
  { start: 'lead', end: 'gold' },
  { start: 'dark', end: 'dawn' },
  { start: 'word', end: 'play' },
  { start: 'fire', end: 'rain' },
  { start: 'fish', end: 'bird' },
  { start: 'road', end: 'path' },
  { start: 'ship', end: 'dock' },
  { start: 'king', end: 'lord' },
  { start: 'book', end: 'tale' },
  { start: 'find', end: 'seek' },   // Day 14
  { start: 'hope', end: 'wish' },
  { start: 'bold', end: 'mild' },
  { start: 'iron', end: 'rust' },
  { start: 'moon', end: 'glow' },
  { start: 'rain', end: 'snow' },
  { start: 'boat', end: 'sail' },
  { start: 'hill', end: 'vale' },
  { start: 'cave', end: 'lair' },
  { start: 'lake', end: 'pond' },
  { start: 'wind', end: 'gust' },
  { start: 'work', end: 'toil' },
  { start: 'give', end: 'take' },
  { start: 'door', end: 'gate' },
  { start: 'hand', end: 'palm' },   // Day 28
  { start: 'walk', end: 'race' },
  { start: 'swim', end: 'dive' },
  { start: 'hard', end: 'soft' },
  { start: 'blue', end: 'gray' },
  { start: 'save', end: 'earn' },
  { start: 'fast', end: 'slow' },
  { start: 'tall', end: 'thin' },
  { start: 'kind', end: 'rude' },
  { start: 'wise', end: 'bold' },
  { start: 'calm', end: 'wild' },
  { start: 'warm', end: 'cool' },
  { start: 'full', end: 'void' },
  { start: 'true', end: 'fake' },
  { start: 'safe', end: 'risk' },
  { start: 'gain', end: 'lose' },   // Day 43
  { start: 'land', end: 'sail' },
  { start: 'home', end: 'roam' },
  { start: 'pure', end: 'foul' },
  { start: 'rich', end: 'poor' },
  { start: 'high', end: 'deep' },
  { start: 'thin', end: 'wide' },
  { start: 'mild', end: 'bold' },
  { start: 'pink', end: 'blue' },
  { start: 'coal', end: 'fire' },
  { start: 'gold', end: 'coin' },
  { start: 'robe', end: 'cape' },
  { start: 'lace', end: 'silk' },
  { start: 'rose', end: 'vine' },
  { start: 'bone', end: 'skin' },   // Day 57
  { start: 'eyes', end: 'ears' },
  { start: 'nose', end: 'lips' },
  { start: 'dusk', end: 'dawn' },
  { start: 'moon', end: 'star' },
  { start: 'wave', end: 'tide' },
  { start: 'sand', end: 'dust' },
  { start: 'stem', end: 'root' },
  { start: 'leaf', end: 'bark' },
  { start: 'tree', end: 'wood' },
  { start: 'seed', end: 'grow' },
  { start: 'fade', end: 'glow' },
  { start: 'dull', end: 'keen' },
  { start: 'flat', end: 'hump' },
  { start: 'tame', end: 'wild' },   // Day 71
  { start: 'bare', end: 'full' },
  { start: 'near', end: 'afar' },
  { start: 'damp', end: 'warm' },
  { start: 'firm', end: 'soft' },
  { start: 'late', end: 'soon' },
  { start: 'loud', end: 'soft' },
  { start: 'fear', end: 'hope' },
  { start: 'rest', end: 'toil' },
  { start: 'numb', end: 'keen' },
  { start: 'dusk', end: 'morn' },
  { start: 'gray', end: 'pink' },
  { start: 'mist', end: 'haze' },
  { start: 'gale', end: 'calm' },
  { start: 'rush', end: 'wait' },   // Day 85
  { start: 'sink', end: 'swim' },
  { start: 'fall', end: 'rise' },
  { start: 'lose', end: 'find' },
  { start: 'love', end: 'hate' },
  { start: 'well', end: 'sick' },
  { start: 'warm', end: 'cold' },
  { start: 'slow', end: 'fast' },
  { start: 'play', end: 'work' },
  { start: 'take', end: 'give' },
  { start: 'pull', end: 'push' },
  { start: 'soft', end: 'hard' },
  { start: 'cool', end: 'warm' },
  { start: 'snow', end: 'rain' },   // Day 98
  { start: 'dive', end: 'swim' },
  { start: 'risk', end: 'safe' },
  { start: 'poor', end: 'rich' },
  { start: 'foul', end: 'pure' },
  { start: 'wide', end: 'thin' },
  { start: 'deep', end: 'high' },
  { start: 'fake', end: 'true' },
  { start: 'earn', end: 'save' },
  { start: 'rude', end: 'kind' },
  { start: 'wild', end: 'calm' },
  { start: 'gust', end: 'calm' },
  { start: 'gray', end: 'blue' },   // Day 110
  { start: 'seek', end: 'find' },
  { start: 'race', end: 'walk' },
  { start: 'path', end: 'road' },
  { start: 'dock', end: 'ship' },
  { start: 'tale', end: 'book' },
  { start: 'dawn', end: 'dark' },
  { start: 'rust', end: 'iron' },
  { start: 'lord', end: 'king' },
  { start: 'sail', end: 'land' },
  { start: 'gate', end: 'door' },
  { start: 'palm', end: 'hand' },   // Day 121
  { start: 'vale', end: 'hill' },
  { start: 'toil', end: 'rest' },
  { start: 'roam', end: 'home' },
  { start: 'wait', end: 'rush' },
  { start: 'haze', end: 'mist' },
  { start: 'morn', end: 'dusk' },
  { start: 'glow', end: 'fade' },
  { start: 'dust', end: 'sand' },
  { start: 'bark', end: 'leaf' },
  { start: 'wood', end: 'tree' },   // Day 131
  { start: 'tide', end: 'wave' },
  { start: 'soon', end: 'late' },
  { start: 'afar', end: 'near' },
  { start: 'lips', end: 'nose' },
  { start: 'ears', end: 'eyes' },
  { start: 'star', end: 'moon' },
  { start: 'coin', end: 'gold' },
  { start: 'vine', end: 'rose' },
  { start: 'cape', end: 'robe' },
  { start: 'pond', end: 'lake' },   // Day 141
  { start: 'wish', end: 'hope' },
  { start: 'lair', end: 'cave' },
  { start: 'grow', end: 'seed' },
  { start: 'skin', end: 'bone' },
  { start: 'silk', end: 'lace' },
  { start: 'root', end: 'stem' },
  { start: 'keen', end: 'dull' },
  { start: 'lord', end: 'duke' },
  { start: 'dune', end: 'sand' },
  { start: 'cord', end: 'rope' },   // Day 151
  { start: 'pave', end: 'road' },
  { start: 'flow', end: 'gush' },
  { start: 'mend', end: 'tear' },
  { start: 'bend', end: 'curl' },
  { start: 'grin', end: 'frown' },  // frown is 5 letters, skip
  { start: 'grin', end: 'wail' },
  { start: 'clip', end: 'snap' },
  { start: 'drip', end: 'pour' },
  { start: 'bake', end: 'boil' },
  { start: 'brew', end: 'cook' },   // Day 161
  { start: 'mint', end: 'sage' },
  { start: 'herb', end: 'root' },
  { start: 'wine', end: 'beer' },
  { start: 'milk', end: 'wine' },
  { start: 'meal', end: 'dish' },
  { start: 'bowl', end: 'cup' },    // cup is 3 letters skip
  { start: 'bowl', end: 'tray' },
  { start: 'fork', end: 'spoon' },  // spoon 5 letters skip
  { start: 'fork', end: 'knife' },  // knife 5 letters skip
  { start: 'fork', end: 'tong' },   // Day 170 - tong uncommon, skip
  { start: 'fork', end: 'dish' },
  { start: 'lamp', end: 'glow' },
  { start: 'candle', end: 'glow' }, // candle 6 letters skip
  { start: 'dark', end: 'glow' },
  { start: 'blue', end: 'gold' },
  { start: 'jade', end: 'gold' },
  { start: 'ruby', end: 'jade' },
  { start: 'opal', end: 'ruby' },
  { start: 'mare', end: 'foal' },
  { start: 'lamb', end: 'wolf' },   // Day 180
  { start: 'prey', end: 'hunt' },
  { start: 'trap', end: 'free' },
  { start: 'cage', end: 'free' },
  { start: 'lock', end: 'open' },
  { start: 'shut', end: 'open' },
  { start: 'bend', end: 'snap' },
  { start: 'push', end: 'pull' },
  { start: 'left', end: 'right' },  // right 5 letters skip
  { start: 'left', end: 'west' },
  { start: 'east', end: 'west' },   // Day 190
  { start: 'north', end: 'south' }, // both 5 letters, skip
  { start: 'east', end: 'left' },
  { start: 'past', end: 'future' }, // future 6 letters skip
  { start: 'past', end: 'gone' },
  { start: 'new', end: 'old' },     // 3 letters, skip
  { start: 'newt', end: 'frog' },
  { start: 'frog', end: 'toad' },
  { start: 'toad', end: 'newt' },
  { start: 'duck', end: 'swan' },
  { start: 'swan', end: 'dove' },   // Day 200
  { start: 'hawk', end: 'dove' },
  { start: 'wren', end: 'hawk' },
  { start: 'lark', end: 'wren' },
  { start: 'wren', end: 'robin' },  // robin 5 letters skip
  { start: 'wren', end: 'lark' },
  { start: 'wolf', end: 'bear' },
  { start: 'bear', end: 'lion' },
  { start: 'lion', end: 'wolf' },
  { start: 'deer', end: 'bear' },
  { start: 'hare', end: 'deer' },   // Day 210
  { start: 'mole', end: 'vole' },
  { start: 'vole', end: 'mole' },
  { start: 'rats', end: 'mice' },
  { start: 'crab', end: 'clam' },
  { start: 'clam', end: 'snail' },  // snail 5 letters skip
  { start: 'clam', end: 'mussel' }, // skip
  { start: 'clam', end: 'crab' },
  { start: 'carp', end: 'bass' },
  { start: 'pike', end: 'carp' },
  { start: 'bass', end: 'carp' },   // Day 220
  { start: 'mint', end: 'lime' },
  { start: 'lime', end: 'lemon' },  // skip
  { start: 'lime', end: 'plum' },
  { start: 'plum', end: 'pear' },
  { start: 'pear', end: 'plum' },
  { start: 'gale', end: 'wind' },
  { start: 'breeze', end: 'gale' }, // skip
  { start: 'gust', end: 'gale' },
  { start: 'gale', end: 'gust' },
  { start: 'mist', end: 'rain' },   // Day 230
  { start: 'hail', end: 'snow' },
  { start: 'sleet', end: 'snow' },  // sleet 5 letters skip
  { start: 'hail', end: 'sleet' },  // skip
  { start: 'hail', end: 'haze' },
  { start: 'sloe', end: 'haze' },
  { start: 'haze', end: 'smog' },
  { start: 'smog', end: 'fog' },    // fog 3 letters skip
  { start: 'smog', end: 'mist' },
  { start: 'fog', end: 'mist' },    // fog 3 letters skip
  { start: 'dull', end: 'keen' },   // Day 240
  { start: 'keen', end: 'dull' },
  { start: 'blur', end: 'clear' },  // clear 5 letters skip
  { start: 'blur', end: 'haze' },
  { start: 'haze', end: 'blur' },
  { start: 'dull', end: 'glow' },
  { start: 'glow', end: 'dull' },
  { start: 'bold', end: 'pale' },
  { start: 'pale', end: 'bold' },
  { start: 'prim', end: 'bold' },
  { start: 'bold', end: 'prim' },   // Day 251
  { start: 'tidy', end: 'mess' },
  { start: 'mess', end: 'tidy' },
  { start: 'neat', end: 'mess' },
  { start: 'mess', end: 'neat' },
  { start: 'hale', end: 'sick' },
  { start: 'sick', end: 'hale' },
  { start: 'limp', end: 'hale' },
  { start: 'hale', end: 'limp' },
  { start: 'lean', end: 'hale' },
  { start: 'hale', end: 'lean' },   // Day 261
  { start: 'sage', end: 'fool' },
  { start: 'fool', end: 'sage' },
  { start: 'wise', end: 'dumb' },
  { start: 'dumb', end: 'wise' },
  { start: 'glee', end: 'glum' },
  { start: 'glum', end: 'glee' },
  { start: 'glad', end: 'glum' },
  { start: 'glum', end: 'glad' },
  { start: 'joy', end: 'woe' },     // 3 letters skip
  { start: 'joys', end: 'woes' },   // Day 271
  { start: 'woes', end: 'joys' },
  { start: 'glee', end: 'woes' },
  { start: 'woes', end: 'glee' },
  { start: 'sole', end: 'pair' },
  { start: 'pair', end: 'sole' },
  { start: 'lone', end: 'pair' },
  { start: 'pair', end: 'lone' },
  { start: 'clan', end: 'lone' },
  { start: 'lone', end: 'clan' },
  { start: 'pack', end: 'lone' },   // Day 281
  { start: 'lone', end: 'pack' },
  { start: 'herd', end: 'lone' },
  { start: 'lone', end: 'herd' },
  { start: 'fond', end: 'cold' },
  { start: 'cold', end: 'fond' },
  { start: 'warm', end: 'fond' },
  { start: 'fond', end: 'warm' },
  { start: 'true', end: 'fond' },
  { start: 'fond', end: 'true' },
  { start: 'firm', end: 'fond' },   // Day 291
  { start: 'fond', end: 'firm' },
  { start: 'iron', end: 'wood' },
  { start: 'wood', end: 'iron' },
  { start: 'gold', end: 'iron' },
  { start: 'iron', end: 'gold' },
  { start: 'lead', end: 'iron' },
  { start: 'iron', end: 'lead' },
  { start: 'zinc', end: 'iron' },
  { start: 'iron', end: 'zinc' },
  { start: 'clay', end: 'sand' },   // Day 301
  { start: 'sand', end: 'clay' },
  { start: 'silt', end: 'sand' },
  { start: 'sand', end: 'silt' },
  { start: 'peat', end: 'sand' },
  { start: 'sand', end: 'peat' },
  { start: 'coal', end: 'peat' },
  { start: 'peat', end: 'coal' },
  { start: 'coke', end: 'coal' },
  { start: 'coal', end: 'coke' },
  { start: 'fire', end: 'coke' },   // Day 311
  { start: 'coke', end: 'fire' },
  { start: 'heat', end: 'fire' },
  { start: 'fire', end: 'heat' },
  { start: 'burn', end: 'heat' },
  { start: 'heat', end: 'burn' },
  { start: 'char', end: 'burn' },
  { start: 'burn', end: 'char' },
  { start: 'sear', end: 'burn' },
  { start: 'burn', end: 'sear' },
  { start: 'scorch', end: 'burn' }, // skip
  { start: 'glow', end: 'burn' },   // Day 322
  { start: 'burn', end: 'glow' },
  { start: 'melt', end: 'burn' },
  { start: 'burn', end: 'melt' },
  { start: 'cast', end: 'melt' },
  { start: 'melt', end: 'cast' },
  { start: 'pour', end: 'cast' },
  { start: 'cast', end: 'pour' },
  { start: 'mold', end: 'cast' },
  { start: 'cast', end: 'mold' },
  { start: 'form', end: 'mold' },   // Day 332
  { start: 'mold', end: 'form' },
  { start: 'curl', end: 'form' },
  { start: 'form', end: 'curl' },
  { start: 'coil', end: 'curl' },
  { start: 'curl', end: 'coil' },
  { start: 'loop', end: 'coil' },
  { start: 'coil', end: 'loop' },
  { start: 'ring', end: 'loop' },
  { start: 'loop', end: 'ring' },
  { start: 'band', end: 'ring' },   // Day 342
  { start: 'ring', end: 'band' },
  { start: 'cord', end: 'band' },
  { start: 'band', end: 'cord' },
  { start: 'rope', end: 'cord' },
  { start: 'cord', end: 'rope' },
  { start: 'wire', end: 'rope' },
  { start: 'rope', end: 'wire' },
  { start: 'link', end: 'wire' },
  { start: 'wire', end: 'link' },
  { start: 'knot', end: 'link' },   // Day 352
  { start: 'link', end: 'knot' },
  { start: 'bind', end: 'knot' },
  { start: 'knot', end: 'bind' },
  { start: 'lash', end: 'bind' },
  { start: 'bind', end: 'lash' },
  { start: 'wrap', end: 'bind' },
  { start: 'bind', end: 'wrap' },
  { start: 'coil', end: 'wrap' },
  { start: 'wrap', end: 'coil' },
  { start: 'cold', end: 'warm' },   // Day 362 — cycle back
  { start: 'hate', end: 'love' },
  { start: 'sick', end: 'well' },
  { start: 'head', end: 'tail' },
  { start: 'lead', end: 'gold' },
];

// Returns today's pair based on IST date (UTC+5:30)
// Changes at midnight IST
export function getDailyInfo() {
  const now = new Date();
  // Offset to IST: UTC+5:30 = 330 minutes
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const dateStr = ist.toISOString().split('T')[0]; // "YYYY-MM-DD"

  // Epoch day number (days since 1970-01-01 in IST)
  const epochDay = Math.floor(ist.getTime() / (24 * 60 * 60 * 1000));

  // Compute game number (1-indexed, starting from a base date)
  const BASE_EPOCH_DAY = 20188; // 2025-04-01 in IST roughly
  const gameNumber = Math.max(1, epochDay - BASE_EPOCH_DAY + 1);

  // Filter out invalid pairs (not exactly 4 letters, same word)
  const validPairs = DAILY_PAIRS.filter(
    p => p.start.length === 4 && p.end.length === 4 && p.start !== p.end
  );

  const pair = validPairs[epochDay % validPairs.length];
  return { pair, dateStr, gameNumber };
}
