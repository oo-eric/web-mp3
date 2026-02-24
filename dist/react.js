import { jsxs as v, jsx as w } from "react/jsx-runtime";
import {
  useState as b,
  useRef as T,
  useEffect as S,
  useCallback as C,
} from "react";
async function A(g) {
  const u = await fetch(g, { headers: { Range: "bytes=0-9" } }),
    y = await u.arrayBuffer(),
    i = new Uint8Array(y, 0, 10);
  if (String.fromCharCode(i[0], i[1], i[2]) !== "ID3") return null;
  const h = (i[6] << 21) | (i[7] << 14) | (i[8] << 7) | i[9];
  let n;
  if (u.status === 206) {
    const o = await fetch(g, {
      headers: { Range: `bytes=10-${10 + h}` },
    });
    n = new Uint8Array(await o.arrayBuffer());
  } else n = new Uint8Array(y, 10, h);
  const r = new TextDecoder("utf-8"),
    m = {};
  let a = 0;
  for (; a < n.length - 10; ) {
    const o = String.fromCharCode(n[a], n[a + 1], n[a + 2], n[a + 3]);
    if (o === "\0\0\0\0") break;
    const f = (n[a + 4] << 24) | (n[a + 5] << 16) | (n[a + 6] << 8) | n[a + 7],
      s = n.slice(a + 10, a + 10 + f),
      p = {
        TIT2: "title",
        TPE1: "artist",
        TALB: "album",
        TYER: "year",
        TRCK: "track",
      };
    if (p[o]) m[p[o]] = r.decode(s.slice(1)).replace(/\0/g, "");
    else if (o === "APIC") {
      const d = s[0];
      let e = 1,
        t = "";
      for (; s[e] !== 0; ) t += String.fromCharCode(s[e++]);
      if ((e++, e++, d === 1 || d === 2)) {
        for (; !(s[e] === 0 && s[e + 1] === 0); ) e++;
        e += 2;
      } else {
        for (; s[e] !== 0; ) e++;
        e++;
      }
      const c = s.slice(e),
        l = new Blob([c], { type: t || "image/jpeg" });
      m.image = URL.createObjectURL(l);
    }
    a += 10 + f;
  }
  return m;
}
function U({
  files: g,
  className: u,
  playlistClassName: y,
  thumbClassName: i,
  audioClassName: h,
  activeClassName: n = "active",
}) {
  const [r, m] = b([]),
    [a, o] = b(0),
    f = T(null);
  S(() => {
    let e = !1;
    async function t() {
      const c = await Promise.all(
        g.map(async (l, R) => ({
          ...((await A(l)) || {
            title: l,
            artist: "Unknown Artist",
          }),
          url: l,
          index: R,
        })),
      );
      e || m(c);
    }
    return (
      t(),
      () => {
        e = !0;
      }
    );
  }, [g]);
  const s = C(
    (e) => {
      const t = r[e];
      if (!t) return;
      o(e);
      const c = f.current;
      if (
        (c &&
          ((c.src = t.url),
          c.addEventListener(
            "canplay",
            () => {
              c.play();
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
  S(() => {
    r.length > 0 && s(0);
  }, [r, s]);
  const p = C(() => {
      s((a + 1) % r.length);
    }, [a, r.length, s]),
    d = r[a];
  return /* @__PURE__ */ v("div", {
    className: u,
    children: [
      d?.image &&
        /* @__PURE__ */ w("img", {
          src: d.image,
          alt: "Album art",
          className: i,
        }),
      /* @__PURE__ */ w("audio", {
        ref: f,
        controls: !0,
        onEnded: p,
        className: h,
      }),
      /* @__PURE__ */ w("ul", {
        className: y,
        children: r.map((e, t) =>
          /* @__PURE__ */ w(
            "li",
            {
              className: t === a ? n : void 0,
              onClick: () => s(t),
              children: e.title,
            },
            t,
          ),
        ),
      }),
    ],
  });
}
export { U as Player };
