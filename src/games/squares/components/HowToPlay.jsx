import Modal from '../../../components/Modal.jsx';

export default function HowToPlay({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="🔲 How to Play Squares">
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
        <p>
          Four 4-letter words form a <strong>square frame</strong>.
          The middle letters of each word are shown — you must guess the
          <strong> 4 corner letters</strong>.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">How the square works:</p>
          <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-xs font-bold text-center">
            <div className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-100">?</div>
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">A</div>
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">T</div>
            <div className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-100">?</div>
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">I</div>
            <div className="w-8 h-8" />
            <div className="w-8 h-8" />
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">A</div>
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">N</div>
            <div className="w-8 h-8" />
            <div className="w-8 h-8" />
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">K</div>
            <div className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-100">?</div>
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">A</div>
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">N</div>
            <div className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-100">?</div>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            The <span className="text-amber-600 dark:text-amber-400 font-semibold">amber</span> corners are shared between two words each.
          </p>
        </div>

        <ul className="space-y-1 list-disc list-inside">
          <li>Type the <strong>4 corner letters</strong> (TL, TR, BL, BR).</li>
          <li>All 4 formed words (top, bottom, left, right) must be valid.</li>
          <li>Invalid edges are highlighted in <span className="text-red-500 font-semibold">red</span> after each attempt.</li>
          <li>There may be more than one valid solution.</li>
        </ul>

        <p className="text-gray-500 dark:text-gray-400 text-xs">
          New puzzle every day at <strong>12:00 AM IST</strong>.
        </p>
      </div>
    </Modal>
  );
}
