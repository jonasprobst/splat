# Splat - Syllable Learning Game

## Project Overview

**Splat** is a web-based educational game for children aged 5-8 to practice reading German syllables. Players "splat" cartoon flies that carry syllables on their chest, matching the syllable spoken aloud by the browser. Hosted on GitHub Pages.

## Game Rules

1. **Round start:** 4-6 flies appear on screen, each displaying a unique randomly-generated syllable (consonant + vowel, e.g. "MO", "TA", "FU").
2. **Prompt:** The browser speaks one of the visible syllables aloud (German `SpeechSynthesis`).
3. **Interaction:** The player taps/clicks a fly.
   - **Correct:** Satisfying splat animation + sound effect. All other flies disappear. Next round begins.
   - **Wrong:** The tapped fly buzzes and escapes (flies off screen). No penalty. Player can keep trying remaining flies.
4. **Replay button:** A UI button lets the player re-hear the current syllable as many times as needed.
5. **Victory:** After 10 correct splats, show a celebration/victory screen with option to play again.

## Syllable Generation

- Syllables are always **consonant + vowel** (CV pattern, e.g. "MO", never "OM").
- Consonants and vowels are chosen independently in the settings screen.
- Minimum selection: 1 consonant + 1 vowel.
- The pool of syllables for a game session = all combinations of selected consonants x vowels.
- Each round: one correct syllable + 3-5 distractors, all unique, drawn randomly from the pool.
- If the pool is too small for unique distractors, reduce fly count for that round.

## Settings Screen

- **Consonant picker:** Toggle individual German consonants and digraphs: B, Ch, D, F, G, H, J, K, L, M, N, P, Qu, R, S, Sch, St, T, W, Z. At least 3 must be selected.
- **Vowel picker:** Toggle individual vowels (A, E, I, O, U). At least 1 must be selected.
- For both Consonant and Vowel picker, there is a select all/ deselect button.
- **Letter case mode:** Radio/toggle with 3 options:
  - ALL CAPS (e.g. "MO") — default
  - all lowercase (e.g. "mo")
  - First Letter Cap (e.g. "Mo")
- **Sound effects toggle:** On/Off switch for sound effects (does not affect voice/speech).
- Settings are stored in `localStorage` so they persist between sessions.

## Visual Design

- **Style:** Minimal, goofy, cartoonish. Cute but not over-the-top. Age-appropriate (5-8).
- **Flies:** Simple cartoon flies with expressive eyes, wings with subtle idle animation (buzzing/hovering). Syllable displayed on the fly's body/chest area.
- **Splat effect:** Satisfying visual splat (e.g. colored splat mark) + sound.
- **Escape effect:** Wrong fly buzzes away off-screen with a cheeky animation.
- **Victory screen:** Fun celebration — confetti, stars, or similar. "Play again" button.
- **Colors:** Bright, friendly palette. High contrast for readability on the syllable text.
- **Font:** Specialised font for early learners as inclusive as possible (dislexia etc.).

## Images

- All visual assets live in `/img/` as SVG files.
- The game renders flies by compositing the SVG image + overlaid syllable text (HTML/CSS, not baked into the SVG).
- This keeps images swappable — a designer can replace the SVGs without touching code.
- Initial SVGs are generated inline or as simple vector files for the prototype.

## Layout & Responsiveness

- **Responsive:** Works on both phone (portrait) and tablet (landscape).
- **Touch-first:** All interactions are tap-based. No drag, no hover dependencies.
- **Game area:** Flies are distributed across the screen with enough spacing for small fingers to tap accurately.
- **Replay button:** Always visible and easily reachable (bottom or top of screen).

## Tech Stack & Architecture

- **Vanilla HTML + CSS + JS** — no framework, no build step.
- **ES Modules** for code organization (`type="module"` in script tags).
- **File structure:**
  ```
  /
  ├── index.html          # Entry point, screen container
  ├── css/
  │   ├── main.css        # Global styles, variables, layout
  │   ├── game.css        # Game screen styles
  │   ├── settings.css    # Settings screen styles
  │   └── victory.css     # Victory screen styles
  ├── js/
  │   ├── app.js          # Main entry, screen routing
  │   ├── game.js         # Game logic, round management
  │   ├── fly.js          # Fly component (render, animate, events)
  │   ├── syllables.js    # Syllable generation from consonant/vowel sets
  │   ├── speech.js       # SpeechSynthesis wrapper (German voice)
  │   ├── sound.js        # Sound effects (splat, buzz, victory)
  │   ├── settings.js     # Settings screen logic, localStorage I/O
  │   └── ui.js           # Shared UI helpers (screen transitions, etc.)
  ├── img/
  │   ├── fly.svg           # Fly body (without syllable text)
  │   ├── fly-splat.svg     # Splatted fly
  │   └── ...               # Replaceable by a designer
  ├── sounds/
  │   ├── splat.mp3         # Splat sound effect
  │   ├── buzz.mp3          # Wrong fly escapes
  │   └── victory.mp3       # Victory fanfare
  ├── manifest.json       # PWA manifest
  ├── sw.js               # Service worker for offline support
  └── CLAUDE.md
  ```
- **State management:** Simple in-memory state object passed between modules. No global mutation.
- **PWA:** `manifest.json` + service worker for add-to-homescreen and offline play.

## Audio

- **Voice:** Browser-native `SpeechSynthesis` API with German language (`lang: "de-DE"`).
- **Sound effects:** Audio files in `/sounds/` played via `<audio>` elements or Web Audio API. Files are swappable — drop in replacements with the same filename.
- Note: Mobile browsers may require a user gesture before audio plays. The start/title screen tap serves as this gesture and initializes the AudioContext.

## Screens & Navigation

1. **Title Screen** — Game logo, "Play" button, "Settings" gear icon. First tap unlocks audio context.
2. **Game Screen** — Flies, replay-sound button, round counter (e.g. "3/10").
3. **Victory Screen** — Celebration animation, final message, "Play Again" and "Home" buttons.
4. **Settings Screen** — Consonant/vowel pickers, case mode toggle, "Back" button.

## Coding Conventions

- Modern JS (ES2022+). No TypeScript, no transpilation.
- CSS custom properties for theming (colors, sizes).
- BEM-like class naming in CSS.
- Semantic HTML where possible.
- No external dependencies — everything runs from static files.
- Keep functions small and focused. Prefer pure functions for logic (syllable generation, randomization).
- All user-facing text in German.
- **Minimal text in gameplay.** The target audience (5-8) is learning to read. Game screens use icons/visuals over words. Written labels are only for parents/teachers (e.g. Settings screen).

## Deployment

- GitHub Pages from the `main` branch root (`/`).
- No build step required — push and it's live.

## Development Commands

```bash
# Local dev server (any simple HTTP server works, needed for ES modules)
npx serve .
# or
python3 -m http.server 8000
```
