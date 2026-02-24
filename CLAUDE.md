# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

web-mp3 is a browser-based MP3 player that reads ID3v2 tags via HTTP Range requests and provides playlist/playback UI with Media Session API integration. Available as both a vanilla JS module and a React component.

## Commands

- **Install dependencies:** `yarn install`
- **Dev server:** `yarn dev`
- **Build:** `yarn build` (outputs `dist/web-mp3.js` and `dist/react.js`)
- **Build vanilla only:** `yarn build:vanilla`
- **Build react only:** `yarn build:react`
- **Preview:** `yarn preview`
- **Lint:** `yarn lint`
- **Tests:** Not configured

## Architecture

- `src/index.js` — Main player logic. `init(files)` takes an array of filenames, fetches ID3v2 metadata for each from `/mp3/{filename}`, builds the playlist UI, and wires up audio playback with auto-advance and Media Session support.
- `src/utils.js` — Exports `readID3v2(url)` which uses HTTP Range requests to efficiently parse ID3v2 tag headers and extract text frames (title, artist, album, year, track) and album art (APIC frame) with proper text encoding handling.
- `example/index.html` — Demo page that imports the player as an ES module. Expects `#player` (audio element), `#playlist` (ul), and `#thumb` (img) DOM elements plus a `style.css` stylesheet.
- `example/` — Demo page with `main.js` entry point that imports and calls `init()`.
- `src/react.jsx` — React `<Player>` component. Reuses `readID3v2` from utils, manages state with hooks, and accepts className props for styling. Exported via `web-mp3/react`.
- `dist/web-mp3.js` — Built vanilla ES module output (via Vite library mode).
- `dist/react.js` — Built React component output (React externalized as peer dependency).

## Key Technical Details

- Vanilla source is plain JS; React component uses JSX
- Both use ES module syntax (`import`/`export`)
- Binary parsing of ID3v2 tags handles UTF-8, UTF-16, and ISO-8859-1 encodings
- MP3 files are served from a `/mp3/` endpoint; the backend must support HTTP Range requests
- Media Session API usage is optional (feature-detected)
- React 18+ is an optional peer dependency (only needed for `web-mp3/react`)
- Build uses `LIB_ENTRY` env var to switch between vanilla and React Vite configs
- Package manager is Yarn
