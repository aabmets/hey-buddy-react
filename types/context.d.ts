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

import type { ReactNode } from "react";

export interface ProviderProps {
   children: ReactNode | ReactNode[];
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
