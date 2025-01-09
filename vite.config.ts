/*
 *   Apache License 2.0
 *
 *   Copyright (c) 2025, Mattias Aabmets
 *
 *   The contents of this file are subject to the terms and conditions defined in the License.
 *   You may not use, modify, or distribute this file except in compliance with the License.
 *
 *   SPDX-License-Identifier: Apache-2.0
 */

import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/

export default defineConfig({
   plugins: [tsconfigPaths(), react()],
   root: "tests",
   resolve: {
      alias: {
         "@types": path.resolve(__dirname, "./types/internal.d.ts"),
         "@src": path.resolve(__dirname, "./src"),
      },
   },
   server: {
      open: true,
   },
});
