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
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: {
    host: "::",
    port: 8080,
  },
  // Tells Vite's development/SSR system to keep tslib bundle safe
  ssr: {
    noExternal: ["tslib", "@supabase/auth-js", "@supabase/supabase-js"],
  },
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "src/server.ts" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // Explicitly targets Nitro engine to inline the modules into the final serverless package
    ...(command === "build"
      ? [
          nitro({
            preset: "netlify",
            externals: {
              inline: ["tslib", "@supabase/auth-js", "@supabase/supabase-js"],
            },
          }),
        ]
      : []),
    react(),
  ],
}));