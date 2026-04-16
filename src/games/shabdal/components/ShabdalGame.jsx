export default function ShabdalGame() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="text-6xl">अ</div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Shabdal</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed">
        Guess the Hindi word in 6 tries. A Wordle experience in Devanagari script.
      </p>
      <span className="mt-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-bold tracking-wide">
        Coming Soon
      </span>
    </div>
  );
}
