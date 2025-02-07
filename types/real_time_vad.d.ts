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

import type * as ort from "onnxruntime-web";
import type * as fpt from "./frame_processor";

export type OrtModule = typeof ort;

export type OrtConfigurer = (ortInstance: OrtModule) => void;

export type OrtOptions = { ortConfig?: OrtConfigurer };

export type ModelFetcher = () => Promise<ArrayBuffer>;

export type ModelFactory = (ortInstance: OrtModule, modelFetcher: ModelFetcher) => Promise<Model>;

export interface Model {
   reset_state: () => void;
   process: (arr: Float32Array) => Promise<fpt.SpeechProbabilities>;
}

export type AssetOptions = {
   workletOptions: AudioWorkletNodeOptions;
   baseAssetPath: string;
   onnxWASMBasePath: string;
};

export type AudioConstraints = Omit<
   MediaTrackConstraints,
   "channelCount" | "echoCancellation" | "autoGainControl" | "noiseSuppression"
>;

export interface RealTimeVADOptions
   extends fpt.FrameProcessorOptions,
      RealTimeVADCallbacks,
      OrtOptions,
      AssetOptions {
   additionalAudioConstraints?: AudioConstraints;
   stream: undefined;
}

export interface RealTimeVADCallbacks {
   /**
    * Callback to run after each frame.
    * The size (number of samples) of a frame is given by `frameSamples`.
    */
   onFrameProcessed: (probabilities: fpt.SpeechProbabilities, frame: Float32Array) => void;

   /**
    * Callback to run if speech start was detected, but `onSpeechEnd` will not run,
    * because the audio segment is smaller than `minSpeechFrames`.
    */
   onVADMisfire: () => void;

   /**
    * Callback to run when speech start is detected.
    */
   onSpeechStart: () => void;

   /**
    * Callback to run when speech end is detected.
    * Takes as arg a Float32Array of audio samples between -1 and 1, sample rate 16000.
    * This will not run if the audio segment is smaller than `minSpeechFrames`.
    */
   onSpeechEnd: (audio: Float32Array) => void;

   /**
    * Callback to run when speech is detected as valid (i.e. not a misfire).
    */
   onSpeechRealStart: () => void;
}
