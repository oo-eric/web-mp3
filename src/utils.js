/**
 * Reads ID3v2 tags from an MP3 file at the given URL. It first fetches the header to determine the tag size, then either fetches just the tag data (if the server supports Range requests) or slices it from the full file buffer. It extracts common text frames (title, artist, album, year, track) and album art (APIC frame), returning an object with the parsed tags.
 * @param {string} url - The URL of the MP3 file to read tags from.
 * @returns {Promise<Object|null>} An object containing the parsed tags, or null if no ID3v2 tag is found.
 */
async function readID3v2(url) {
  // First fetch header to get tag size
  const headerRes = await fetch(url, { headers: { Range: "bytes=0-9" } });
  const fullBuffer = await headerRes.arrayBuffer();
  const header = new Uint8Array(fullBuffer, 0, 10);

  if (String.fromCharCode(header[0], header[1], header[2]) !== "ID3")
    return null;

  const size =
    (header[6] << 21) | (header[7] << 14) | (header[8] << 7) | header[9];

  let bytes;
  if (headerRes.status === 206) {
    // Server supports Range requests — fetch just the tag data
    const tagRes = await fetch(url, {
      headers: { Range: `bytes=10-${10 + size}` },
    });
    bytes = new Uint8Array(await tagRes.arrayBuffer());
  } else {
    // Server returned full file — slice tag data from the buffer we already have
    bytes = new Uint8Array(fullBuffer, 10, size);
  }

  const decoder = new TextDecoder("utf-8");
  const tags = {};
  let offset = 0;

  while (offset < bytes.length - 10) {
    const frameId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
    if (frameId === "\0\0\0\0") break;

    const frameSize =
      (bytes[offset + 4] << 24) |
      (bytes[offset + 5] << 16) |
      (bytes[offset + 6] << 8) |
      bytes[offset + 7];
    const frameData = bytes.slice(offset + 10, offset + 10 + frameSize);

    const frameMap = {
      TIT2: "title",
      TPE1: "artist",
      TALB: "album",
      TYER: "year",
      TRCK: "track",
    };

    if (frameMap[frameId]) {
      // Text frame - skip encoding byte
      tags[frameMap[frameId]] = decoder
        .decode(frameData.slice(1))
        .replace(/\0/g, "");
    } else if (frameId === "APIC") {
      // Album art frame
      const encoding = frameData[0];
      let i = 1;

      // Read MIME type (null-terminated)
      let mimeType = "";
      while (frameData[i] !== 0) {
        mimeType += String.fromCharCode(frameData[i++]);
      }
      i++; // skip null

      i++; // skip picture type byte

      // Skip description (null-terminated, encoding-dependent)
      if (encoding === 1 || encoding === 2) {
        // UTF-16: look for double null
        while (!(frameData[i] === 0 && frameData[i + 1] === 0)) i++;
        i += 2;
      } else {
        // ISO-8859-1 or UTF-8: single null
        while (frameData[i] !== 0) i++;
        i++;
      }

      // Rest is image data
      const imageData = frameData.slice(i);
      const blob = new Blob([imageData], { type: mimeType || "image/jpeg" });
      tags.image = URL.createObjectURL(blob);
    }

    offset += 10 + frameSize;
  }
  return tags;
}

export { readID3v2 };
