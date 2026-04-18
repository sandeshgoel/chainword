import Modal from '../../../components/Modal.jsx';

export default function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="🔤 How to Play word4">
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p>
          Guess the secret <strong>4-letter word</strong> in 6 tries.
          Each guess must be a valid word.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-900 dark:text-white">After each guess the tiles change colour:</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold text-lg shrink-0">W</div>
            <span><strong>Green</strong> — right letter, right position.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-white font-extrabold text-lg shrink-0">I</div>
            <span><strong>Yellow</strong> — letter is in the word, but wrong position.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center text-white font-extrabold text-lg shrink-0">X</div>
            <span><strong>Gray</strong> — letter is not in the word.</span>
          </div>
        </div>

        <ul className="space-y-1 list-disc list-inside">
          <li>You have <strong>6 attempts</strong> to find the word.</li>
          <li>Fewer guesses = better score.</li>
        </ul>

        <p className="text-gray-500 dark:text-gray-400 text-xs">
          New puzzle every day at <strong>12:00 AM IST</strong>.
        </p>
      </div>
    </Modal>
  );
}
