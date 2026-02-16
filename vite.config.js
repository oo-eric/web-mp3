import { defineConfig } from "vite";

export default defineConfig({
  // root: 'example',
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
    emptyOutDir: true,
    lib: {
      entry: "src/index.js",
      name: "WebMP3",
      format: "es",
      fileName: "web-mp3",
    },
  },
});
