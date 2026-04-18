import Modal from '../../../components/Modal.jsx';

export default function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="🔗 How to Play Chainword">
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p>
          Connect the <span className="font-semibold text-indigo-600 dark:text-indigo-400">START</span> word
          to the <span className="font-semibold text-emerald-600 dark:text-emerald-400">END</span> word
          by changing one letter at a time. Every step must be a valid word.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-gray-900 dark:text-white">Example: COLD → WARM</p>
          <div className="flex flex-col gap-1 font-mono text-base">
            {[
              { word: 'COLD', note: 'start', color: 'text-indigo-600 dark:text-indigo-400' },
              { word: 'CORD', note: '(L→R)', color: 'text-amber-600 dark:text-amber-400' },
              { word: 'WORD', note: '(C→W)', color: 'text-amber-600 dark:text-amber-400' },
              { word: 'WARD', note: '(O→A)', color: 'text-amber-600 dark:text-amber-400' },
              { word: 'WARM', note: '(D→M) end', color: 'text-emerald-600 dark:text-emerald-400' },
            ].map(({ word, note, color }) => (
              <div key={word} className="flex items-center gap-2">
                <span className={`font-extrabold ${color}`}>{word}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{note}</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="space-y-1 list-disc list-inside">
          <li>Change <strong>exactly one letter</strong> per step.</li>
          <li>Every word must be valid.</li>
          <li>Fewer steps = better score.</li>
          <li>Use a <strong>💡 Hint</strong> to reveal the next optimal word (+1 to score).</li>
        </ul>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 space-y-1">
          <p className="font-semibold text-gray-900 dark:text-white">Scoring</p>
          <p>⭐⭐⭐ Optimal</p>
          <p>⭐⭐ +1 step</p>
          <p>⭐ +2 steps</p>
          <p>Completed: +3 or more</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 space-y-1.5">
          <p className="font-semibold text-gray-900 dark:text-white">Tile colours</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 shrink-0" />
            <span>Start word</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-400 shrink-0" />
            <span>Changed letter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-600 shrink-0" />
            <span>Unchanged letter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 shrink-0" />
            <span>End word (goal)</span>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-xs">
          New puzzle every day at <strong>12:00 AM IST</strong>.
        </p>
      </div>
    </Modal>
  );
}
