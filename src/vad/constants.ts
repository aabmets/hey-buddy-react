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

export const RECOMMENDED_FRAME_SAMPLES = [512, 1024, 1536];

export enum Message {
   AudioFrame = "AUDIO_FRAME",
   SpeechStart = "SPEECH_START",
   VADMisfire = "VAD_MISFIRE",
   SpeechEnd = "SPEECH_END",
   SpeechStop = "SPEECH_STOP",
   SpeechRealStart = "SPEECH_REAL_START",
   FrameProcessed = "FRAME_PROCESSED",
}

export const defaultV5FrameProcessorOptions: t.FrameProcessorOptions = {
   positiveSpeechThreshold: 0.5,
   negativeSpeechThreshold: 0.5 - 0.15,
   preSpeechPadFrames: 3,
   redemptionFrames: 24,
   frameSamples: 512,
   minSpeechFrames: 9,
   submitUserSpeechOnPause: false,
};

export const defaultRealTimeVADOptions: t.RealTimeVADOptions = {
   ...defaultV5FrameProcessorOptions,
   onFrameProcessed: () => null,
   onVADMisfire: () => console.debug("VAD misfire"),
   onSpeechStart: () => console.debug("Detected speech start"),
   onSpeechRealStart: () => console.debug("Detected real speech start"),
   onSpeechEnd: () => console.debug("Detected speech end"),
   baseAssetPath: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@latest/dist/",
   onnxWASMBasePath: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/",
   stream: undefined,
   ortConfig: undefined,
   workletOptions: {},
};
