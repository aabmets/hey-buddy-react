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

export class Resampler {
   public options: t.ResamplerOptions;
   public inputBuffer: number[];

   constructor(options: t.ResamplerOptions) {
      if (options.nativeSampleRate < 16000) {
         console.error(
            "nativeSampleRate is too low. Should have 16000 = targetSampleRate <= nativeSampleRate",
         );
      }
      this.options = options;
      this.inputBuffer = [];
   }

   process = (audioFrame: Float32Array): Float32Array[] => {
      const outputFrames: Float32Array[] = [];
      for (const sample of audioFrame) {
         this.inputBuffer.push(sample);
         while (this.hasEnoughDataForFrame()) {
            const outputFrame = this.generateOutputFrame();
            outputFrames.push(outputFrame);
         }
      }
      return outputFrames;
   };

   private hasEnoughDataForFrame(): boolean {
      const ibLen = this.inputBuffer.length;
      const tsRate = this.options.targetSampleRate;
      const nsRate = this.options.nativeSampleRate;
      const tfSize = this.options.targetFrameSize;
      return (ibLen * tsRate) / nsRate >= tfSize;
   }

   private generateOutputFrame(): Float32Array {
      const ibLen = this.inputBuffer.length;
      const tsRate = this.options.targetSampleRate;
      const nsRate = this.options.nativeSampleRate;
      const tfSize = this.options.targetFrameSize;
      const outputFrame = new Float32Array(tfSize);

      let outputIndex = 0;
      let inputIndex = 0;

      while (outputIndex < tfSize) {
         let sum = 0;
         let num = 0;
         while (inputIndex < Math.min(ibLen, ((outputIndex + 1) * nsRate) / tsRate)) {
            const value = this.inputBuffer[inputIndex];
            if (value !== undefined) {
               sum += value;
               num++;
            }
            inputIndex++;
         }
         outputFrame[outputIndex] = sum / num;
         outputIndex++;
      }

      this.inputBuffer = this.inputBuffer.slice(inputIndex);
      return outputFrame;
   }
}
