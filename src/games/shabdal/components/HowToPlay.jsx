import Modal from '../../../components/Modal.jsx';
import { MATRAS } from '../../../utils/hindiUtils.js';

const FONT = { fontFamily: 'Noto Sans Devanagari, sans-serif' };

function ExTile({ consonant, vowel, color }) {
  const matra = MATRAS[vowel] || '';
  const display = consonant ? (matra ? consonant + matra : consonant) : (matra || '');

  let cls = 'w-11 h-11 rounded-lg border-2 flex items-center justify-center text-xl font-extrabold shrink-0 ';
  if (color === 'green')  cls += 'bg-green-500  border-green-500  text-white';
  else if (color === 'orange') cls += 'bg-orange-400 border-orange-400 text-white';
  else if (color === 'gray')   cls += 'bg-gray-400   border-gray-400   text-white';
  else cls += 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-400';

  return <div className={cls} style={FONT}>{display}</div>;
}

function ExRow({ consonants, vowels, colors, label }) {
  const word = consonants
    .map((c, i) => { const m = MATRAS[vowels[i]] || ''; return c ? (m ? c + m : c) : ''; })
    .join('');
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        {vowels.map((v, i) => (
          <ExTile key={i} consonant={consonants[i] || null} vowel={v} color={colors?.[i]} />
        ))}
      </div>
      {word && (
        <span className="text-lg font-bold text-gray-700 dark:text-gray-200 ml-1" style={FONT}>{word}</span>
      )}
      {label && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{label}</span>
      )}
    </div>
  );
}

export default function ShabdalHowToPlay({ open, onClose }) {
  // Example target: भगवान  → consonants [भ,ग,व,न], vowels [अ,अ,आ,अ]
  const vowels = ['अ', 'अ', 'आ', 'अ'];

  return (
    <Modal open={open} onClose={onClose} title="🕉️ How to Play Shabdal">
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">

        <p>
          Guess the secret Hindi word in <strong>6 tries</strong>. Each word has exactly
          <strong> 4 syllables</strong>. You only need to guess the <strong>consonants</strong> — the
          vowels are shown as hints inside each tile.
        </p>

        {/* Empty row demo */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wide">
            Vowel hints are always visible
          </p>
          <ExRow consonants={['','','','']} vowels={vowels} label="— vowel matras shown before you type" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The <strong>ा</strong> matra in slot 3 tells you that syllable has the vowel <span style={FONT}>आ</span>.
            Empty slots with <span style={FONT}>अ</span> show nothing (the inherent vowel).
          </p>
        </div>

        {/* Color explanations */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wide">
            After each guess, tiles reveal how close you were
          </p>

          {/* Green example */}
          <div className="flex items-center gap-3">
            <ExTile consonant="व" vowel="आ" color="green" />
            <span><strong>Green</strong> — right consonant, right position.</span>
          </div>

          {/* Orange example */}
          <div className="flex items-center gap-3">
            <ExTile consonant="ग" vowel="आ" color="orange" />
            <span><strong>Orange</strong> — consonant is in the word, but wrong position.</span>
          </div>

          {/* Gray example */}
          <div className="flex items-center gap-3">
            <ExTile consonant="म" vowel="अ" color="gray" />
            <span><strong>Gray</strong> — consonant is not in the word at all.</span>
          </div>
        </div>

        {/* Full example */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wide">
            Example — target is <span style={FONT} className="text-base font-bold text-indigo-600 dark:text-indigo-400">भगवान</span>
          </p>
          <ExRow
            consonants={['म','भ','ग','न']}
            vowels={vowels}
            colors={['gray','orange','orange','green']}
          />
          <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-disc list-inside">
            <li><span style={FONT}>म</span> is gray — not in the word</li>
            <li><span style={FONT}>भ</span> is orange — in the word, but not in slot 2</li>
            <li><span style={FONT}>ग</span> is orange — in the word, but not in slot 3</li>
            <li><span style={FONT}>न</span> is green — correct!</li>
          </ul>
        </div>

        <ul className="space-y-1 list-disc list-inside">
          <li>Guesses must be <strong>valid Hindi words</strong>.</li>
          <li>The keyboard is colour-coded by consonant group (वर्ग).</li>
          <li>Fewer guesses = better score.</li>
        </ul>

        <p className="text-gray-500 dark:text-gray-400 text-xs">
          New puzzle every day at <strong>12:00 AM IST</strong>.
        </p>
      </div>
    </Modal>
  );
}
