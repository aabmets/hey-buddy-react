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
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

/**
 * Recursively searches upwards from the provided module URL or directory to find
 * the specified path. Returns the full resolved path if found, otherwise null.
 *
 * @param forPath - The relative path to search for.
 * @param [startFrom=import.meta.url] - The file URL or filesystem path to start the search from.
 * @returns The full resolved path if found, or an empty string.
 */
export function searchUpwards(forPath: string, startFrom = import.meta.url): string | null {
   const startPath = startFrom.startsWith("file://") ? url.fileURLToPath(startFrom) : startFrom;
   let currentDir = path.dirname(startPath);

   while (true) {
      const possiblePath = path.resolve(currentDir, forPath);
      if (fs.existsSync(possiblePath)) {
         return possiblePath;
      }
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
         break;
      }
      currentDir = parentDir;
   }
   return null;
}

/**
 * Concatenates multiple Float32Array objects into a single Float32Array.
 *
 * @param arrays - The arrays to be concatenated.
 * @returns A new Float32Array containing the concatenated data.
 */
export function concatArrays(arrays: Float32Array[]): Float32Array {
   const sizes = arrays.reduce(
      (out, next) => {
         out.push((out.at(-1) as number) + next.length);
         return out;
      },
      [0],
   );
   const outArray = new Float32Array(sizes.at(-1) as number);
   arrays.forEach((arr, index) => {
      const place = sizes[index];
      outArray.set(arr, place);
   });
   return outArray;
}

export default { searchUpwards, concatArrays };
