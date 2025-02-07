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
import * as ort from "onnxruntime-web";

export class SileroModel {
   private session: ort.InferenceSession;
   private state: ort.Tensor;
   private readonly sr: ort.Tensor;
   private readonly ortInstance: t.OrtModule;

   constructor(
      session: ort.InferenceSession,
      state: ort.Tensor,
      sr: ort.Tensor,
      ortInstance: t.OrtModule,
   ) {
      this.session = session;
      this.state = state;
      this.sr = sr;
      this.ortInstance = ortInstance;
   }

   static getNewState(ortInstance: t.OrtModule): ort.TypedTensor<"float32"> {
      const zeroes = new Array(2 * 128).fill(0);
      return new ortInstance.Tensor("float32", zeroes, [2, 1, 128]);
   }

   static async new(ortInstance: t.OrtModule, modelFetcher: t.ModelFetcher): Promise<SileroModel> {
      console.debug("Loading VAD...");
      const modelArrayBuffer = await modelFetcher();
      const session = await ortInstance.InferenceSession.create(modelArrayBuffer);
      const sr = new ortInstance.Tensor("int64", [16000n]);
      const state = SileroModel.getNewState(ortInstance);
      console.debug("...finished loading VAD");
      return new SileroModel(session, state, sr, ortInstance);
   }

   resetState() {
      this.state = SileroModel.getNewState(this.ortInstance);
   }

   async process(audioFrame: Float32Array): Promise<t.SpeechProbabilities> {
      const dims = [1, audioFrame.length];
      const tensor = new this.ortInstance.Tensor("float32", audioFrame, dims);
      const out = await this.session.run({
         input: tensor,
         state: this.state,
         sr: this.sr,
      });
      this.state = out.stateN;
      let [isSpeech] = out.output.data;
      isSpeech = Number(isSpeech);
      return {
         notSpeech: 1 - isSpeech,
         isSpeech,
      };
   }
}
