/**
 * Game logic: round management, fly interaction, win condition.
 */

import { buildPool, pickRoundSyllables, randomFlyCount } from './syllables.js';
import { speak } from './speech.js';
import { playSplat, playBuzz, playVictory } from './sound.js';
import { createFly, positionFlies, animateSplat, animateEscape, fadeOutFlies, clearFlies } from './fly.js';
import { updateRoundCounter, showScreen, createConfetti, clearConfetti } from './ui.js';

const TOTAL_ROUNDS = 10;

let state = null;

/** Start a new game session. */
export function startGame(settings) {
  state = {
    pool: buildPool(settings.consonants, settings.vowels),
    caseMode: settings.caseMode,
    currentRound: 0,
    totalRounds: TOTAL_ROUNDS,
    correctSyllable: null,
    roundActive: false
  };

  clearConfetti(document.getElementById('confetti-container'));
  nextRound();
}

/** Advance to the next round. */
function nextRound() {
  state.currentRound++;

  if (state.currentRound > state.totalRounds) {
    victory();
    return;
  }

  updateRoundCounter(state.currentRound, state.totalRounds);

  const gameArea = document.getElementById('game-area');
  clearFlies(gameArea);

  const flyCount = randomFlyCount();
  const { correct, all } = pickRoundSyllables(state.pool, flyCount, state.caseMode);
  state.correctSyllable = correct;
  state.roundActive = true;

  // Create fly elements
  const flyElements = all.map(syllable => createFly(syllable, handleFlyTap));

  // Add to DOM first (so we can measure sizes for positioning)
  flyElements.forEach(f => gameArea.appendChild(f));

  // Position after a frame so layout is computed
  requestAnimationFrame(() => {
    positionFlies(flyElements, gameArea);

    // Speak the target syllable after a short delay
    setTimeout(() => {
      speak(correct);
    }, 400);
  });
}

/** Handle a fly being tapped. */
async function handleFlyTap(syllable, flyEl) {
  if (!state || !state.roundActive) return;

  if (syllable === state.correctSyllable) {
    // Correct!
    state.roundActive = false;
    playSplat();
    await animateSplat(flyEl);

    const gameArea = document.getElementById('game-area');
    await fadeOutFlies(gameArea);

    // Brief pause before next round
    setTimeout(() => {
      nextRound();
    }, 600);
  } else {
    // Wrong — fly escapes
    playBuzz();
    animateEscape(flyEl);
  }
}

/** Handle replay button — re-speak current syllable. */
export function replaySyllable() {
  if (state?.correctSyllable) {
    speak(state.correctSyllable);
  }
}

/** Victory! */
function victory() {
  playVictory();
  const confettiContainer = document.getElementById('confetti-container');
  createConfetti(confettiContainer);
  showScreen('screen-victory');
}
