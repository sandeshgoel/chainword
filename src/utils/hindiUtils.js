export const HINDI_VOWELS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'];
export const HINDI_CONSONANTS = ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'];

export const MATRAS = {
  'आ': 'ा',
  'इ': 'ि',
  'ई': 'ी',
  'उ': 'ु',
  'ऊ': 'ू',
  'ए': 'े',
  'ऐ': 'ै',
  'ओ': 'ो',
  'औ': 'ौ'
  // 'अ' has no explicit matra, it is inherently present in an unmodified consonant.
};

/**
 * Transforms an array of independent Devanagari characters into a properly formed Hindi string.
 * It applies vowel signs (matras) to preceding consonants instead of keeping them independent.
 */
export function formHindiWord(letters) {
  let result = '';
  // Support both strings and arrays
  const charArray = Array.isArray(letters) ? letters : (letters || '').split(/(?:)/);
  
  for (let i = 0; i < charArray.length; i++) {
    const char = charArray[i];
    
    // If it's a vowel that has a matra
    if (MATRAS[char]) {
      // Apply matra if preceded by a consonant
      if (i > 0 && HINDI_CONSONANTS.includes(charArray[i - 1])) {
        result += MATRAS[char];
      } else {
        result += char;
      }
    } else if (char === 'अ') {
      // Inherent 'A' sound doesn't add a visible matra, unless it's preceded by a vowel or isolated
      if (i > 0 && HINDI_CONSONANTS.includes(charArray[i - 1])) {
        // Do nothing (implicit vowel present in devanagari consonant)
      } else {
        result += char;
      }
    } else {
      // Just a consonant or another character
      result += char;
    }
  }
  
  return result;
}
