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

## Saves

Use `Options -> Reset Save` in-game for a confirmation modal.

Browser/dev saves use localStorage under `memeFarmSave`.

The Electron build saves to the app data folder at `saves/meme-farm-save.json` through the preload bridge in `electron/preload.cjs`. Configure Steam Auto-Cloud to sync that file for the packaged build so progress follows the player between Steam installs.

## Steam Integration

Leaderboard metrics are defined in `src/leaderboards.js`. Create matching Steam leaderboards with these internal names:

- `MF_LIFETIME_LIKES`
- `MF_PEAK_LPS`
- `MF_TOWERS_OWNED`
- `MF_MILESTONES_UNLOCKED`
- `MF_MEME_BUTTON_CLICKS`
- `MF_PEAK_CLICK_POWER`
- `MF_SUBSCRIBERS_COLLECTED`

Use descending sort and numeric display for each one. Steam leaderboard scores are 32-bit integers, so high-growth idle values like lifetime likes, peak LPS, and peak click power should be uploaded with a compact ranking score instead of the raw late-game value.

The current UI keeps a local mock fallback so browser development still works; the Electron shell is ready for a Steamworks-backed provider once a Steam App ID and native Steamworks package are added.

## Project Structure

- `src/index.html` - browser app shell
- `src/style.css` - game UI, layout, animation, and responsive styling
- `src/main.js` - app startup and system wiring
- `src/state.js` - central game state, formulas, purchases, progression checks
- `src/save.js` - save/load, migration, browser localStorage, and Electron platform-save fallback
- `src/ui.js` - data-driven rendering and targeted DOM updates
- `src/leaderboards.js` - local leaderboard adapter shape for future Steamworks integration
- `src/gameLoop.js` - fixed production ticks plus visual animation loop
- `src/audio.js` - preloaded music and effects
- `src/data/` - towers, upgrades, and achievements
- `scripts/dev-server.cjs` - local static server with no dependencies
- `electron/main.cjs` - secure Electron entry point and file-backed save IPC
- `electron/preload.cjs` - renderer-safe platform bridge for Electron saves

## Roadmap

- Replace mock leaderboard data with Steamworks-backed global and friends leaderboards
- Add deeper achievements with optional bonuses
- Add more upgrade types and late-game tower synergies
- Add Steam/Electron polish: window icons, app menu, save backup path, and packaged builds
- Add automated browser tests once the project adopts a test runner
