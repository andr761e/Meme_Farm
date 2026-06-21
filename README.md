# Meme Farm

Meme Farm is a vanilla HTML/CSS/JavaScript idle clicker about turning one meme button into an absurd internet empire.

## Run Locally

```bash
npm start
```

This starts a tiny dependency-free local server at `http://localhost:5173/src/index.html`, or the next free port if 5173 is busy.

Useful scripts:

- `npm run dev` - same local server as `npm start`
- `npm run check` - validates package JSON, data IDs, important asset paths, and save migration basics
- `npm run build` - currently runs the smoke check because the browser version has no bundling step
- `npm run electron` - runs the Electron shell when Electron is installed
- `npm run package:electron` - packages with electron-builder when Electron tooling is installed

## Reset Or Move Saves

Use `Options -> Reset Save` in-game for a confirmation modal.

You can also use `Options -> Export Save` and `Options -> Import Save` to move progress between browsers or machines. Saves are versioned and stored in localStorage under `memeFarmSave`.

## Project Structure

- `src/index.html` - browser app shell
- `src/style.css` - game UI, layout, animation, and responsive styling
- `src/main.js` - app startup and system wiring
- `src/state.js` - central game state, formulas, purchases, progression checks
- `src/save.js` - localStorage save/load, migration, export/import helpers
- `src/ui.js` - data-driven rendering and targeted DOM updates
- `src/leaderboards.js` - local leaderboard adapter shape for future Steamworks integration
- `src/gameLoop.js` - fixed production ticks plus visual animation loop
- `src/audio.js` - preloaded music and effects
- `src/data/` - towers, upgrades, and achievements
- `scripts/dev-server.cjs` - local static server with no dependencies
- `electron/main.cjs` - secure Electron entry point for future desktop packaging

## Roadmap

- Replace mock leaderboard data with Steamworks-backed global and friends leaderboards
- Add deeper achievements with optional bonuses
- Add more upgrade types and late-game tower synergies
- Add Steam/Electron polish: window icons, app menu, save backup path, and packaged builds
- Add automated browser tests once the project adopts a test runner
