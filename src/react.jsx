import { useState, useEffect, useRef, useCallback } from "react";
import { readID3v2 } from "./utils.js";

function Player({
  files,
  className,
  playlistClassName,
  thumbClassName,
  audioClassName,
  activeClassName = "active",
}) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSongs() {
      const loaded = await Promise.all(
        files.map(async (file, index) => {
          const tags = (await readID3v2(file)) || {
            title: file,
            artist: "Unknown Artist",
          };
          return { ...tags, url: file, index };
        }),
      );
      if (!cancelled) setSongs(loaded);
    }

    loadSongs();
    return () => {
      cancelled = true;
    };
  }, [files]);

  const playSong = useCallback(
    (index) => {
      const song = songs[index];
      if (!song) return;

      setCurrentSong(index);
      const audio = audioRef.current;
      if (audio) {
        audio.src = song.url;
        audio.addEventListener(
          "canplay",
          () => {
            audio.play();
          },
          { once: true },
        );
      }

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
    },
    [songs],
  );

  useEffect(() => {
    if (songs.length > 0) {
      playSong(0);
    }
  }, [songs, playSong]);

  const handleEnded = useCallback(() => {
    playSong((currentSong + 1) % songs.length);
  }, [currentSong, songs.length, playSong]);

  const activeSong = songs[currentSong];

  return (
    <div className={className}>
      {activeSong?.image && (
        <img
          src={activeSong.image}
          alt="Album art"
          className={thumbClassName}
        />
      )}
      <audio
        ref={audioRef}
        controls
        onEnded={handleEnded}
        className={audioClassName}
      />
      <ul className={playlistClassName}>
        {songs.map((song, index) => (
          <li
            key={index}
            className={index === currentSong ? activeClassName : undefined}
            onClick={() => playSong(index)}
          >
            {song.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { Player };
