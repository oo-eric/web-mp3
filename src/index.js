import { readID3v2 } from "./utils.js";

//
const thumb = document.getElementById("thumb");

//
const player = document.getElementById("player");

// build playlist
const playlist = document.getElementById("playlist");

// optional play/pause UI — feature-detected, these may not exist
const playerContainer = document.getElementById("player-container");
const playToggle = document.getElementById("play-toggle");

// optional timed-lyrics display — feature-detected
const lyricsBox = document.getElementById("lyrics");

// toggle playback; no-op until a track is loaded
const togglePlayback = () => {
  if (!player.src) return;
  player.paused ? player.play() : player.pause();
};

// click the thumbnail or the dedicated button to toggle playback
if (thumb) {
  thumb.style.cursor = "pointer";
  thumb.addEventListener("click", togglePlayback);
}
if (playToggle) playToggle.addEventListener("click", togglePlayback);

// drive the UI off the audio element's real state, so OS media keys and the
// native controls keep it in sync too
player.addEventListener("play", () => {
  if (playerContainer) playerContainer.classList.add("playing");
  if (playToggle) {
    playToggle.textContent = "⏸";
    playToggle.setAttribute("aria-label", "Pause");
  }
});
player.addEventListener("pause", () => {
  if (playerContainer) playerContainer.classList.remove("playing");
  if (playToggle) {
    playToggle.textContent = "▶";
    playToggle.setAttribute("aria-label", "Play");
  }
});

/**
 * Initialize the music player by loading songs and setting up the playlist UI.
 * @param {Array} files - An array of song file names to load into the player.
 * @param {Object} [opts]
 * @param {Object} [opts.lyrics] - Timed lyrics keyed by file URL. Each entry is
 *   an array of blocks (verse/chorus), each block an array of { t, text }
 *   lines with t = line start in seconds. The block containing the current
 *   line is rendered into #lyrics, so block size controls how many lines are
 *   on screen at once. Requires a #lyrics element; ignored without one.
 */
async function init(files, opts = {}) {
  let currentSong = 0;

  // --- timed lyrics (optional) ---
  const lyricsMap = opts.lyrics || {};
  let blocks = []; // current track's lyrics: [[{ t, text }, ...], ...]
  let lines = []; // flattened with block/pos back-references, in time order
  let activeLine = -1;

  const loadLyrics = (url) => {
    blocks = lyricsMap[url] || [];
    lines = blocks.flatMap((block, b) =>
      block.map((line, pos) => ({ ...line, block: b, pos })),
    );
    activeLine = -1;
    if (lyricsBox) lyricsBox.replaceChildren();
  };

  const renderLyrics = () => {
    if (!lyricsBox || !lines.length) return;
    const t = player.currentTime;
    let idx = -1;
    for (let i = 0; i < lines.length && lines[i].t <= t; i++) idx = i;
    if (idx === activeLine) return;
    activeLine = idx;
    if (idx === -1) {
      lyricsBox.replaceChildren();
      return;
    }
    const { block, pos } = lines[idx];
    lyricsBox.replaceChildren(
      ...blocks[block].map((line, i) => {
        const p = document.createElement("p");
        p.textContent = line.text;
        if (i === pos) p.classList.add("active");
        else if (i < pos) p.classList.add("sung");
        return p;
      }),
    );
  };

  if (lyricsBox) {
    player.addEventListener("timeupdate", renderLyrics);
    player.addEventListener("seeked", renderLyrics);
  }

  const songs = await Promise.all(
    files.map(async (file, index) => {
      // const url = `/mp3/${file}`;
      const url = file;
      const tags = (await readID3v2(url)) || {
        title: file,
        artist: "Unknown Artist",
      };
      return { ...tags, url, index };
    }),
  );

  console.log("songs", songs);

  // Now songs is an array of resolved tag objects
  // Build playlist UI
  songs.forEach((song) => {
    const li = document.createElement("li");
    li.textContent = `${song.title}`;
    li.addEventListener("click", () => {
      playSong(song.index);
    });
    playlist.appendChild(li);
  });

  const playSong = (index) => {
    const song = songs[index];
    console.log("Playing song", song);
    if (!song) return;

    currentSong = index;
    if (song.image) thumb.src = song.image;
    player.src = song.url;
    loadLyrics(song.url);

    playlist
      .querySelectorAll("li")
      .forEach((li) => li.classList.remove("active"));
    playlist.children[index].classList.add("active");

    if ("mediaSession" in navigator) {
      const metadata = {
        title: song.title,
        artist: song.artist,
        album: song.album,
      };
      if (song.image) {
        metadata.artwork = [
          { src: song.image, sizes: "96x96", type: "image/png" },
          { src: song.image, sizes: "128x128", type: "image/png" },
          { src: song.image, sizes: "192x192", type: "image/png" },
          { src: song.image, sizes: "256x256", type: "image/png" },
        ];
      }
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }

    player.addEventListener(
      "canplay",
      () => {
        player.play();
      },
      { once: true },
    );
  };

  playSong(0);

  player.addEventListener(
    "ended",
    () => {
      playSong((currentSong + 1) % songs.length);
    },
    false,
  );
}

export { init };
