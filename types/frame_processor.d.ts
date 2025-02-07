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

import type * as c from "@src/vad/constants";

export interface FrameProcessorOptions {
   /**
    * Threshold over which values returned by the Silero VAD model will be considered
    * as positively indicating speech. The Silero VAD model is run on each frame.
    * This number should be between 0 and 1.
    */
   positiveSpeechThreshold: number;

   /**
    * Threshold under which values returned by the Silero VAD model will be considered
    * as indicating an absence of speech. Note that the creators of the Silero VAD have
    * historically set this number at 0.15 less than `positiveSpeechThreshold`.
    */
   negativeSpeechThreshold: number;

   /**
    * After a VAD value under the `negativeSpeechThreshold` is observed, the algorithm
    * will wait `redemptionFrames` frames before running `onSpeechEnd`. If the model returns
    * a value over `positiveSpeechThreshold` during this grace period, then the algorithm will
    * consider the previously-detected "speech end" as having been a false negative.
    */
   redemptionFrames: number;

   /**
    * Number of audio samples (under a sample rate of 16000) to comprise one "frame" to feed
    * to the Silero VAD model. The `frame` serves as a unit of measurement of lengths of audio
    * segments and many other parameters are defined in terms of frames. The authors of the
    * Silero VAD model offer the following warning:
    *
    * > WARNING! Silero VAD models were trained using 512, 1024, 1536 samples for 16000 sample rate and
    * > 256, 512, 768 samples for 8000 sample rate. Values other than these may affect model perfomance!
    *
    * In this context, audio fed to the VAD model always has sample rate 16000.
    * It is probably a good idea to leave this at 1536.
    */
   frameSamples: number;

   /**
    * Number of frames to prepend to the audio segment that will be passed to `onSpeechEnd`.
    * */
   preSpeechPadFrames: number;

   /**
    * If an audio segment is detected as a speech segment according to initial algorithm
    * but it has fewer than `minSpeechFrames`, it will be discarded and `onVADMisfire`
    * will be run instead of `onSpeechEnd`.
    */
   minSpeechFrames: number;

   /**
    * If true, when the user pauses the VAD, it may trigger `onSpeechEnd`.
    */
   submitUserSpeechOnPause: boolean;
}

export type FrameProcessorEvent =
   | { msg: c.Message.VADMisfire }
   | { msg: c.Message.SpeechStart }
   | { msg: c.Message.SpeechRealStart }
   | {
        msg: c.Message.SpeechEnd;
        audio: Float32Array;
     }
   | {
        msg: c.Message.FrameProcessed;
        probs: SpeechProbabilities;
        frame: Float32Array;
     };

export interface FrameProcessorInterface {
   resume: () => void;
   process: (arr: Float32Array, handleEvent: (event: FrameProcessorEvent) => void) => Promise<void>;
   endSegment: (handleEvent: (event: FrameProcessorEvent) => void) => {
      msg?: c.Message;
      audio?: Float32Array;
   };
}

export interface SpeechProbabilities {
   notSpeech: number;
   isSpeech: number;
}

export type ModelProcessor = (frame: Float32Array) => Promise<SpeechProbabilities>;
