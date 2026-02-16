# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

web-mp3 is a vanilla JavaScript browser-based MP3 player that reads ID3v2 tags via HTTP Range requests and provides playlist/playback UI with Media Session API integration.

## Commands

- **Install dependencies:** `yarn install`
- **Dev server:** `yarn dev`
- **Build:** `yarn build` (outputs ES module to `dist/web-mp3.js`)
- **Preview:** `yarn preview`
- **Lint:** `yarn lint`
- **Tests:** Not configured

## Architecture

- `src/index.js` — Main player logic. `init(files)` takes an array of filenames, fetches ID3v2 metadata for each from `/mp3/{filename}`, builds the playlist UI, and wires up audio playback with auto-advance and Media Session support.
- `src/utils.js` — Exports `readID3v2(url)` which uses HTTP Range requests to efficiently parse ID3v2 tag headers and extract text frames (title, artist, album, year, track) and album art (APIC frame) with proper text encoding handling.
- `example/index.html` — Demo page that imports the player as an ES module. Expects `#player` (audio element), `#playlist` (ul), and `#thumb` (img) DOM elements plus a `style.css` stylesheet.
- `example/` — Demo page with `main.js` entry point that imports and calls `init()`.
- `dist/web-mp3.js` — Built ES module output (via Vite library mode).

## Key Technical Details

- All source is vanilla JS using ES module syntax (`import`/`export`)
- Binary parsing of ID3v2 tags handles UTF-8, UTF-16, and ISO-8859-1 encodings
- MP3 files are served from a `/mp3/` endpoint; the backend must support HTTP Range requests
- Media Session API usage is optional (feature-detected)
- Package manager is Yarn
