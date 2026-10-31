// The stages each release line registers. Their text is pinned with the hashes
// Safelight's own tests hold for its copy of them
// (src/rendering/webgl/essential-stages.test.ts in the app): a change here
// fails until the app's copy changes the same way, so the program a line
// builds stays the one the app froze for that line's process version.

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { DevelopParams, Line, ProcessingStageContribution } from "../src/safelight";
import { GRAIN_STAGE_ID, VIGNETTE_STAGE_ID, effectsStages } from "../src/stages";

const LINE_HASHES: Record<Line, Record<string, string>> = {
  1: {
    "safelight.effects.vignette": "3dac62ade9e612267b496672e91a2a10fb035fb8b8a23ee224e96b0b5ed58c4e",
    "safelight.effects.grain": "5ad32488fe7a3c56debf686b8c4ef9fcbb72c6de097a326280487eca05f42419",
  },
  2: {
    "safelight.effects.vignette": "51287cbbb0984543d83de81a324ed495b868ddefa277401569cbc262902ffd26",
    "safelight.effects.grain": "9e68fbd0ff683b1620a397a8554fc9a1cd6def243c3f4de6e71a1d86fef07518",
  },
  3: {
    "safelight.effects.vignette": "51287cbbb0984543d83de81a324ed495b868ddefa277401569cbc262902ffd26",
    "safelight.effects.grain": "9e68fbd0ff683b1620a397a8554fc9a1cd6def243c3f4de6e71a1d86fef07518",
  },
};

/** What a line's hash covers, as the app's stageText writes it. */
const stageText = (s: ProcessingStageContribution): string =>
  JSON.stringify([s.id, s.phase, s.priority ?? null, s.anchor ?? null, s.glsl, s.helpers ?? null, s.uniforms, s.textures ?? null]);

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

const CLAMP = "return clamp(c, 0.0, 1.0);";

const PARAMS: DevelopParams = {
  vignette: { amount: -35, midpoint: 40, roundness: 20, feather: 70, highlights: 15 },
  grain: { amount: 30, size: 60, roughness: 80, color: 25 },
};

describe("effectsStages", () => {
  it.each([1, 2, 3] as const)("registers line %i's text as the app froze it", (line) => {
    const got = Object.fromEntries(effectsStages(line).map((s) => [s.id, sha256(stageText(s))]));
    expect(got).toEqual(LINE_HASHES[line]);
  });

  it("closes both helpers with a clamp on line 1 only", () => {
    for (const s of effectsStages(1)) expect(s.helpers).toContain(CLAMP);
    for (const line of [2, 3] as const) {
      for (const s of effectsStages(line)) {
        expect(s.helpers).not.toContain(CLAMP);
        expect(s.helpers?.trimEnd().endsWith("return c;\n}")).toBe(true);
      }
    }
  });

  it("runs Vignette, then Grain, among the effects", () => {
    expect(effectsStages(3).map((s) => [s.id, s.phase, s.priority])).toEqual([
      [VIGNETTE_STAGE_ID, "effects", 50],
      [GRAIN_STAGE_ID, "effects", 60],
    ]);
  });

  it("takes Vignette's uniforms from the photo's vignette params", () => {
    const [vignette] = effectsStages(3);
    expect(vignette.derive?.(PARAMS)).toEqual({
      uVignetteAmount: -35,
      uVignetteMidpoint: 40,
      uVignetteRoundness: 20,
      uVignetteFeather: 70,
      uVignetteHighlights: 15,
    });
  });

  it("takes Grain's uniforms from the photo's grain params", () => {
    const [, grain] = effectsStages(3);
    expect(grain.derive?.(PARAMS)).toEqual({
      uGrainAmount: 30,
      uGrainSize: 60,
      uGrainRoughness: 80,
      uGrainColor: 25,
    });
  });

  it("derives a value for every uniform it declares, and nothing else", () => {
    for (const s of effectsStages(3)) {
      expect(Object.keys(s.derive?.(PARAMS) ?? {}).sort()).toEqual(s.uniforms.map((u) => u.key).sort());
    }
  });
});
