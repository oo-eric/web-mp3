import { jsxs as E, jsx as h } from "react/jsx-runtime";
import { useState as k, useRef as I, useCallback as w, useEffect as T } from "react";
async function U(d) {
  const b = await fetch(d, { headers: { Range: "bytes=0-9" } }), C = await b.arrayBuffer(), i = new Uint8Array(C, 0, 10);
  if (String.fromCharCode(i[0], i[1], i[2]) !== "ID3")
    return null;
  const P = i[6] << 21 | i[7] << 14 | i[8] << 7 | i[9];
  let s;
  if (b.status === 206) {
    const o = await fetch(d, {
      headers: { Range: `bytes=10-${10 + P}` }
    });
    s = new Uint8Array(await o.arrayBuffer());
  } else
    s = new Uint8Array(C, 10, P);
  const S = new TextDecoder("utf-8"), f = {};
  let e = 0;
  for (; e < s.length - 10; ) {
    const o = String.fromCharCode(
      s[e],
      s[e + 1],
      s[e + 2],
      s[e + 3]
    );
    if (o === "\0\0\0\0") break;
    const l = s[e + 4] << 24 | s[e + 5] << 16 | s[e + 6] << 8 | s[e + 7], r = s.slice(e + 10, e + 10 + l), g = {
      TIT2: "title",
      TPE1: "artist",
      TALB: "album",
      TYER: "year",
      TRCK: "track"
    };
    if (g[o])
      f[g[o]] = S.decode(r.slice(1)).replace(/\0/g, "");
    else if (o === "APIC") {
      const y = r[0];
      let a = 1, p = "";
      for (; r[a] !== 0; )
        p += String.fromCharCode(r[a++]);
      if (a++, a++, y === 1 || y === 2) {
        for (; !(r[a] === 0 && r[a + 1] === 0); ) a++;
        a += 2;
      } else {
        for (; r[a] !== 0; ) a++;
        a++;
      }
      const c = r.slice(a), R = new Blob([c], { type: p || "image/jpeg" });
      f.image = URL.createObjectURL(R);
    }
    e += 10 + l;
  }
  return f;
}
function L({
  files: d,
  className: b,
  playlistClassName: C,
  thumbClassName: i,
  audioClassName: P,
  playToggleClassName: s,
  activeClassName: S = "active",
  playingClassName: f = "playing"
}) {
  const [e, o] = k([]), [l, r] = k(0), [g, y] = k(!1), a = I(null), p = w(() => {
    const n = a.current;
    !n || !n.src || (n.paused ? n.play() : n.pause());
  }, []);
  T(() => {
    let n = !1;
    async function t() {
      const u = await Promise.all(
        d.map(async (m, B) => ({ ...await U(m) || {
          title: m,
          artist: "Unknown Artist"
        }, url: m, index: B }))
      );
      n || o(u);
    }
    return t(), () => {
      n = !0;
    };
  }, [d]);
  const c = w(
    (n) => {
      const t = e[n];
      if (!t) return;
      r(n);
      const u = a.current;
      if (u && (u.src = t.url, u.addEventListener(
        "canplay",
        () => {
          u.play();
        },
        { once: !0 }
      )), "mediaSession" in navigator) {
        const m = {
          title: t.title,
          artist: t.artist,
          album: t.album
        };
        t.image && (m.artwork = [
          { src: t.image, sizes: "96x96", type: "image/png" },
          { src: t.image, sizes: "128x128", type: "image/png" },
          { src: t.image, sizes: "192x192", type: "image/png" },
          { src: t.image, sizes: "256x256", type: "image/png" }
        ]), navigator.mediaSession.metadata = new MediaMetadata(m);
      }
    },
    [e]
  );
  T(() => {
    e.length > 0 && c(0);
  }, [e, c]);
  const R = w(() => {
    c((l + 1) % e.length);
  }, [l, e.length, c]), v = e[l], A = w(() => y(!0), []), N = w(() => y(!1), []), z = [b, g && f].filter(Boolean).join(" ");
  return /* @__PURE__ */ E("div", { className: z || void 0, children: [
    v?.image && /* @__PURE__ */ h(
      "img",
      {
        src: v.image,
        alt: "Album art",
        className: i,
        style: { cursor: "pointer" },
        onClick: p
      }
    ),
    /* @__PURE__ */ h(
      "button",
      {
        type: "button",
        className: s,
        onClick: p,
        "aria-label": g ? "Pause" : "Play",
        children: g ? "⏸" : "▶"
      }
    ),
    /* @__PURE__ */ h(
      "audio",
      {
        ref: a,
        controls: !0,
        onEnded: R,
        onPlay: A,
        onPause: N,
        className: P
      }
    ),
    /* @__PURE__ */ h("ul", { className: C, children: e.map((n, t) => /* @__PURE__ */ h(
      "li",
      {
        className: t === l ? S : void 0,
        onClick: () => c(t),
        children: n.title
      },
      t
    )) })
  ] });
}
export {
  L as Player
};
