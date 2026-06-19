async function B(m) {
  const g = await fetch(m, { headers: { Range: "bytes=0-9" } }), o = await g.arrayBuffer(), i = new Uint8Array(o, 0, 10);
  if (String.fromCharCode(i[0], i[1], i[2]) !== "ID3")
    return null;
  const t = i[6] << 21 | i[7] << 14 | i[8] << 7 | i[9];
  let e;
  if (g.status === 206) {
    const d = await fetch(m, {
      headers: { Range: `bytes=10-${10 + t}` }
    });
    e = new Uint8Array(await d.arrayBuffer());
  } else
    e = new Uint8Array(o, 10, t);
  const r = new TextDecoder("utf-8"), y = {};
  let a = 0;
  for (; a < e.length - 10; ) {
    const d = String.fromCharCode(
      e[a],
      e[a + 1],
      e[a + 2],
      e[a + 3]
    );
    if (d === "\0\0\0\0") break;
    const h = e[a + 4] << 24 | e[a + 5] << 16 | e[a + 6] << 8 | e[a + 7], l = e.slice(a + 10, a + 10 + h), b = {
      TIT2: "title",
      TPE1: "artist",
      TALB: "album",
      TYER: "year",
      TRCK: "track"
    };
    if (b[d])
      y[b[d]] = r.decode(l.slice(1)).replace(/\0/g, "");
    else if (d === "APIC") {
      const w = l[0];
      let n = 1, E = "";
      for (; l[n] !== 0; )
        E += String.fromCharCode(l[n++]);
      if (n++, n++, w === 1 || w === 2) {
        for (; !(l[n] === 0 && l[n + 1] === 0); ) n++;
        n += 2;
      } else {
        for (; l[n] !== 0; ) n++;
        n++;
      }
      const L = l.slice(n), C = new Blob([L], { type: E || "image/jpeg" });
      y.image = URL.createObjectURL(C);
    }
    a += 10 + h;
  }
  return y;
}
const f = document.getElementById("thumb"), s = document.getElementById("player"), u = document.getElementById("playlist"), p = document.getElementById("player-container"), c = document.getElementById("play-toggle"), v = () => {
  s.src && (s.paused ? s.play() : s.pause());
};
f && (f.style.cursor = "pointer", f.addEventListener("click", v));
c && c.addEventListener("click", v);
s.addEventListener("play", () => {
  p && p.classList.add("playing"), c && (c.textContent = "⏸", c.setAttribute("aria-label", "Pause"));
});
s.addEventListener("pause", () => {
  p && p.classList.remove("playing"), c && (c.textContent = "▶", c.setAttribute("aria-label", "Play"));
});
async function I(m) {
  let g = 0;
  const o = await Promise.all(
    m.map(async (t, e) => {
      const r = t;
      return { ...await B(r) || {
        title: t,
        artist: "Unknown Artist"
      }, url: r, index: e };
    })
  );
  console.log("songs", o), o.forEach((t) => {
    const e = document.createElement("li");
    e.textContent = `${t.title}`, e.addEventListener("click", () => {
      i(t.index);
    }), u.appendChild(e);
  });
  const i = (t) => {
    const e = o[t];
    if (console.log("Playing song", e), !!e) {
      if (g = t, e.image && (f.src = e.image), s.src = e.url, u.querySelectorAll("li").forEach((r) => r.classList.remove("active")), u.children[t].classList.add("active"), "mediaSession" in navigator) {
        const r = {
          title: e.title,
          artist: e.artist,
          album: e.album
        };
        e.image && (r.artwork = [
          { src: e.image, sizes: "96x96", type: "image/png" },
          { src: e.image, sizes: "128x128", type: "image/png" },
          { src: e.image, sizes: "192x192", type: "image/png" },
          { src: e.image, sizes: "256x256", type: "image/png" }
        ]), navigator.mediaSession.metadata = new MediaMetadata(r);
      }
      s.addEventListener(
        "canplay",
        () => {
          s.play();
        },
        !1
      );
    }
  };
  i(0), s.addEventListener(
    "ended",
    () => {
      i((g + 1) % o.length);
    },
    !1
  );
}
export {
  I as init
};
