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

import type * as t from "@types";
import type { Plugin as EsbuildPlugin, PluginBuild } from "esbuild";

export function VADPlugin(config: Partial<t.VADPluginConfig> = {}): EsbuildPlugin {
   console.debug(config);
   return {
      name: "VADPlugin",
      setup: (build: PluginBuild) => {
         // TODO
         console.debug(build);
      },
   };
}
