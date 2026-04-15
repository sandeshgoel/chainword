import Modal from '../../../components/Modal.jsx';

function ChainwordHelp() {
  return (
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
  );
}

function FourWordHelp() {
  return (
    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
      <p>
        Guess the secret <strong>5-letter word</strong> in 6 tries.
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
  );
}

function TilesHelp() {
  return (
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
  );
}

function SquaresHelp() {
  return (
    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
      <p>
        Four 4-letter words form a <strong>square frame</strong>.
        The middle letters of each word are shown — you must guess the
        <strong> 4 corner letters</strong>.
      </p>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">How the square works:</p>
        <div className="grid grid-cols-4 gap-1 w-fit mx-auto text-xs font-bold text-center">
          {/* Row 0: TL corner, top mid ×2, top end, TR corner */}
          <div className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-100">?</div>
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">A</div>
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">T</div>
          <div className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-100">?</div>
          {/* Row 1: left mid, empty, empty, right mid */}
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">I</div>
          <div className="w-8 h-8" />
          <div className="w-8 h-8" />
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">A</div>
          {/* Row 2: left mid, empty, empty, right mid */}
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">N</div>
          <div className="w-8 h-8" />
          <div className="w-8 h-8" />
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">K</div>
          {/* Row 3: BL corner, bot mid ×2, bot end, BR corner */}
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
  );
}

const TITLES = {
  chainword: '🔗 How to Play Chainword',
  '4word':   '🔤 How to Play 4word',
  tiles:     '🎯 How to Play Tiles',
  squares:   '🔲 How to Play Squares',
};

export default function HowToPlay({ open, onClose, activeGame = 'chainword' }) {
  return (
    <Modal open={open} onClose={onClose} title={TITLES[activeGame] ?? 'How to Play'}>
      {activeGame === 'chainword' && <ChainwordHelp />}
      {activeGame === '4word'    && <FourWordHelp />}
      {activeGame === 'tiles'    && <TilesHelp />}
      {activeGame === 'squares'  && <SquaresHelp />}
    </Modal>
  );
}
