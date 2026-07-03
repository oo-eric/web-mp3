# web-mp3

A vanilla JavaScript browser-based MP3 player that reads ID3v2 tags via HTTP Range requests and provides playlist/playback UI with Media Session API integration.

## Features

- Parses ID3v2 tags (title, artist, album, year, track, album art) directly in the browser
- Uses HTTP Range requests for efficient metadata fetching
- Auto-advances through the playlist
- Optional play/pause toggle button and click-to-toggle album art, with UI state driven off the audio element so OS media keys stay in sync
- Integrates with the Media Session API for native OS media controls
- Zero dependencies — built with vanilla JS and ES modules
- React component available via `web-mp3/react`

## Installation

```bash
yarn add web-mp3
```

## Usage

Add the required DOM elements to your HTML:

```html
<img id="thumb" />
<audio id="player" controls></audio>
<ul id="playlist"></ul>

<script src="path/to/web-mp3.js"></script>
<script type="module">
  init(["/mp3/song1.mp3", "/mp3/song2.mp3"]);
</script>
```

The `init` function accepts an array of MP3 file URLs. Each file is parsed for ID3v2 metadata and added to the playlist.

#### Optional play/pause controls

Two extra elements are feature-detected — include them to get a toggle button and a "now playing" hook, or leave them out and the player behaves as above:

```html
<div id="player-container">
  <img id="thumb" />
  <button id="play-toggle" aria-label="Play">▶</button>
  <audio id="player" controls></audio>
  <ul id="playlist"></ul>
</div>
```

- `#play-toggle` — a button that toggles playback; its glyph and `aria-label` track the audio's real state
- `#player-container` — gets a `.playing` class while audio is playing (style it however you like)

Clicking `#thumb` also toggles playback. Because the UI is driven by the `<audio>` element's `play`/`pause` events, OS media keys and the native controls stay in sync.

#### Optional timed lyrics

Add a `#lyrics` element and pass timed lyrics via the second argument to `init`:

```html
<div id="lyrics"></div>

<script type="module">
  init(["/mp3/song1.mp3"], {
    lyrics: {
      "/mp3/song1.mp3": [
        [
          { t: 12.4, text: "First line of the first verse" },
          { t: 15.1, text: "Second line of the first verse" },
        ],
        [
          { t: 21.8, text: "First line of the chorus" },
          { t: 24.5, text: "Second line of the chorus" },
        ],
      ],
    },
  });
</script>
```

Lyrics are keyed by file URL (matching the entry in `files`) and structured as an array of **blocks** — a verse, a chorus — each an array of `{ t, text }` lines, where `t` is the line's start time in seconds. As the track plays, the block containing the current line is rendered into `#lyrics` as one `<p>` per line: the current line gets class `active`, already-sung lines in the block get `sung`. Block size controls how many lines are on screen at once. Before the first line (and for tracks with no lyrics) the element stays empty — hide it with `#lyrics:empty { display: none }`. Seeking re-syncs the display. Everything is unstyled; bring your own CSS.

### React

```jsx
import { Player } from "web-mp3/react";

function App() {
  return (
    <Player
      files={["/mp3/song1.mp3", "/mp3/song2.mp3"]}
      className="player-container"
      thumbClassName="album-art"
      audioClassName="audio-controls"
      playlistClassName="playlist"
      playToggleClassName="play-toggle"
      activeClassName="now-playing"
    />
  );
}
```

The `Player` component is unstyled by default. All elements accept className props:

| Prop                  | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `files`               | Array of MP3 file URLs (required)                                 |
| `className`           | Class for the outer container `<div>`                             |
| `thumbClassName`      | Class for the album art `<img>`                                   |
| `audioClassName`      | Class for the `<audio>` element                                   |
| `playlistClassName`   | Class for the playlist `<ul>`                                     |
| `playToggleClassName` | Class for the play/pause `<button>`                               |
| `activeClassName`     | Class for the active `<li>` (default: `"active"`)                 |
| `playingClassName`    | Class added to the container while playing (default: `"playing"`) |
| `lyrics`              | Timed lyrics keyed by file URL (same block format as vanilla)     |
| `lyricsClassName`     | Class for the lyrics container `<div>`                            |

React 18+ is required as a peer dependency.

## Requirements

- MP3 files must have ID3v2 tags for metadata to be displayed
- The server should support HTTP Range requests for efficient tag parsing (falls back to full file download)

## Development

```bash
yarn install     # install dependencies
yarn dev         # start dev server
yarn build       # build both vanilla + react to dist/
yarn lint        # run eslint
yarn format      # run prettier
```

## License

ISC
