/**
 * Syllable generation from consonant + vowel combinations.
 */

export const CONSONANTS = [
  'B', 'Ch', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
  'N', 'P', 'Qu', 'R', 'S', 'Sch', 'St', 'T', 'W', 'Z'
];

export const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export const CASE_MODES = {
  upper: 'upper',
  lower: 'lower',
  capitalize: 'capitalize'
};

/** Build all possible CV syllables from selected consonants and vowels. */
export function buildPool(selectedConsonants, selectedVowels) {
  const pool = [];
  for (const c of selectedConsonants) {
    for (const v of selectedVowels) {
      pool.push(c + v);
    }
  }
  return pool;
}

/** Apply case mode to a syllable. Handles digraphs correctly. */
export function applyCase(syllable, caseMode) {
  switch (caseMode) {
    case CASE_MODES.upper:
      return syllable.toUpperCase();
    case CASE_MODES.lower:
      return syllable.toLowerCase();
    case CASE_MODES.capitalize:
      // First letter uppercase, rest lowercase
      return syllable.charAt(0).toUpperCase() + syllable.slice(1).toLowerCase();
    default:
      return syllable;
  }
}

/** Fisher-Yates shuffle (returns new array). */
export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick syllables for one round.
 * Returns { correct, all } where all includes correct + distractors, shuffled.
 * Fly count is reduced if pool is too small.
 */
export function pickRoundSyllables(pool, desiredFlyCount, caseMode) {
  const count = Math.min(desiredFlyCount, pool.length);
  const picked = shuffleArray(pool).slice(0, count);
  const correct = picked[0];

  return {
    correct: applyCase(correct, caseMode),
    all: shuffleArray(picked).map(s => applyCase(s, caseMode))
  };
}

/** Get a random fly count between 4 and 6. */
export function randomFlyCount() {
  return 4 + Math.floor(Math.random() * 3); // 4, 5, or 6
}
