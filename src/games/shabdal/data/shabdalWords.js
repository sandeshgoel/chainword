// Dummy word list for Shabdal (Hindi Wordle)
// Each word is stored as an array of 4 independent Devanagari letters
// (consonants and vowels before combining into matras)

export const SHABDAL_WORDS = [
  ['न', 'आ', 'म', 'अ'],   // नाम (name)
  ['क', 'आ', 'म', 'अ'],   // काम (work)
  ['ग', 'आ', 'न', 'अ'],   // गान (song)
  ['द', 'आ', 'न', 'अ'],   // दान (donation)
  ['ज', 'आ', 'न', 'अ'],   // जान (life/know)
  ['म', 'आ', 'न', 'अ'],   // मान (honour)
  ['ह', 'आ', 'थ', 'अ'],   // हाथ (hand)
  ['स', 'आ', 'थ', 'अ'],   // साथ (together)
  ['ब', 'आ', 'त', 'अ'],   // बात (talk)
  ['र', 'आ', 'त', 'अ'],   // रात (night)
  ['म', 'इ', 'त', 'अ'],   // मित (friend, shortened)
  ['क', 'इ', 'त', 'अ'],   // कित (some)
  ['न', 'इ', 'त', 'अ'],   // नित (always)
  ['प', 'आ', 'न', 'अ'],   // पान (betel leaf)
  ['ज', 'ल', 'अ', 'द'],   // जलद (cloud)
  ['ग', 'र', 'म', 'अ'],   // गरम (hot)
  ['क', 'ल', 'म', 'अ'],   // कलम (pen)
  ['म', 'न', 'अ', 'न'],   // मनन (contemplation)
  ['ध', 'न', 'अ', 'म'],   // just for testing
  ['स', 'न', 'अ', 'म'],   // just for testing
];

// A rotating daily target (index based on date)
export function getDailyWord(overrideDateStr = null) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  let now;
  if (overrideDateStr) {
    now = new Date(overrideDateStr + 'T00:00:00Z').getTime() - istOffset;
  } else {
    now = Date.now();
  }
  
  const nowIST = now + istOffset;
  const dateStr = new Date(nowIST).toISOString().split('T')[0];
  const todayISTStart = new Date(dateStr + 'T00:00:00Z').getTime();
  
  const epoch = new Date('2026-04-16T00:00:00Z').getTime();
  const dayIndex = Math.floor((todayISTStart - epoch) / 86400000);
  const safeIndex = Math.max(0, dayIndex);
  const gameNumber = safeIndex + 1;
  const target = SHABDAL_WORDS[safeIndex % SHABDAL_WORDS.length];

  return { target, dateStr, gameNumber };
}
