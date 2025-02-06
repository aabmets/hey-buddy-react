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

import * as u from "@src/utils";
import type * as t from "@types";
import * as c from "./constants";

export class FrameProcessor implements t.FrameProcessorInterface {
   public modelProcessFunc: t.ModelProcessor;
   public modelResetFunc: () => null;
   public options: t.FrameProcessorOptions;
   public audioBuffer: { frame: Float32Array; isSpeech: boolean }[];

   public active = false;
   public speaking = false;
   public speechRealStartFired = false;
   public redemptionCounter = 0;
   public speechFrameCount = 0;

   constructor(
      modelProcessFunc: t.ModelProcessor,
      modelResetFunc: () => null,
      options: t.FrameProcessorOptions,
   ) {
      this.modelProcessFunc = modelProcessFunc;
      this.modelResetFunc = modelResetFunc;
      this.options = options;
      this.audioBuffer = [];
      this.reset();
   }

   reset = () => {
      this.speaking = false;
      this.audioBuffer = [];
      this.modelResetFunc();
      this.redemptionCounter = 0;
      this.speechFrameCount = 0;
   };

   pause = (handleEvent: (event: t.FrameProcessorEvent) => void): void => {
      this.active = false;
      if (this.options.submitUserSpeechOnPause) {
         this.endSegment(handleEvent);
      } else {
         this.reset();
      }
   };

   resume = () => {
      this.active = true;
   };

   endSegment = (handleEvent: (event: t.FrameProcessorEvent) => void) => {
      const audioBuffer = this.audioBuffer;
      this.audioBuffer = [];
      const speaking = this.speaking;
      this.reset();

      const speechFrameCount = audioBuffer.reduce((acc, item) => {
         return acc + +item.isSpeech;
      }, 0);

      if (speaking) {
         if (speechFrameCount >= this.options.minSpeechFrames) {
            const audio = u.concatArrays(audioBuffer.map((item) => item.frame));
            handleEvent({ msg: c.Message.SpeechEnd, audio });
         } else {
            handleEvent({ msg: c.Message.VADMisfire });
         }
      }
      return {};
   };

   process = async (frame: Float32Array, handleEvent: (event: t.FrameProcessorEvent) => void) => {
      if (!this.active) {
         return;
      }

      const probs = await this.modelProcessFunc(frame);
      const isSpeech = probs.isSpeech >= this.options.positiveSpeechThreshold;

      handleEvent({ probs, msg: c.Message.FrameProcessed, frame });

      this.audioBuffer.push({
         frame,
         isSpeech,
      });

      if (isSpeech) {
         this.speechFrameCount++;
         this.redemptionCounter = 0;
      }

      if (isSpeech && !this.speaking) {
         this.speaking = true;
         handleEvent({ msg: c.Message.SpeechStart });
      }

      if (
         this.speaking &&
         this.speechFrameCount === this.options.minSpeechFrames &&
         !this.speechRealStartFired
      ) {
         this.speechRealStartFired = true;
         handleEvent({ msg: c.Message.SpeechRealStart });
      }

      if (
         probs.isSpeech < this.options.negativeSpeechThreshold &&
         this.speaking &&
         ++this.redemptionCounter >= this.options.redemptionFrames
      ) {
         this.redemptionCounter = 0;
         this.speechFrameCount = 0;
         this.speaking = false;
         this.speechRealStartFired = false;
         const audioBuffer = this.audioBuffer;
         this.audioBuffer = [];

         const speechFrameCount = audioBuffer.reduce((acc, item) => {
            return acc + +item.isSpeech;
         }, 0);

         if (speechFrameCount >= this.options.minSpeechFrames) {
            const audio = u.concatArrays(audioBuffer.map((item) => item.frame));
            handleEvent({ msg: c.Message.SpeechEnd, audio });
         } else {
            handleEvent({ msg: c.Message.VADMisfire });
         }
      }

      if (!this.speaking) {
         while (this.audioBuffer.length > this.options.preSpeechPadFrames) {
            this.audioBuffer.shift();
         }
         this.speechFrameCount = 0;
      }
   };
}
