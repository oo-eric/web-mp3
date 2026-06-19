import { useState, useEffect, useRef, useCallback } from "react";
import { readID3v2 } from "./utils.js";

function Player({
  files,
  className,
  playlistClassName,
  thumbClassName,
  audioClassName,
  playToggleClassName,
  activeClassName = "active",
  playingClassName = "playing",
}) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // toggle playback; no-op until a track is loaded
  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.paused ? audio.play() : audio.pause();
  }, []);

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

  // drive the UI off the audio element's real state, so OS media keys and the
  // native controls keep it in sync too
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  const rootClassName = [className, isPlaying && playingClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName || undefined}>
      {activeSong?.image && (
        <img
          src={activeSong.image}
          alt="Album art"
          className={thumbClassName}
          style={{ cursor: "pointer" }}
          onClick={togglePlayback}
        />
      )}
      <button
        type="button"
        className={playToggleClassName}
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <audio
        ref={audioRef}
        controls
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
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
