import { TIER_UNSOLVED, TIER_CONFIG } from '../utils/awards.js';

export default function ResultBanner({ tier, title, details, children }) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG[TIER_UNSOLVED];
  return (
    <div className={`w-full rounded-2xl p-5 text-center space-y-3 border ${cfg.bg} ${cfg.border}`}>
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-white dark:bg-white/90 shadow-sm flex items-center justify-center text-3xl">
          {cfg.emoji}
        </div>
      </div>
      <p className={`font-bold text-lg ${cfg.text}`}>{title ?? cfg.label}</p>
      {details && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{details}</p>
      )}
      {children}
    </div>
  );
}
