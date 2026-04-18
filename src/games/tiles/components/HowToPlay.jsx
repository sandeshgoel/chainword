import Modal from '../../../components/Modal.jsx';

export default function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="🎯 How to Play Tiles">
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p>
          You're dealt <strong>7 Scrabble tiles</strong>. Pick any 4 to form the
          highest-scoring valid word.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
          <p className="font-semibold text-gray-900 dark:text-white">The 4 slots have multipliers:</p>
          <div className="flex gap-2 justify-center">
            {[
              { label: '×1', bg: 'bg-gray-200 dark:bg-gray-600', text: 'text-gray-700 dark:text-gray-200' },
              { label: '×2', sub: 'DL', bg: 'bg-sky-200 dark:bg-sky-700', text: 'text-sky-800 dark:text-sky-100' },
              { label: '×1', bg: 'bg-gray-200 dark:bg-gray-600', text: 'text-gray-700 dark:text-gray-200' },
              { label: '×3', sub: 'TL', bg: 'bg-orange-200 dark:bg-orange-700', text: 'text-orange-800 dark:text-orange-100' },
            ].map(({ label, sub, bg, text }, i) => (
              <div key={i} className={`w-12 h-12 rounded-lg ${bg} flex flex-col items-center justify-center`}>
                <span className={`font-extrabold text-sm ${text}`}>{label}</span>
                {sub && <span className={`text-[9px] font-bold ${text}`}>{sub}</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">Slot 2 doubles, slot 4 triples the letter's point value.</p>
        </div>

        <ul className="space-y-1 list-disc list-inside">
          <li>Tap a tile to place it in the next open slot.</li>
          <li>Tap a slot to remove the tile back to your hand.</li>
          <li>You can submit as many times as you like — only your <strong>best score</strong> counts.</li>
          <li>Try to beat the <strong>optimal score</strong> shown after each submission.</li>
        </ul>

        <p className="text-gray-500 dark:text-gray-400 text-xs">
          New tiles every day at <strong>12:00 AM IST</strong>.
        </p>
      </div>
    </Modal>
  );
}
