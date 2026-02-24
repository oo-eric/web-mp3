import {
  useState as w,
  useRef as C,
  useEffect as R,
  useCallback as b,
} from "react";
async function E(m) {
  const d = await fetch(m, { headers: { Range: "bytes=0-9" } }),
    y = await d.arrayBuffer(),
    i = new Uint8Array(y, 0, 10);
  if (String.fromCharCode(i[0], i[1], i[2]) !== "ID3") return null;
  const p = (i[6] << 21) | (i[7] << 14) | (i[8] << 7) | i[9];
  let n;
  if (d.status === 206) {
    const c = await fetch(m, {
      headers: { Range: `bytes=10-${10 + p}` },
    });
    n = new Uint8Array(await c.arrayBuffer());
  } else n = new Uint8Array(y, 10, p);
  const r = new TextDecoder("utf-8"),
    g = {};
  let a = 0;
  for (; a < n.length - 10; ) {
    const c = String.fromCharCode(n[a], n[a + 1], n[a + 2], n[a + 3]);
    if (c === "\0\0\0\0") break;
    const f = (n[a + 4] << 24) | (n[a + 5] << 16) | (n[a + 6] << 8) | n[a + 7],
      s = n.slice(a + 10, a + 10 + f),
      h = {
        TIT2: "title",
        TPE1: "artist",
        TALB: "album",
        TYER: "year",
        TRCK: "track",
      };
    if (h[c]) g[h[c]] = r.decode(s.slice(1)).replace(/\0/g, "");
    else if (c === "APIC") {
      const u = s[0];
      let e = 1,
        t = "";
      for (; s[e] !== 0; ) t += String.fromCharCode(s[e++]);
      if ((e++, e++, u === 1 || u === 2)) {
        for (; !(s[e] === 0 && s[e + 1] === 0); ) e++;
        e += 2;
      } else {
        for (; s[e] !== 0; ) e++;
        e++;
      }
      const o = s.slice(e),
        l = new Blob([o], { type: t || "image/jpeg" });
      g.image = URL.createObjectURL(l);
    }
    a += 10 + f;
  }
  return g;
}
function k({
  files: m,
  className: d,
  playlistClassName: y,
  thumbClassName: i,
  audioClassName: p,
  activeClassName: n = "active",
}) {
  const [r, g] = w([]),
    [a, c] = w(0),
    f = C(null);
  R(() => {
    let e = !1;
    async function t() {
      const o = await Promise.all(
        m.map(async (l, S) => ({
          ...((await E(l)) || {
            title: l,
            artist: "Unknown Artist",
          }),
          url: l,
          index: S,
        })),
      );
      e || g(o);
    }
    return (
      t(),
      () => {
        e = !0;
      }
    );
  }, [m]);
  const s = b(
    (e) => {
      const t = r[e];
      if (!t) return;
      c(e);
      const o = f.current;
      if (
        (o &&
          ((o.src = t.url),
          o.addEventListener(
            "canplay",
            () => {
              o.play();
            },
            { once: !0 },
          )),
        "mediaSession" in navigator)
      ) {
        const l = {
          title: t.title,
          artist: t.artist,
          album: t.album,
        };
        (t.image &&
          (l.artwork = [
            { src: t.image, sizes: "96x96", type: "image/png" },
            { src: t.image, sizes: "128x128", type: "image/png" },
            { src: t.image, sizes: "192x192", type: "image/png" },
            { src: t.image, sizes: "256x256", type: "image/png" },
          ]),
          (navigator.mediaSession.metadata = new MediaMetadata(l)));
      }
    },
    [r],
  );
  R(() => {
    r.length > 0 && s(0);
  }, [r, s]);
  const h = b(() => {
      s((a + 1) % r.length);
    }, [a, r.length, s]),
    u = r[a];
  return /* @__PURE__ */ React.createElement(
    "div",
    { className: d },
    u?.image &&
      /* @__PURE__ */ React.createElement("img", {
        src: u.image,
        alt: "Album art",
        className: i,
      }),
    /* @__PURE__ */ React.createElement("audio", {
      ref: f,
      controls: !0,
      onEnded: h,
      className: p,
    }),
    /* @__PURE__ */ React.createElement(
      "ul",
      { className: y },
      r.map((e, t) =>
        /* @__PURE__ */ React.createElement(
          "li",
          {
            key: t,
            className: t === a ? n : void 0,
            onClick: () => s(t),
          },
          e.title,
        ),
      ),
    ),
  );
}
export { k as Player };
