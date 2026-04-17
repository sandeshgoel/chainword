import { formatDate } from './wordUtils.js';
import { chainwordTier, squaresTier, tilesTier, word4Tier, shabdalTier,
  TIER_CONFIG, TIER_GOLD, TIER_SILVER, TIER_BRONZE, TIER_UNSOLVED } from './awards.js';
import { SLOT_MULTIPLIERS } from './awards.js';
import { GAME_ID_CHAINWORD, GAME_ID_SQUARES, GAME_ID_WORD4, 
         GAME_ID_TILES, GAME_ID_SHABDAL,
         GAMES_META_BY_ID } from '../gamesMeta.js';

export async function shareOrCopy(text, onCopied) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (_) { /* user cancelled or unsupported */ }
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    onCopied?.();
  } catch (_) {
    // Last resort: old execCommand
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    onCopied?.();
  }
}

function shareHeader(gameId, gameNumber, dateStr, tier) {
  const gameCfg = GAMES_META_BY_ID[gameId];
  const gameName = gameId.toUpperCase();
  const emoji = gameCfg.emoji;
  const cfg = TIER_CONFIG[tier];
  return `${emoji || ''} ${gameName} #${gameNumber} • ` +
         `${formatDate(dateStr)}\n\n`+
         `${cfg.emoji}  ${cfg.label}\n`;
}

function shareFooter(gameId) {
  const url = `https://www.chainword.in/${gameId.toLowerCase()}`;
  return `\nPlay at ${url}`;
}

// Build a shareable text without revealing the actual words used
export function buildChainwordShareText({ gameNumber, dateStr, start, end, userSteps, parSteps, chain, hintsUsed, gaveUp }) {
  const tier = chainwordTier(!gaveUp, userSteps, hintsUsed || 0, parSteps);
  const cfg = TIER_CONFIG[tier];
  const label = gaveUp ? 'Gave up' : cfg.label;

  // Show visual chain: each row is a word's worth of blocks.
  // 🟩 = letter unchanged from previous word, 🟨 = letter changed.
  let chainViz = '';
  if (!gaveUp && chain.length >= 2) {
    for (let i = 1; i < chain.length; i++) {
      const prev = chain[i - 1];
      const curr = chain[i];
      let row = '';
      for (let j = 0; j < 4; j++) {
        row += curr[j] === prev[j] ? '🟩' : '🟨';
      }
      chainViz += '\n' + row;
    }
  }

  const guesses = userSteps - 1;
  const hintStr = (hintsUsed || 0) > 0 ? ` 💡${hintsUsed}` : '';
  const stepInfo = gaveUp
    ? 'DNF'
    : `${guesses} guess${guesses !== 1 ? 'es' : ''}${hintStr}`;

  return (
    shareHeader(GAME_ID_CHAINWORD, gameNumber, dateStr, tier) +
    `${start.toUpperCase()} → ${end.toUpperCase()}\n` +
    `${label}  (${stepInfo})` +
    chainViz +
    shareFooter(GAME_ID_CHAINWORD)
  );
}

export function buildSquaresShareText({ gameNumber, dateStr, hintedCorners, square }) {
  const [tl, tr, bl, br] = hintedCorners;
  const ce = (h) => h ? '🟥' : '🟩';
  const hintsUsed = hintedCorners.filter(Boolean).length;
  const tier = squaresTier(hintsUsed);
  const label = hintsUsed === 0 ? 'Perfect!' : hintsUsed === 1 ? 'Great!' : `Completed with ${hintsUsed} hints`;

  let grid;
  if (square) {
    const [top, left, right, bottom] = square;
    // Fullwidth letters (U+FF21+) are 2 visual columns wide, matching emoji width
    const fw = (s) => String.fromCharCode(s.toUpperCase().charCodeAt(0) + 0xFEE0);
    grid =
      `${ce(tl)}${fw(top[1])}${fw(top[2])}${ce(tr)}\n` +
      `${fw(left[1])}    ${fw(right[1])}\n` +
      `${fw(left[2])}    ${fw(right[2])}\n` +
      `${ce(bl)}${fw(bottom[1])}${fw(bottom[2])}${ce(br)}`;
  } else {
    grid = `${ce(tl)}${ce(tr)}\n${ce(bl)}${ce(br)}`;
  }

  return (
    shareHeader(GAME_ID_SQUARES, gameNumber, dateStr, tier) +
    `${label}\n` +
    `${grid}\n` +
    shareFooter(GAME_ID_SQUARES)
  );
}

export function buildTilesShareText({ gameNumber, dateStr, bestScore, optimalScore, bestWord }) {
  const isOptimal = bestScore >= optimalScore;
  const tier = tilesTier(bestScore, optimalScore);
  const cfg = TIER_CONFIG[tier];
  const label = isOptimal ? 'Optimal!' : cfg.label;

  // Visual: show multiplier squares for the 4 slots
  const slotViz = SLOT_MULTIPLIERS.map(m => m === 3 ? '🟥' : m === 2 ? '🟦' : '⬜').join('');

  return (
    shareHeader(GAME_ID_TILES, gameNumber, dateStr, tier) +
    `${label}  (${bestScore} / ${optimalScore} pts)\n` +
    `${slotViz}  ${bestWord}\n` +
    shareFooter(GAME_ID_TILES)
  );
}

export function buildWord4ShareText({ gameNumber, dateStr, guesses, status }) {
  const result = status === 'won' ? guesses.length : 'X';
  const tier = word4Tier(status === 'won', guesses.length);
  const cfg = TIER_CONFIG[tier];
  let text = shareHeader(GAME_ID_WORD4, gameNumber, dateStr, tier)+
    `${cfg.label}! Solved in ${result}/6 guesses\n\n`;

  for (const guess of guesses) {
    let row = '';
    for (const color of guess.colors) {
      if (color === 'green') row += '🟩';
      else if (color === 'orange') row += '🟨';
      else row += '⬛';
    }
    text += row + '\n';
  }

  text += shareFooter(GAME_ID_WORD4);
  return text;
}

export function buildShabdalShareText({ gameNumber, dateStr, guesses, status }) {
  const result = status === 'won' ? guesses.length : 'X';
  const tier = shabdalTier(status === 'won', guesses.length);
  const cfg = TIER_CONFIG[tier];
  let text = shareHeader(GAME_ID_SHABDAL, gameNumber, dateStr, tier) +
             `${result}/6\n\n`;

  for (const guess of guesses) {
    let row = '';
    for (const color of guess.colors) {
      if (color === 'green') row += '🟩';
      else if (color === 'orange') row += '🟨';
      else row += '⬛';
    }
    text += row + '\n';
  }

  text += shareFooter(GAME_ID_SHABDAL);
  return text;
}
