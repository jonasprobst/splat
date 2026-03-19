/**
 * Main entry point: screen routing, event wiring, audio unlock.
 */

import { initScreens, showScreen } from './ui.js';
import { initSpeech } from './speech.js';
import { initAudio, setSoundEnabled } from './sound.js';
import { loadSettings, saveSettings, renderSettings } from './settings.js';
import { startGame, replaySyllable } from './game.js';

let settings = null;

function init() {
  initScreens();
  settings = loadSettings();

  // Title screen buttons
  document.getElementById('btn-play').addEventListener('click', onPlay);
  document.getElementById('btn-settings').addEventListener('click', onOpenSettings);

  // Game screen
  document.getElementById('btn-replay').addEventListener('click', () => replaySyllable());

  // Victory screen buttons
  document.getElementById('btn-play-again').addEventListener('click', onPlay);
  document.getElementById('btn-home').addEventListener('click', () => showScreen('screen-title'));

  // Settings screen
  document.getElementById('btn-back').addEventListener('click', onCloseSettings);

  // Render settings UI
  renderSettingsUI();
}

/** Unlock audio and start game. */
function onPlay() {
  // Unlock audio on first user gesture
  initAudio();
  initSpeech();
  setSoundEnabled(settings.soundEnabled);

  showScreen('screen-game');
  startGame(settings);
}

/** Open settings screen. */
function onOpenSettings() {
  renderSettingsUI();
  showScreen('screen-settings');
}

/** Close settings and return to title. */
function onCloseSettings() {
  showScreen('screen-title');
}

/** Render settings into the container. */
function renderSettingsUI() {
  const container = document.getElementById('settings-content');
  renderSettings(container, { ...settings }, (updated) => {
    settings = updated;
    setSoundEnabled(settings.soundEnabled);
    saveSettings(settings);
  });
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Boot
init();
