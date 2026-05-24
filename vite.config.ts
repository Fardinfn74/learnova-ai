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
  // Aggressively force Vite's SSR bundler to merge these sub-dependencies directly
  ssr: {
    noExternal: [
      "tslib", 
      "@supabase/supabase-js", 
      "@supabase/auth-js", 
      "@supabase/postgrest-js", 
      "@supabase/functions-js", 
      "@supabase/storage-js", 
      "@supabase/realtime-js"
    ],
  },
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "src/server.ts" },
    }),
    // Direct, isolated compilation setup for Vercel Serverless Architecture
    ...(command === "build"
      ? [
          nitro({
            preset: "vercel",
            externals: {
              trace: false, // Disables complex tree-shaking that strips sub-dependencies
            },
          }),
        ]
      : []),
    react(),
  ],
}));