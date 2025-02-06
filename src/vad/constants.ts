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
