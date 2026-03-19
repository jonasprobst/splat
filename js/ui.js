/**
 * Shared UI helpers: screen transitions, confetti, round counter.
 */

const screens = {};

/** Initialize screen references. */
export function initScreens() {
  document.querySelectorAll('.screen').forEach(el => {
    screens[el.id] = el;
  });
}

/** Show a screen by ID, hiding all others. */
export function showScreen(screenId) {
  for (const [id, el] of Object.entries(screens)) {
    el.classList.toggle('screen--active', id === screenId);
  }
}

/** Update the round counter display. */
export function updateRoundCounter(current, total) {
  const el = document.getElementById('round-counter');
  if (el) el.textContent = `${current} / ${total}`;
}

/** Create confetti particles in the given container. */
export function createConfetti(container) {
  container.innerHTML = '';

  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#ffd93d', '#6c5ce7', '#fd79a8'];
  const count = 50;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 1}s`;

    if (Math.random() > 0.5) {
      piece.style.borderRadius = '50%';
    }

    container.appendChild(piece);
  }
}

/** Remove all confetti. */
export function clearConfetti(container) {
  container.innerHTML = '';
}
