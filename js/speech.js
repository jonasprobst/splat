/**
 * German SpeechSynthesis wrapper.
 */

let germanVoice = null;
let voiceReady = false;

// Start looking for voices immediately — they may load async
findAndCacheVoice();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.addEventListener('voiceschanged', findAndCacheVoice);
}

/** Find the best German voice available. */
function findAndCacheVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;

  germanVoice = voices.find(v => v.lang === 'de-DE')
    || voices.find(v => v.lang.startsWith('de'))
    || null;
  voiceReady = true;
}

/** Initialize speech (call from user gesture to ensure voices are loaded). */
export function initSpeech() {
  findAndCacheVoice();
}

/**
 * Speak a syllable in German.
 * Returns a Promise that resolves when speaking ends.
 */
export function speak(syllable) {
  return new Promise((resolve) => {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Re-check voices in case they weren't ready before
    if (!voiceReady) findAndCacheVoice();

    // Always pass lowercase to prevent SpeechSynthesis from spelling
    // uppercase as abbreviations (e.g. "MO" → "M-O"). Display case is unaffected.
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
