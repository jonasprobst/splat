/**
 * Settings screen logic and localStorage persistence.
 */

import { CONSONANTS, VOWELS, CASE_MODES } from './syllables.js';

const STORAGE_KEY = 'splat-settings';

export const DEFAULT_SETTINGS = {
  consonants: [...CONSONANTS],
  vowels: [...VOWELS],
  caseMode: CASE_MODES.upper,
  soundEnabled: true
};

const MIN_CONSONANTS = 3;
const MIN_VOWELS = 1;

/** Load settings from localStorage, falling back to defaults. */
export function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return { ...DEFAULT_SETTINGS };

    // Validate and merge with defaults
    const settings = {
      consonants: Array.isArray(stored.consonants) && stored.consonants.length >= MIN_CONSONANTS
        ? stored.consonants.filter(c => CONSONANTS.includes(c))
        : [...DEFAULT_SETTINGS.consonants],
      vowels: Array.isArray(stored.vowels) && stored.vowels.length >= MIN_VOWELS
        ? stored.vowels.filter(v => VOWELS.includes(v))
        : [...DEFAULT_SETTINGS.vowels],
      caseMode: Object.values(CASE_MODES).includes(stored.caseMode)
        ? stored.caseMode
        : DEFAULT_SETTINGS.caseMode,
      soundEnabled: typeof stored.soundEnabled === 'boolean'
        ? stored.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled
    };

    // Re-check minimums after filtering
    if (settings.consonants.length < MIN_CONSONANTS) settings.consonants = [...DEFAULT_SETTINGS.consonants];
    if (settings.vowels.length < MIN_VOWELS) settings.vowels = [...DEFAULT_SETTINGS.vowels];

    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Save settings to localStorage. */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage not available — settings won't persist
  }
}

/**
 * Render the settings UI into the given container.
 * Calls onChange(settings) whenever a setting changes.
 */
export function renderSettings(container, settings, onChange) {
  container.innerHTML = '';

  // --- Consonant picker ---
  const consonantSection = createPicker(
    'Konsonanten',
    CONSONANTS,
    settings.consonants,
    MIN_CONSONANTS,
    `Mindestens ${MIN_CONSONANTS}`,
    (selected) => {
      settings.consonants = selected;
      onChange(settings);
    }
  );
  container.appendChild(consonantSection);

  // --- Vowel picker ---
  const vowelSection = createPicker(
    'Vokale',
    VOWELS,
    settings.vowels,
    MIN_VOWELS,
    `Mindestens ${MIN_VOWELS}`,
    (selected) => {
      settings.vowels = selected;
      onChange(settings);
    }
  );
  container.appendChild(vowelSection);

  // --- Case mode ---
  const caseSection = document.createElement('div');
  caseSection.className = 'case-toggle';

  const caseLabel = document.createElement('div');
  caseLabel.className = 'case-toggle__label';
  caseLabel.textContent = 'Schreibweise';
  caseSection.appendChild(caseLabel);

  const caseOptions = document.createElement('div');
  caseOptions.className = 'case-toggle__options';

  const caseModes = [
    { value: CASE_MODES.upper, label: 'MO' },
    { value: CASE_MODES.lower, label: 'mo' },
    { value: CASE_MODES.capitalize, label: 'Mo' }
  ];

  caseModes.forEach(({ value, label }) => {
    const btn = document.createElement('button');
    btn.className = 'case-toggle__btn' + (settings.caseMode === value ? ' case-toggle__btn--selected' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      settings.caseMode = value;
      caseOptions.querySelectorAll('.case-toggle__btn').forEach(b =>
        b.classList.toggle('case-toggle__btn--selected', b === btn)
      );
      onChange(settings);
    });
    caseOptions.appendChild(btn);
  });

  caseSection.appendChild(caseOptions);
  container.appendChild(caseSection);

  // --- Sound toggle ---
  const soundSection = document.createElement('div');
  soundSection.className = 'sound-toggle';

  const soundLabel = document.createElement('span');
  soundLabel.className = 'sound-toggle__label';
  soundLabel.textContent = 'Soundeffekte';
  soundSection.appendChild(soundLabel);

  const switchLabel = document.createElement('label');
  switchLabel.className = 'sound-toggle__switch';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'sound-toggle__input';
  checkbox.checked = settings.soundEnabled;
  checkbox.addEventListener('change', () => {
    settings.soundEnabled = checkbox.checked;
    onChange(settings);
  });

  const slider = document.createElement('span');
  slider.className = 'sound-toggle__slider';

  switchLabel.appendChild(checkbox);
  switchLabel.appendChild(slider);
  soundSection.appendChild(switchLabel);
  container.appendChild(soundSection);
}

/** Create a picker section (consonants or vowels). */
function createPicker(label, allItems, selectedItems, minCount, minLabel, onSelect) {
  const section = document.createElement('div');
  section.className = 'picker';

  // Label row with toggle-all button
  const labelRow = document.createElement('div');
  labelRow.className = 'picker__label';

  const labelText = document.createElement('span');
  labelText.textContent = label;
  labelRow.appendChild(labelText);

  const toggleAllBtn = document.createElement('button');
  toggleAllBtn.className = 'picker__toggle-all';
  const allSelected = () => selectedItems.length === allItems.length;
  toggleAllBtn.textContent = allSelected() ? 'Keine' : 'Alle';
  labelRow.appendChild(toggleAllBtn);

  section.appendChild(labelRow);

  // Grid of toggle buttons
  const grid = document.createElement('div');
  grid.className = 'picker__grid';

  const warning = document.createElement('div');
  warning.className = 'picker__min-warning';

  const buttons = [];

  allItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'picker__btn' + (selectedItems.includes(item) ? ' picker__btn--selected' : '');
    btn.textContent = item;
    btn.addEventListener('click', () => {
      const idx = selectedItems.indexOf(item);
      if (idx >= 0) {
        // Deselecting — check minimum
        if (selectedItems.length <= minCount) {
          warning.textContent = minLabel;
          setTimeout(() => { warning.textContent = ''; }, 1500);
          return;
        }
        selectedItems.splice(idx, 1);
        btn.classList.remove('picker__btn--selected');
      } else {
        selectedItems.push(item);
        btn.classList.add('picker__btn--selected');
      }
      toggleAllBtn.textContent = allSelected() ? 'Keine' : 'Alle';
      onSelect([...selectedItems]);
    });
    buttons.push(btn);
    grid.appendChild(btn);
  });

  section.appendChild(grid);

  // Toggle all / none
  toggleAllBtn.addEventListener('click', () => {
    if (allSelected()) {
      // Deselect to minimum: keep first minCount items
      selectedItems.length = 0;
      selectedItems.push(...allItems.slice(0, minCount));
    } else {
      selectedItems.length = 0;
      selectedItems.push(...allItems);
    }
    buttons.forEach(btn => {
      btn.classList.toggle('picker__btn--selected', selectedItems.includes(btn.textContent));
    });
    toggleAllBtn.textContent = allSelected() ? 'Keine' : 'Alle';
    onSelect([...selectedItems]);
  });

  section.appendChild(warning);
  return section;
}
