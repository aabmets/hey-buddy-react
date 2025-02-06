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

import { JSX } from "react";

export {
   SpeechProbabilities,
   FrameProcessorOptions,
   FrameProcessorEvent,
   FrameProcessorInterface,
   ModelProcessor,
} from "./frame_processor";

export interface ProviderProps {
   children: JSX.Element | JSX.Element[];
   autoStart?: boolean;
   autoPause?: boolean;
}

export interface WakeWordControls {
   startListening: () => void;
   pauseListening: () => void;
   listening: boolean;
   loading: boolean;
   error: string | null;
}

export interface VADPluginConfig {
   [key: string]: string | number;
}
