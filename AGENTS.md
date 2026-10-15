# !!AGENTS.md

## Project overview

This is a spec-driven Pac-Man game built with vanilla JavaScript, HTML, and CSS. The goal is to learn the spec-driven development methodology. The game is playable in a browser with arrow keys.

## Spec-driven workflow

**This project uses a spec-first methodology.** Agents should follow this workflow:

1. **`/spec`** — Write and approve a spec before implementing. Answer Phase 2 questions completely (clarify scope, data model, integration points, verification method). Save the spec to the `specs/` folder.
2. **`/spec-impl`** — Implement the approved spec step by step. Follow the implementation plan exactly as written. Pause after each step for review. Do not commit code automatically; the user decides when to commit.

The project has custom skills for this workflow loaded from `klerith/fernando-skills` (see `skills-lock.json`). These are already configured and should be invoked by name when doing spec work.

## Architecture

```
src/
  index.html       — Canvas element, game overlay, script loading order
  js/
    main.js        — Game loop, keyboard input, overlay state machine
    game.js        — Game state, pacman/ghost movement, collision, scoring
    maze.js        — Maze data (MAZE global), tunnel row, spawn positions
    render.js      — Canvas drawing (pacman, ghosts, maze, dots, UI)
  css/
    style.css      — Canvas styling, overlay styling
```

### Key globals and dependencies

- **maze.js** exports primitives: `MAZE`, `TUNNEL_ROW`, `PACMAN_START`, `GHOST_STARTS`
- **game.js** creates and updates game state via `createGame()` and `update(game)`
- **render.js** draws via `draw(ctx, game, frame)`
- **main.js** ties it together: canvas loop, keyboard events, overlay UI

Script loading order in HTML matters; respect it: `maze.js` → `game.js` → `render.js` → `main.js`.

## Game mechanics (as implemented)

- **Pacman**: Moves 1/8 cell per frame (0.125 speed). Arrow keys queue the next direction; direction changes align with grid. Eats dots (grid value 2) for +10 score.
- **Ghosts**: Move 1/10 cell per frame (0.1 speed). Start at predefined positions. No AI yet.
- **Maze**: Grid-based. Walls (1), dots (2), doors (3). Pacman blocked by walls and doors; ghosts blocked only by walls.
- **Tunnel**: Wrapping at `TUNNEL_ROW` (horizontal wrap on tunnel row).
- **Game states**: `'start'` → `'playing'` → `'won'` (all dots eaten) or `'lost'` (no lives left).

## Testing and development

No test suite is configured yet. Manual testing is through the browser (open `src/index.html` in a browser). Frame counter increments; use it to debug timing-dependent logic.

## Language

The codebase is in Spanish. Comments, variable names, and game strings (UI) are Spanish. New code should match this convention.

## What agents might miss

1. **Spec-driven, not immediate coding**: Resist the urge to code a feature without an approved spec first. Run `/spec` and answer Phase 2 questions.
2. **Script loading order**: The HTML loads maze, then game, then render, then main. Do not reorder or add scripts outside this sequence without testing the globals.
3. **Grid alignment logic**: Pacman/ghosts use fractional coordinates (0.125/0.1 increments per frame). The `aligned()` function checks if a coordinate is close enough to an integer. Movement wraps using `wrapTunnel()`. Touch this logic carefully.
4. **Game state machine**: States are simple strings (`'start'`, `'playing'`, `'won'`, `'lost'`). The overlay UI switches state via `startGame()` and `showOverlay()`.
5. **No build/lint/test yet**: The project is vanilla JS with no bundler, linter, or test runner. New infrastructure (if needed) should be designed via spec first.
6. **Spanish codebase**: Comments, error messages, and UX strings are in Spanish. Keep consistency.
