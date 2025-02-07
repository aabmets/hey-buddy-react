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

export type {
   SpeechProbabilities,
   FrameProcessorOptions,
   FrameProcessorEvent,
   FrameProcessorInterface,
   ModelProcessor,
} from "./frame_processor";

export type { ResamplerOptions } from "./resampler";

export type { ProviderProps, WakeWordControls } from "./context";

export interface VADPluginConfig {
   [key: string]: string | number;
}
