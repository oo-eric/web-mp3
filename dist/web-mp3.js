async function E(g) {
  const l = await fetch(g, { headers: { Range: "bytes=0-9" } }),
    c = await l.arrayBuffer(),
    s = new Uint8Array(c, 0, 10);
  if (String.fromCharCode(s[0], s[1], s[2]) !== "ID3") return null;
  const t = (s[6] << 21) | (s[7] << 14) | (s[8] << 7) | s[9];
  let e;
  if (l.status === 206) {
    const o = await fetch(g, {
      headers: { Range: `bytes=10-${10 + t}` },
    });
    e = new Uint8Array(await o.arrayBuffer());
  } else e = new Uint8Array(c, 10, t);
  const i = new TextDecoder("utf-8"),
    m = {};
  let a = 0;
  for (; a < e.length - 10; ) {
    const o = String.fromCharCode(e[a], e[a + 1], e[a + 2], e[a + 3]);
    if (o === "\0\0\0\0") break;
    const y = (e[a + 4] << 24) | (e[a + 5] << 16) | (e[a + 6] << 8) | e[a + 7],
      r = e.slice(a + 10, a + 10 + y),
      u = {
        TIT2: "title",
        TPE1: "artist",
        TALB: "album",
        TYER: "year",
        TRCK: "track",
      };
    if (u[o]) m[u[o]] = i.decode(r.slice(1)).replace(/\0/g, "");
    else if (o === "APIC") {
      const p = r[0];
      let n = 1,
        h = "";
      for (; r[n] !== 0; ) h += String.fromCharCode(r[n++]);
      if ((n++, n++, p === 1 || p === 2)) {
        for (; !(r[n] === 0 && r[n + 1] === 0); ) n++;
        n += 2;
      } else {
        for (; r[n] !== 0; ) n++;
        n++;
      }
      const w = r.slice(n),
        b = new Blob([w], { type: h || "image/jpeg" });
      m.image = URL.createObjectURL(b);
    }
    a += 10 + y;
  }
  return m;
}
const C = document.getElementById("thumb"),
  d = document.getElementById("player"),
  f = document.getElementById("playlist");
async function v(g) {
  let l = 0;
  const c = await Promise.all(
    g.map(async (t, e) => {
      const i = t;
      return {
        ...((await E(i)) || {
          title: t,
          artist: "Unknown Artist",
        }),
        url: i,
        index: e,
      };
    }),
  );
  (console.log("songs", c),
    c.forEach((t) => {
      const e = document.createElement("li");
      ((e.textContent = `${t.title}`),
        e.addEventListener("click", () => {
          s(t.index);
        }),
        f.appendChild(e));
    }));
  const s = (t) => {
    const e = c[t];
    if ((console.log("Playing song", e), !!e)) {
      if (
        ((l = t),
        e.image && (C.src = e.image),
        (d.src = e.url),
        f.querySelectorAll("li").forEach((i) => i.classList.remove("active")),
        f.children[t].classList.add("active"),
        "mediaSession" in navigator)
      ) {
        const i = {
          title: e.title,
          artist: e.artist,
          album: e.album,
        };
        (e.image &&
          (i.artwork = [
            { src: e.image, sizes: "96x96", type: "image/png" },
            { src: e.image, sizes: "128x128", type: "image/png" },
            { src: e.image, sizes: "192x192", type: "image/png" },
            { src: e.image, sizes: "256x256", type: "image/png" },
          ]),
          (navigator.mediaSession.metadata = new MediaMetadata(i)));
      }
      d.addEventListener(
        "canplay",
        () => {
          d.play();
        },
        !1,
      );
    }
  };
  (s(0),
    d.addEventListener(
      "ended",
      () => {
        s((l + 1) % c.length);
      },
      !1,
    ));
}
export { v as init };
