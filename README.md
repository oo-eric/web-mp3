# web-mp3

A vanilla JavaScript browser-based MP3 player that reads ID3v2 tags via HTTP Range requests and provides playlist/playback UI with Media Session API integration.

## Features

- Parses ID3v2 tags (title, artist, album, year, track, album art) directly in the browser
- Uses HTTP Range requests for efficient metadata fetching
- Auto-advances through the playlist
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
      activeClassName="now-playing"
    />
  );
}
```

The `Player` component is unstyled by default. All elements accept className props:

| Prop                | Description                                       |
| ------------------- | ------------------------------------------------- |
| `files`             | Array of MP3 file URLs (required)                 |
| `className`         | Class for the outer container `<div>`             |
| `thumbClassName`    | Class for the album art `<img>`                   |
| `audioClassName`    | Class for the `<audio>` element                   |
| `playlistClassName` | Class for the playlist `<ul>`                     |
| `activeClassName`   | Class for the active `<li>` (default: `"active"`) |

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
