/**
 * German speech: pre-generated audio files with SpeechSynthesis fallback.
 */

let germanVoice = null;
let voiceReady = false;
let audioCache = {};

// Start looking for fallback voices immediately
findAndCacheVoice();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.addEventListener('voiceschanged', findAndCacheVoice);
}

/** Find the best German voice for fallback. */
function findAndCacheVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;

  germanVoice = voices.find(v => v.lang === 'de-DE')
    || voices.find(v => v.lang.startsWith('de'))
    || null;
  voiceReady = true;
}

/** Initialize speech (call from user gesture). */
export function initSpeech() {
  findAndCacheVoice();
}

/**
 * Speak a syllable in German.
 * Tries pre-generated audio file first, falls back to SpeechSynthesis.
 * Returns a Promise that resolves when speaking ends.
 */
export function speak(syllable) {
  const filename = syllable.toLowerCase();
  const path = `sounds/syllables/${filename}.m4a`;

  // Try pre-generated file first
  return playFile(path).catch(() => speakFallback(syllable));
}

/** Play a pre-generated audio file. */
function playFile(path) {
  return new Promise((resolve, reject) => {
    // Reuse cached Audio elements
    if (!audioCache[path]) {
      audioCache[path] = new Audio(path);
    }

    const audio = audioCache[path];
    audio.currentTime = 0;

    audio.onended = resolve;
    audio.onerror = reject;

    audio.play().catch(reject);
  });
}

/** Fallback: use browser SpeechSynthesis. */
function speakFallback(syllable) {
  return new Promise((resolve) => {
    speechSynthesis.cancel();

    if (!voiceReady) findAndCacheVoice();

    // Lowercase to prevent abbreviation spelling
    const utterance = new SpeechSynthesisUtterance(syllable.toLowerCase());
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.onend = resolve;
    utterance.onerror = resolve;

    speechSynthesis.speak(utterance);
  });
}
