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
import type { NormalizedInputOptions, Plugin as RollupPlugin } from "rollup";

export function VADPlugin(config: Partial<t.VADPluginConfig> = {}): RollupPlugin {
   console.debug(config);
   return {
      name: "VADPlugin",
      buildStart: (options: NormalizedInputOptions) => {
         // TODO
         console.debug(options);
      },
   };
}
