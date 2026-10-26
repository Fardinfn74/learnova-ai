import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build"
      ? [
          nitro({
            preset: "vercel",
          }),
        ]
      : []),
    react(),
  ],
}));