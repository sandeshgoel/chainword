import { getStars, getScoreLabel, formatDate } from './wordUtils.js';

// Build a shareable text without revealing the actual words used
export function buildShareText({ gameNumber, dateStr, start, end, userSteps, parSteps, chain, hintsUsed, gaveUp }) {
  const stars = gaveUp ? 0 : getStars(userSteps + (hintsUsed || 0), parSteps);
  const starEmojis = gaveUp ? '❌' : '⭐'.repeat(stars) + (stars < 3 ? '☆'.repeat(3 - stars) : '');
  const label = gaveUp ? 'Gave up' : getScoreLabel(stars);

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
  const parGuesses = parSteps - 1;
  const hintStr = (hintsUsed || 0) > 0 ? ` 💡${hintsUsed}` : '';
  const stepInfo = gaveUp
    ? `DNF (par: ${parGuesses} guess${parGuesses !== 1 ? 'es' : ''})`
    : `${guesses}/${parGuesses} guess${parGuesses !== 1 ? 'es' : ''}${hintStr}`;

  return (
    `Chainword #${gameNumber} 🔗\n` +
    `${formatDate(dateStr)}  •  ${start.toUpperCase()} → ${end.toUpperCase()}\n` +
    `${starEmojis}  ${label}  (${stepInfo})` +
    chainViz +
    `\n\nPlay at https://chainword-five.vercel.app`
  );
}

export function buildSquaresShareText({ gameNumber, dateStr, hintedCorners }) {
  // 2×2 grid: TL TR / BL BR
  // 🟩 = guessed correctly, 🟥 = revealed via hint
  const [tl, tr, bl, br] = hintedCorners;
  const row1 = (tl ? '🟥' : '🟩') + (tr ? '🟥' : '🟩');
  const row2 = (bl ? '🟥' : '🟩') + (br ? '🟥' : '🟩');
  const hintsUsed = hintedCorners.filter(Boolean).length;
  const stars = Math.max(0, 3 - hintsUsed);
  const starEmojis = '⭐'.repeat(stars) + (stars < 3 ? '☆'.repeat(3 - stars) : '');
  const label = stars === 3 ? 'Perfect!' : stars === 2 ? 'Great!' : stars === 1 ? 'Good!' : 'Completed';

  return (
    `Squares #${gameNumber} 🔲\n` +
    `${formatDate(dateStr)}\n` +
    `${starEmojis}  ${label}\n` +
    `${row1}\n${row2}\n` +
    `\nPlay at https://chainword-five.vercel.app`
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

export function buildWordleShareText({ gameNumber, dateStr, guesses, status }) {
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

  text += `\nPlay at https://chainword-five.vercel.app/`;
  return text;
}
