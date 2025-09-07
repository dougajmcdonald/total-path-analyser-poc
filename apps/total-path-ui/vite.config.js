import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [".."],
    },
  },
  publicDir: "public",
  resolve: {
    alias: {
      "@total-path/analyser": resolve(__dirname, "../../packages/analyser"),
      "@total-path/lorcana-data-import": resolve(
        __dirname,
        "../../packages/lorcana/data-import",
      ),
      "@total-path/lorcana-types": resolve(
        __dirname,
        "../../packages/lorcana/types",
      ),
      "@total-path/lorcana-rules": resolve(
        __dirname,
        "../../packages/lorcana/rules",
      ),
    },
  },
});
