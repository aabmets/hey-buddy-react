import type * as t from "@types";
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
import * as c from "./constants";

export function validateOptions(options: t.FrameProcessorOptions) {
   if (!c.RECOMMENDED_FRAME_SAMPLES.includes(options.frameSamples)) {
      console.warn("You are using an unusual frame size");
   }
   if (options.positiveSpeechThreshold < 0 || options.positiveSpeechThreshold > 1) {
      console.warn("positiveSpeechThreshold should be a number between 0 and 1");
   }
   if (
      options.negativeSpeechThreshold < 0 ||
      options.negativeSpeechThreshold > options.positiveSpeechThreshold
   ) {
      console.warn("negativeSpeechThreshold should be between 0 and positiveSpeechThreshold");
   }
   if (options.preSpeechPadFrames < 0) {
      console.warn("preSpeechPadFrames should be positive");
   }
   if (options.redemptionFrames < 0) {
      console.warn("redemptionFrames should be positive");
   }
}
