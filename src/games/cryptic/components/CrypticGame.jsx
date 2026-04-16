export default function CrypticGame() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="text-6xl">🧩</div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Cryptic</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
        Solve a daily cryptic crossword clue. Wordplay, anagrams, and hidden answers await.
      </p>
      <span className="mt-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-bold tracking-wide">
        Coming Soon
      </span>
    </div>
  );
}
