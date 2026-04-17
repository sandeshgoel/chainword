import { useState } from 'react';
import Modal from '../../../components/Modal.jsx';
import { buildChainwordShareText, shareOrCopy } from '../../../utils/sharing.js';
import { chainwordTier, TIER_CONFIG } from '../../../utils/awards.js';

export default function ShareModal({ open, onClose, gameData }) {
  const [copied, setCopied] = useState(false);

  if (!gameData) return null;
  const { gameNumber, dateStr, start, end, userSteps, parSteps, chain, hintsUsed, gaveUp } = gameData;
  const text = buildChainwordShareText({ gameNumber, dateStr, start, end, userSteps, parSteps, chain, hintsUsed, gaveUp });

  async function handleShare() {
    await shareOrCopy(text, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const guesses = userSteps - 1;
  const tier = chainwordTier(!gaveUp, userSteps, hintsUsed || 0, parSteps);
  const cfg = TIER_CONFIG[tier];

  return (
    <Modal open={open} onClose={onClose} title="Share Your Result">
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 font-mono text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
          {text}
        </div>

        <button
          onClick={handleShare}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Result
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          The share text doesn't reveal your exact path — just the result!
        </p>
      </div>
    </Modal>
  );
}
