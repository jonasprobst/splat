/**
 * Fly component: creation, positioning, animations, and interaction.
 */

/**
 * Create a fly DOM element.
 * Returns the element (not yet added to DOM).
 */
export function createFly(syllable, onClick) {
  const fly = document.createElement('div');
  fly.className = 'fly fly--idle';
  fly.dataset.syllable = syllable;

  const body = document.createElement('div');
  body.className = 'fly__body';

  const img = document.createElement('img');
  img.className = 'fly__image';
  img.src = 'img/fly.svg';
  img.alt = '';
  img.draggable = false;

  const splatImg = document.createElement('img');
  splatImg.className = 'fly__splat-image';
  splatImg.src = 'img/fly-splat.svg';
  splatImg.alt = '';
  splatImg.draggable = false;

  const text = document.createElement('span');
  text.className = 'fly__syllable';
  text.textContent = syllable;

  body.appendChild(img);
  body.appendChild(splatImg);
  body.appendChild(text);
  fly.appendChild(body);

  // Debounced tap handler
  let tapped = false;
  fly.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (tapped) return;
    tapped = true;
    onClick(syllable, fly);
  });

  return fly;
}

/**
 * Position flies within a container, avoiding overlap.
 * Uses a grid-based approach with jitter for natural placement.
 */
export function positionFlies(flyElements, container) {
  const rect = container.getBoundingClientRect();
  const padding = 20;
  const flySize = flyElements[0]?.querySelector('.fly__body')?.offsetWidth || 90;
  const spacing = flySize + 20;

  const availableW = rect.width - padding * 2 - flySize;
  const availableH = rect.height - padding * 2 - flySize;

  // Calculate grid
  const cols = Math.max(2, Math.floor((availableW + 20) / spacing));
  const rows = Math.max(2, Math.ceil(flyElements.length / cols));

  const cellW = availableW / cols;
  const cellH = availableH / Math.max(rows, 1);

  // Shuffle positions for randomness
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({ row: r, col: c });
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  flyElements.forEach((fly, i) => {
    const pos = positions[i];
    const jitterX = (Math.random() - 0.5) * cellW * 0.3;
    const jitterY = (Math.random() - 0.5) * cellH * 0.3;

    const x = padding + pos.col * cellW + cellW / 2 - flySize / 2 + jitterX;
    const y = padding + pos.row * cellH + cellH / 2 - flySize / 2 + jitterY;

    // Clamp within bounds
    fly.style.left = `${Math.max(padding, Math.min(x, availableW + padding))}px`;
    fly.style.top = `${Math.max(padding, Math.min(y, availableH + padding))}px`;
  });
}

/**
 * Animate a fly being splatted.
 * Returns a Promise that resolves when animation completes.
 */
export function animateSplat(flyEl) {
  return new Promise(resolve => {
    flyEl.classList.remove('fly--idle');
    flyEl.classList.add('fly--splat');
    setTimeout(resolve, 500);
  });
}

/**
 * Animate a fly escaping (wrong answer).
 * Flies off in a random direction.
 * Returns a Promise that resolves when animation completes.
 */
export function animateEscape(flyEl) {
  return new Promise(resolve => {
    flyEl.classList.remove('fly--idle');
    flyEl.classList.add('fly--escape');

    // Pick a random exit direction
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.max(window.innerWidth, window.innerHeight);
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    flyEl.style.transition = 'transform 0.5s ease-in, opacity 0.5s ease-in';
    flyEl.style.transform = `translate(${tx}px, ${ty}px)`;
    flyEl.style.opacity = '0';

    setTimeout(resolve, 500);
  });
}

/** Fade out remaining flies between rounds. */
export function fadeOutFlies(container) {
  return new Promise(resolve => {
    const flies = container.querySelectorAll('.fly:not(.fly--splat):not(.fly--escape)');
    flies.forEach(f => f.classList.add('fly--fade-out'));
    setTimeout(resolve, 350);
  });
}

/** Remove all fly elements from container. */
export function clearFlies(container) {
  container.querySelectorAll('.fly').forEach(f => f.remove());
}
