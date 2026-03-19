/**
 * Sound effects playback from audio files in /sounds/.
 */

let soundEnabled = true;
let audioContext = null;
let audioBuffers = {};
let audioUnlocked = false;

const SOUND_FILES = {
  splat: 'sounds/splat.mp3',
  buzz: 'sounds/buzz.mp3',
  victory: 'sounds/victory.mp3'
};

/** Initialize AudioContext (must be called from user gesture). */
export function initAudio() {
  if (audioContext) return audioContext;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Unlock on iOS by playing a silent buffer
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Preload all sound files
  preloadSounds();

  audioUnlocked = true;
  return audioContext;
}

/** Preload sound files into audio buffers. */
async function preloadSounds() {
  for (const [name, path] of Object.entries(SOUND_FILES)) {
    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      audioBuffers[name] = await audioContext.decodeAudioData(arrayBuffer);
    } catch {
      // Sound file not available — generate fallback
      audioBuffers[name] = generateFallback(name);
    }
  }
}

/** Generate a simple fallback sound if file is missing. */
function generateFallback(name) {
  if (!audioContext) return null;

  const sampleRate = audioContext.sampleRate;

  switch (name) {
    case 'splat': {
      // Noise burst with fast decay
      const length = sampleRate * 0.2;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 12) * 0.6;
      }
      return buffer;
    }
    case 'buzz': {
      // Short buzz tone
      const length = sampleRate * 0.15;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-(i / length) * 8);
        data[i] = Math.sin(2 * Math.PI * 180 * t + Math.sin(2 * Math.PI * 40 * t) * 3) * envelope * 0.4;
      }
      return buffer;
    }
    case 'victory': {
      // Ascending arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      const noteLen = sampleRate * 0.2;
      const length = noteLen * notes.length;
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      for (let n = 0; n < notes.length; n++) {
        for (let i = 0; i < noteLen; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-(i / noteLen) * 3);
          const idx = n * noteLen + i;
          data[idx] = Math.sin(2 * Math.PI * notes[n] * t) * envelope * 0.3;
        }
      }
      return buffer;
    }
    default:
      return null;
  }
}

/** Play a named sound effect. */
function playSound(name) {
  if (!soundEnabled || !audioContext || !audioBuffers[name]) return;

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers[name];
  source.connect(audioContext.destination);
  source.start(0);
}

export function playSplat() { playSound('splat'); }
export function playBuzz() { playSound('buzz'); }
export function playVictory() { playSound('victory'); }

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function isAudioUnlocked() {
  return audioUnlocked;
}
