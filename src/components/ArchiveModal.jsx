import { useState } from 'react';
import Modal from './Modal.jsx';

const BASE_DATE_STR = '2026-04-12'; // game #1
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_ABBR = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getTodayIST() {
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + istOffset).toISOString().split('T')[0];
}

function toEpochDay(dateStr) {
  return Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / (24 * 60 * 60 * 1000));
}

function getPlayStatus(dateStr, activeGame, hardMode) {
  try {
    if (activeGame === 'chainword') {
      const key = hardMode ? `${dateStr}_hard` : dateStr;
      const all = JSON.parse(localStorage.getItem('chainword_progress') || '{}');
      const entry = all[key];
      if (entry?.status === 'won' || entry?.status === 'gaveUp') return 'finished';
      if (entry?.chain?.length > 1) return 'started';
    } else if (activeGame === 'word4') {
      const data = JSON.parse(localStorage.getItem(`chainword_wordle_${dateStr}`) || 'null');
      if (data?.status === 'won' || data?.status === 'lost') return 'finished';
      if (data?.guesses?.length > 0) return 'started';
    } else if (activeGame === 'tiles') {
      const data = JSON.parse(localStorage.getItem(`chainword_tiles_${dateStr}`) || 'null');
      if (data?.submissions?.length > 0) return 'finished';
    } else if (activeGame === 'squares') {
      const data = JSON.parse(localStorage.getItem(`chainword_squares_${dateStr}`) || 'null');
      if (data?.status === 'won') return 'finished';
      if (data?.attempts > 0) return 'started';
    }
  } catch {}
  return 'unplayed';
}

export default function ArchiveModal({ open, onClose, activeGame, hardMode, selectedDate, onSelectDate }) {
  const today = getTodayIST();
  const [viewYear, setViewYear] = useState(() => parseInt(today.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => parseInt(today.slice(5, 7)) - 1);

  const baseEpochDay = toEpochDay(BASE_DATE_STR);
  const todayEpochDay = toEpochDay(today);

  const baseYear = parseInt(BASE_DATE_STR.slice(0, 4));
  const baseMonth = parseInt(BASE_DATE_STR.slice(5, 7)) - 1;
  const todayYear = parseInt(today.slice(0, 4));
  const todayMonth = parseInt(today.slice(5, 7)) - 1;

  const canGoPrev = viewYear > baseYear || (viewYear === baseYear && viewMonth > baseMonth);
  const canGoNext = viewYear < todayYear || (viewYear === todayYear && viewMonth < todayMonth);

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build calendar cells (null = empty leading cell)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );
  }

  const effectiveSelected = selectedDate || today;

  return (
    <Modal open={open} onClose={onClose} title="Archive">
      <div className="space-y-3">

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-25 transition-colors text-gray-700 dark:text-gray-300"
          >
            ‹
          </button>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-25 transition-colors text-gray-700 dark:text-gray-300"
          >
            ›
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 text-center">
          {DAY_ABBR.map(d => (
            <div key={d} className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((ds, i) => {
            if (!ds) return <div key={`e${i}`} />;

            const epochDay = toEpochDay(ds);
            const isDisabled = epochDay < baseEpochDay || epochDay > todayEpochDay;
            const isToday = ds === today;
            const isSelected = ds === effectiveSelected;
            const status = isDisabled ? null : getPlayStatus(ds, activeGame, hardMode);
            const dayNum = parseInt(ds.slice(8));

            const colorClass = isDisabled
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : status === 'finished'
                ? 'bg-emerald-200 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 hover:brightness-95'
                : status === 'started'
                  ? 'bg-orange-200 dark:bg-orange-800/60 text-orange-800 dark:text-orange-200 hover:brightness-95'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:brightness-95';

            const ringClass = isSelected
              ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-1 dark:ring-offset-gray-900'
              : isToday
                ? 'ring-2 ring-gray-500 dark:ring-gray-400 ring-offset-1 dark:ring-offset-gray-900'
                : '';

            return (
              <button
                key={ds}
                disabled={isDisabled}
                onClick={() => { onSelectDate(ds); onClose(); }}
                className={`flex items-center justify-center h-9 rounded-lg text-xs font-bold transition-all ${colorClass} ${ringClass}`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Today shortcut — only shown when not already on today */}
        {selectedDate && selectedDate !== today && (
          <button
            onClick={() => { onSelectDate(today); onClose(); }}
            className="w-full py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800"
          >
            Back to today
          </button>
        )}

        <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-200 dark:bg-emerald-800/60 inline-block" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-800/60 inline-block" /> Started
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/40 inline-block" /> Not played
          </span>
        </div>

      </div>
    </Modal>
  );
}
