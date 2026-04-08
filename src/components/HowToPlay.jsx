import Modal from './Modal.jsx';

export default function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="How to Play">
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p>
          <strong className="text-gray-900 dark:text-white">Chainword</strong> is a daily
          word ladder puzzle. Connect the <span className="font-semibold text-indigo-600 dark:text-indigo-400">START</span> word
          to the <span className="font-semibold text-emerald-600 dark:text-emerald-400">END</span> word
          by changing one letter at a time.
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

        <ul className="space-y-2 list-disc list-inside">
          <li>Every step must be a valid English word.</li>
          <li>You can only change <strong>one letter</strong> per step.</li>
          <li>The <strong>fewer steps</strong>, the better your score.</li>
          <li>Each puzzle has a <strong>par</strong> (optimal number of steps).</li>
        </ul>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-gray-900 dark:text-white">Scoring</p>
          <p>⭐⭐⭐ Optimal (par or better)</p>
          <p>⭐⭐ Great (+1 step over par)</p>
          <p>⭐ Good (+2 steps over par)</p>
          <p>Completed (+3 or more steps)</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-gray-900 dark:text-white">Tile colours</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600"></div>
            <span>Start word</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-400"></div>
            <span>Letter you changed in this step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-600"></div>
            <span>Letter unchanged from previous step</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-500"></div>
            <span>End word (your goal)</span>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-xs">
          A new puzzle is released every day at <strong>12:00 AM IST</strong>.
          Sign in with Google to save your progress to the cloud and compete with friends!
        </p>
      </div>
    </Modal>
  );
}
