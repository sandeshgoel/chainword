import { TIER_UNSOLVED, TIER_CONFIG } from '../utils/awards.js';

export default function ResultBanner({ tier, title, details, children }) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG[TIER_UNSOLVED];
  return (
    <div className={`rounded-2xl p-5 text-center space-y-3 border ${cfg.bg} ${cfg.border}`}>
      <div className="text-4xl">{cfg.emoji}</div>
      <p className={`font-bold text-lg ${cfg.text}`}>{title ?? cfg.label}</p>
      {details && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{details}</p>
      )}
      {children}
    </div>
  );
}
