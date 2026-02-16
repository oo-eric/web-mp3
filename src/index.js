import { readID3v2 } from "./utils.js";

//
const thumb = document.getElementById("thumb");

//
const player = document.getElementById("player");

// build playlist
const playlist = document.getElementById("playlist");

/**
 * Initialize the music player by loading songs and setting up the playlist UI.
 * @param {Array} files - An array of song file names to load into the player.
 */
async function init(files) {
  let currentSong = 0;

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
      false,
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
