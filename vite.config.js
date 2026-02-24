import { defineConfig } from "vite";

const entry = process.env.LIB_ENTRY || "vanilla";

const libConfig =
  entry === "react"
    ? {
        entry: "src/react.jsx",
        name: "WebMP3React",
        formats: ["es"],
        fileName: "react",
      }
    : {
        entry: "src/index.js",
        name: "WebMP3",
        formats: ["es"],
        fileName: "web-mp3",
      };

export default defineConfig({
  server: {
    proxy: {
      "/mp3": {
        target: "https://owneroperators.online",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: entry !== "react",
    lib: libConfig,
    rollupOptions: {
      external:
        entry === "react" ? ["react", "react-dom", "react/jsx-runtime"] : [],
    },
  },
});
