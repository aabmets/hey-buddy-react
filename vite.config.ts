import path from "node:path";
import react from "@vitejs/plugin-react";
/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react() as any],
   test: {
      include: ["vitest/tests/**/*"],
      server: {
         deps: {
            external: ["typescript"],
         },
      },
   },
   resolve: {
      alias: {
         "@types": path.resolve(__dirname, "./types/internal.d.ts"),
         "@src": path.resolve(__dirname, "./src"),
      },
   },
});
