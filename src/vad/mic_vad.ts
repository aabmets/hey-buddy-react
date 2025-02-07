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
import { AudioNodeVAD } from "./audio_node_vad";
import * as c from "./constants";
import { validateOptions } from "./validators";

export class MicVAD {
   public options: t.RealTimeVADOptions;
   private audioContext: AudioContext;
   private stream: MediaStream;
   private audioNodeVAD: AudioNodeVAD;
   private sourceNode: MediaStreamAudioSourceNode;
   private listening = false;

   private constructor(
      options: t.RealTimeVADOptions,
      audioContext: AudioContext,
      stream: MediaStream,
      audioNodeVAD: AudioNodeVAD,
      sourceNode: MediaStreamAudioSourceNode,
      listening = false,
   ) {
      this.options = options;
      this.audioContext = audioContext;
      this.stream = stream;
      this.audioNodeVAD = audioNodeVAD;
      this.sourceNode = sourceNode;
      this.listening = listening;
   }

   static async new(options: Partial<t.RealTimeVADOptions> = {}): Promise<MicVAD> {
      const fullOptions: t.RealTimeVADOptions = {
         ...c.defaultRealTimeVADOptions,
         ...options,
      } as t.RealTimeVADOptions;

      validateOptions(fullOptions);

      const stream = await navigator.mediaDevices.getUserMedia({
         audio: {
            ...fullOptions.additionalAudioConstraints,
            channelCount: 1,
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true,
         },
      });
      const audioContext = new AudioContext();
      const sourceNode = new MediaStreamAudioSourceNode(audioContext, {
         mediaStream: stream,
      });

      const audioNodeVAD = await AudioNodeVAD.new(audioContext, fullOptions);
      audioNodeVAD.receive(sourceNode);

      return new MicVAD(fullOptions, audioContext, stream, audioNodeVAD, sourceNode);
   }

   pause(): void {
      this.audioNodeVAD.pause();
      this.listening = false;
   }

   start(): void {
      this.audioNodeVAD.start();
      this.listening = true;
   }

   destroy(): void {
      if (this.listening) {
         this.pause();
      }
      if (this.options.stream === undefined) {
         this.stream.getTracks().forEach((track) => track.stop());
      }
      this.sourceNode.disconnect();
      this.audioNodeVAD.destroy();
      this.audioContext.close();
   }

   setOptions(options: t.FrameProcessorOptions): void {
      this.audioNodeVAD.setFrameProcessorOptions(options);
   }
}
