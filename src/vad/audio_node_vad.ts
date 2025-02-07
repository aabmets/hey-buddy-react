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
import * as ort from "onnxruntime-web";
import * as c from "./constants";
import { FrameProcessor } from "./frame_processor";
import { SileroModel } from "./silero_model";
import { validateOptions } from "./validators";

export class AudioNodeVAD {
   public ctx: AudioContext;
   public options: t.RealTimeVADOptions;

   private audioNode!: AudioWorkletNode;
   private frameProcessor: FrameProcessor;
   private gainNode?: GainNode;

   static async new(
      ctx: AudioContext,
      options: Partial<t.RealTimeVADOptions> = {},
   ): Promise<AudioNodeVAD> {
      const fullOptions: t.RealTimeVADOptions = {
         ...c.defaultRealTimeVADOptions,
         ...options,
      } as t.RealTimeVADOptions;

      validateOptions(fullOptions);

      ort.env.wasm.wasmPaths = fullOptions.onnxWASMBasePath;
      if (fullOptions.ortConfig !== undefined) {
         fullOptions.ortConfig(ort);
      }

      const modelURL = `${fullOptions.baseAssetPath}silero_vad_v5.onnx`;
      let model: t.Model;
      try {
         model = await SileroModel.new(ort, () => u.modelFetcher(modelURL));
      } catch (error) {
         console.error(`Encountered an error while loading model file ${modelURL}`);
         throw error;
      }

      const frameProcessor = new FrameProcessor(model.process, model.resetState, {
         frameSamples: fullOptions.frameSamples,
         positiveSpeechThreshold: fullOptions.positiveSpeechThreshold,
         negativeSpeechThreshold: fullOptions.negativeSpeechThreshold,
         redemptionFrames: fullOptions.redemptionFrames,
         preSpeechPadFrames: fullOptions.preSpeechPadFrames,
         minSpeechFrames: fullOptions.minSpeechFrames,
         submitUserSpeechOnPause: fullOptions.submitUserSpeechOnPause,
      });
      const audioNodeVAD = new AudioNodeVAD(ctx, fullOptions, frameProcessor);
      await audioNodeVAD.setupAudioNode();
      return audioNodeVAD;
   }

   constructor(ctx: AudioContext, options: t.RealTimeVADOptions, frameProcessor: FrameProcessor) {
      this.ctx = ctx;
      this.options = options;
      this.frameProcessor = frameProcessor;
   }

   private async setupAudioNode(): Promise<void> {
      const hasAudioWorklet = "audioWorklet" in this.ctx && typeof AudioWorkletNode === "function";
      if (hasAudioWorklet) {
         try {
            const workletURL = `${this.options.baseAssetPath}vad.worklet.bundle.min.js`;
            await this.ctx.audioWorklet.addModule(workletURL);

            const workletOptions = this.options.workletOptions ?? {};
            workletOptions.processorOptions = {
               ...(workletOptions.processorOptions ?? {}),
               frameSamples: this.options.frameSamples,
            };
            this.audioNode = new AudioWorkletNode(this.ctx, "vad-helper-worklet", workletOptions);
            this.audioNode.port.onmessage = async (ev: MessageEvent) => {
               if (ev.data?.message === c.Message.AudioFrame) {
                  let buffer: any = ev.data.data;
                  if (!(buffer instanceof ArrayBuffer)) {
                     buffer = new ArrayBuffer(ev.data.data.byteLength);
                     new Uint8Array(buffer).set(new Uint8Array(ev.data.data));
                  }
                  const frame = new Float32Array(buffer);
                  await this.processFrame(frame);
               }
            };
            return;
         } catch (error) {
            console.error("AudioWorklet setup failed", error);
            throw error;
         }
      }
      throw new Error("Audio worklet missing, unable to continue!");
   }

   pause(): void {
      this.frameProcessor.pause(this.handleFrameProcessorEvent);
   }

   start(): void {
      this.frameProcessor.resume();
   }

   receive(node: AudioNode): void {
      node.connect(this.audioNode);
   }

   async processFrame(frame: Float32Array): Promise<void> {
      await this.frameProcessor.process(frame, this.handleFrameProcessorEvent);
   }

   handleFrameProcessorEvent(ev: t.FrameProcessorEvent): void {
      switch (ev.msg) {
         case c.Message.FrameProcessed:
            this.options.onFrameProcessed(ev.probs, ev.frame as Float32Array);
            break;

         case c.Message.SpeechStart:
            this.options.onSpeechStart();
            break;

         case c.Message.SpeechRealStart:
            this.options.onSpeechRealStart();
            break;

         case c.Message.VADMisfire:
            this.options.onVADMisfire();
            break;

         case c.Message.SpeechEnd:
            this.options.onSpeechEnd(ev.audio as Float32Array);
            break;

         default:
            break;
      }
   }

   destroy(): void {
      if (this.audioNode instanceof AudioWorkletNode) {
         this.audioNode.port.postMessage({
            message: c.Message.SpeechStop,
         });
      }
      this.audioNode.disconnect();
      this.gainNode?.disconnect();
   }

   setFrameProcessorOptions(options: t.FrameProcessorOptions): void {
      this.frameProcessor.options = {
         ...this.frameProcessor.options,
         ...options,
      };
   }
}
