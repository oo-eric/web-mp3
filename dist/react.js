import { jsxs as M, jsx as f } from "react/jsx-runtime";
import { useState as U, useRef as K, useCallback as p, useEffect as z } from "react";
async function O(y) {
  const C = await fetch(y, { headers: { Range: "bytes=0-9" } }), S = await C.arrayBuffer(), l = new Uint8Array(S, 0, 10);
  if (String.fromCharCode(l[0], l[1], l[2]) !== "ID3")
    return null;
  const k = l[6] << 21 | l[7] << 14 | l[8] << 7 | l[9];
  let n;
  if (C.status === 206) {
    const u = await fetch(y, {
      headers: { Range: `bytes=10-${10 + k}` }
    });
    n = new Uint8Array(await u.arrayBuffer());
  } else
    n = new Uint8Array(S, 10, k);
  const P = new TextDecoder("utf-8"), h = {};
  let s = 0;
  for (; s < n.length - 10; ) {
    const u = String.fromCharCode(
      n[s],
      n[s + 1],
      n[s + 2],
      n[s + 3]
    );
    if (u === "\0\0\0\0") break;
    const r = n[s + 4] << 24 | n[s + 5] << 16 | n[s + 6] << 8 | n[s + 7], c = n.slice(s + 10, s + 10 + r), g = {
      TIT2: "title",
      TPE1: "artist",
      TALB: "album",
      TYER: "year",
      TRCK: "track"
    };
    if (g[u])
      h[g[u]] = P.decode(c.slice(1)).replace(/\0/g, "");
    else if (u === "APIC") {
      const v = c[0];
      let a = 1, b = "";
      for (; c[a] !== 0; )
        b += String.fromCharCode(c[a++]);
      if (a++, a++, v === 1 || v === 2) {
        for (; !(c[a] === 0 && c[a + 1] === 0); ) a++;
        a += 2;
      } else {
        for (; c[a] !== 0; ) a++;
        a++;
      }
      const m = c.slice(a), T = new Blob([m], { type: b || "image/jpeg" });
      h.image = URL.createObjectURL(T);
    }
    s += 10 + r;
  }
  return h;
}
function F({
  files: y,
  className: C,
  playlistClassName: S,
  thumbClassName: l,
  audioClassName: k,
  playToggleClassName: n,
  lyrics: P,
  lyricsClassName: h,
  activeClassName: s = "active",
  playingClassName: u = "playing"
}) {
  const [r, c] = U([]), [g, v] = U(0), [a, b] = U(!1), [m, T] = U(-1), R = K(null), x = p(() => {
    const t = R.current;
    !t || !t.src || (t.paused ? t.play() : t.pause());
  }, []);
  z(() => {
    let t = !1;
    async function e() {
      const o = await Promise.all(
        y.map(async (i, D) => ({ ...await O(i) || {
          title: i,
          artist: "Unknown Artist"
        }, url: i, index: D }))
      );
      t || c(o);
    }
    return e(), () => {
      t = !0;
    };
  }, [y]);
  const w = p(
    (t) => {
      const e = r[t];
      if (!e) return;
      v(t), T(-1);
      const o = R.current;
      if (o && (o.src = e.url, o.addEventListener(
        "canplay",
        () => {
          o.play();
        },
        { once: !0 }
      )), "mediaSession" in navigator) {
        const i = {
          title: e.title,
          artist: e.artist,
          album: e.album
        };
        e.image && (i.artwork = [
          { src: e.image, sizes: "96x96", type: "image/png" },
          { src: e.image, sizes: "128x128", type: "image/png" },
          { src: e.image, sizes: "192x192", type: "image/png" },
          { src: e.image, sizes: "256x256", type: "image/png" }
        ]), navigator.mediaSession.metadata = new MediaMetadata(i);
      }
    },
    [r]
  );
  z(() => {
    r.length > 0 && w(0);
  }, [r, w]);
  const B = p(() => {
    w((g + 1) % r.length);
  }, [g, r.length, w]), N = r[g], A = P && N && P[N.url] || [], d = A.flatMap(
    (t, e) => t.map((o, i) => ({ ...o, block: e, pos: i }))
  ), L = p(() => {
    const t = R.current;
    if (!t || !d.length) return;
    const e = t.currentTime;
    let o = -1;
    for (let i = 0; i < d.length && d[i].t <= e; i++) o = i;
    T(o);
  }, [d]), E = p(() => b(!0), []), I = p(() => b(!1), []), j = [C, a && u].filter(Boolean).join(" ");
  return /* @__PURE__ */ M("div", { className: j || void 0, children: [
    N?.image && /* @__PURE__ */ f(
      "img",
      {
        src: N.image,
        alt: "Album art",
        className: l,
        style: { cursor: "pointer" },
        onClick: x
      }
    ),
    /* @__PURE__ */ f(
      "button",
      {
        type: "button",
        className: n,
        onClick: x,
        "aria-label": a ? "Pause" : "Play",
        children: a ? "⏸" : "▶"
      }
    ),
    /* @__PURE__ */ f(
      "audio",
      {
        ref: R,
        controls: !0,
        onEnded: B,
        onPlay: E,
        onPause: I,
        onTimeUpdate: L,
        onSeeked: L,
        className: k
      }
    ),
    m >= 0 && d[m] && /* @__PURE__ */ f("div", { className: h, children: A[d[m].block].map((t, e) => /* @__PURE__ */ f(
      "p",
      {
        className: e === d[m].pos ? "active" : e < d[m].pos ? "sung" : void 0,
        children: t.text
      },
      e
    )) }),
    /* @__PURE__ */ f("ul", { className: S, children: r.map((t, e) => /* @__PURE__ */ f(
      "li",
      {
        className: e === g ? s : void 0,
        onClick: () => w(e),
        children: t.title
      },
      e
    )) })
  ] });
}
export {
  F as Player
};
