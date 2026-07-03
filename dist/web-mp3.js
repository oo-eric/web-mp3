async function x(b) {
  const E = await fetch(b, { headers: { Range: "bytes=0-9" } }), p = await E.arrayBuffer(), o = new Uint8Array(p, 0, 10);
  if (String.fromCharCode(o[0], o[1], o[2]) !== "ID3")
    return null;
  const g = o[6] << 21 | o[7] << 14 | o[8] << 7 | o[9];
  let a;
  if (E.status === 206) {
    const l = await fetch(b, {
      headers: { Range: `bytes=10-${10 + g}` }
    });
    a = new Uint8Array(await l.arrayBuffer());
  } else
    a = new Uint8Array(p, 10, g);
  const u = new TextDecoder("utf-8"), h = {};
  let i = 0;
  for (; i < a.length - 10; ) {
    const l = String.fromCharCode(
      a[i],
      a[i + 1],
      a[i + 2],
      a[i + 3]
    );
    if (l === "\0\0\0\0") break;
    const m = a[i + 4] << 24 | a[i + 5] << 16 | a[i + 6] << 8 | a[i + 7], t = a.slice(i + 10, i + 10 + m), e = {
      TIT2: "title",
      TPE1: "artist",
      TALB: "album",
      TYER: "year",
      TRCK: "track"
    };
    if (e[l])
      h[e[l]] = u.decode(t.slice(1)).replace(/\0/g, "");
    else if (l === "APIC") {
      const s = t[0];
      let n = 1, c = "";
      for (; t[n] !== 0; )
        c += String.fromCharCode(t[n++]);
      if (n++, n++, s === 1 || s === 2) {
        for (; !(t[n] === 0 && t[n + 1] === 0); ) n++;
        n += 2;
      } else {
        for (; t[n] !== 0; ) n++;
        n++;
      }
      const L = t.slice(n), y = new Blob([L], { type: c || "image/jpeg" });
      h.image = URL.createObjectURL(y);
    }
    i += 10 + m;
  }
  return h;
}
const v = document.getElementById("thumb"), r = document.getElementById("player"), C = document.getElementById("playlist"), w = document.getElementById("player-container"), d = document.getElementById("play-toggle"), f = document.getElementById("lyrics"), k = () => {
  r.src && (r.paused ? r.play() : r.pause());
};
v && (v.style.cursor = "pointer", v.addEventListener("click", k));
d && d.addEventListener("click", k);
r.addEventListener("play", () => {
  w && w.classList.add("playing"), d && (d.textContent = "⏸", d.setAttribute("aria-label", "Pause"));
});
r.addEventListener("pause", () => {
  w && w.classList.remove("playing"), d && (d.textContent = "▶", d.setAttribute("aria-label", "Play"));
});
async function B(b, E = {}) {
  let p = 0;
  const o = E.lyrics || {};
  let g = [], a = [], u = -1;
  const h = (t) => {
    g = o[t] || [], a = g.flatMap(
      (e, s) => e.map((n, c) => ({ ...n, block: s, pos: c }))
    ), u = -1, f && f.replaceChildren();
  }, i = () => {
    if (!f || !a.length) return;
    const t = r.currentTime;
    let e = -1;
    for (let c = 0; c < a.length && a[c].t <= t; c++) e = c;
    if (e === u) return;
    if (u = e, e === -1) {
      f.replaceChildren();
      return;
    }
    const { block: s, pos: n } = a[e];
    f.replaceChildren(
      ...g[s].map((c, L) => {
        const y = document.createElement("p");
        return y.textContent = c.text, L === n ? y.classList.add("active") : L < n && y.classList.add("sung"), y;
      })
    );
  };
  f && (r.addEventListener("timeupdate", i), r.addEventListener("seeked", i));
  const l = await Promise.all(
    b.map(async (t, e) => {
      const s = t;
      return { ...await x(s) || {
        title: t,
        artist: "Unknown Artist"
      }, url: s, index: e };
    })
  );
  console.log("songs", l), l.forEach((t) => {
    const e = document.createElement("li");
    e.textContent = `${t.title}`, e.addEventListener("click", () => {
      m(t.index);
    }), C.appendChild(e);
  });
  const m = (t) => {
    const e = l[t];
    if (console.log("Playing song", e), !!e) {
      if (p = t, e.image && (v.src = e.image), r.src = e.url, h(e.url), C.querySelectorAll("li").forEach((s) => s.classList.remove("active")), C.children[t].classList.add("active"), "mediaSession" in navigator) {
        const s = {
          title: e.title,
          artist: e.artist,
          album: e.album
        };
        e.image && (s.artwork = [
          { src: e.image, sizes: "96x96", type: "image/png" },
          { src: e.image, sizes: "128x128", type: "image/png" },
          { src: e.image, sizes: "192x192", type: "image/png" },
          { src: e.image, sizes: "256x256", type: "image/png" }
        ]), navigator.mediaSession.metadata = new MediaMetadata(s);
      }
      r.addEventListener(
        "canplay",
        () => {
          r.play();
        },
        { once: !0 }
      );
    }
  };
  m(0), r.addEventListener(
    "ended",
    () => {
      m((p + 1) % l.length);
    },
    !1
  );
}
export {
  B as init
};
