import { getStars, getScoreLabel } from './wordUtils.js';

// Build a shareable text without revealing the actual words used
export function buildShareText({ gameNumber, dateStr, start, end, userSteps, parSteps, chain, gaveUp }) {
  const stars = gaveUp ? 0 : getStars(userSteps, parSteps);
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

  const stepInfo = gaveUp
    ? `DNF (par: ${parSteps} step${parSteps !== 1 ? 's' : ''})`
    : `${userSteps}/${parSteps} step${parSteps !== 1 ? 's' : ''}`;

  return (
    `Chainword #${gameNumber} 🔗\n` +
    `${dateStr}  •  ${start.toUpperCase()} → ${end.toUpperCase()}\n` +
    `${starEmojis}  ${label}  (${stepInfo})` +
    chainViz +
    `\n\nPlay at chainword.app`
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
