import { formatDate } from './wordUtils.js';
import { chainwordTier, squaresTier, TIER_CONFIG } from './awards.js';
import { SLOT_MULTIPLIERS } from '../games/tiles/hooks/useTiles.js';

// Build a shareable text without revealing the actual words used
export function buildShareText({ gameNumber, dateStr, start, end, userSteps, parSteps, chain, hintsUsed, gaveUp }) {
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
    `Chainword #${gameNumber} 🔗\n` +
    `${formatDate(dateStr)}  •  ${start.toUpperCase()} → ${end.toUpperCase()}\n` +
    `${cfg.emoji}  ${label}  (${stepInfo})` +
    chainViz +
    `\n\nPlay at https://www.chainword.in`
  );
}

export function buildSquaresShareText({ gameNumber, dateStr, hintedCorners, square }) {
  const [tl, tr, bl, br] = hintedCorners;
  const ce = (h) => h ? '🟥' : '🟩';
  const hintsUsed = hintedCorners.filter(Boolean).length;
  const tier = squaresTier(hintsUsed);
  const cfg = TIER_CONFIG[tier];
  const label = hintsUsed === 0 ? 'Perfect!' : hintsUsed === 1 ? 'Great!' : 'Completed';

  let grid;
  if (square) {
    const [top, left, right, bottom] = square;
    const u = (s) => s.toUpperCase();
    grid =
      `${ce(tl)} ${u(top[1])} ${u(top[2])} ${ce(tr)}\n` +
      `${u(left[1])}` + "\u00A0".repeat(6) + `${u(right[1])}\n` +
      `${u(left[2])}` + "\u00A0".repeat(6) + `${u(right[2])}\n` +
      `${ce(bl)} ${u(bottom[1])} ${u(bottom[2])} ${ce(br)}`;
  } else {
    grid = `${ce(tl)}${ce(tr)}\n${ce(bl)}${ce(br)}`;
  }

  return (
    `Squares #${gameNumber} 🔲\n` +
    `${formatDate(dateStr)}\n` +
    `${cfg.emoji}  ${label}\n` +
    `${grid}\n` +
    `\nPlay at https://www.chainword.in`
  );
}

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

export function buildTilesShareText({ gameNumber, dateStr, bestScore, optimalScore, bestWord }) {
  const isOptimal = bestScore >= optimalScore;
  const tier = isOptimal ? 'gold' : (optimalScore > 0 && bestScore / optimalScore >= 0.75) ? 'silver' : 'bronze';
  const cfg = TIER_CONFIG[tier];
  const label = isOptimal ? 'Optimal!' : cfg.label;

  // Visual: show multiplier squares for the 4 slots
  const slotViz = SLOT_MULTIPLIERS.map(m => m === 3 ? '🟥' : m === 2 ? '🟦' : '⬜').join('');

  return (
    `Tiles #${gameNumber} 🎯\n` +
    `${formatDate(dateStr)}\n` +
    `${cfg.emoji}  ${label}  (${bestScore} / ${optimalScore} pts)\n` +
    `${slotViz}  ${bestWord}\n` +
    `\nPlay at https://www.chainword.in`
  );
}

export function build4WordShareText({ gameNumber, dateStr, guesses, status }) {
  const result = status === 'won' ? guesses.length : 'X';
  let text = `4word #${gameNumber} 🔤\n${formatDate(dateStr)}  •  ${result}/6\n\n`;

  for (const guess of guesses) {
    let row = '';
    for (const color of guess.colors) {
      if (color === 'green') row += '🟩';
      else if (color === 'orange') row += '🟨';
      else row += '⬛';
    }
    text += row + '\n';
  }

  text += `\nPlay at https://www.chainword.in/`;
  return text;
}
