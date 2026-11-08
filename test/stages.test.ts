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

describe("dormantWhen", () => {
  const AT_REST: DevelopParams = {
    vignette: { amount: 0, midpoint: 50, roundness: 0, feather: 50, highlights: 0 },
    grain: { amount: 0, size: 25, roughness: 50, color: 0 },
  };
  const RULES = [
    [VIGNETTE_STAGE_ID, { uVignetteAmount: 0 }],
    [GRAIN_STAGE_ID, { uGrainAmount: 0 }],
  ] as const;

  /** Whether the stage's rule holds for the params, as the stage derives them. */
  const holds = (line: Line, id: string, params: DevelopParams): boolean => {
    const stage = effectsStages(line).find((s) => s.id === id);
    const rule = Object.entries(stage?.dormantWhen ?? {});
    expect(rule).not.toEqual([]);
    const derived: Record<string, unknown> = stage?.derive?.(params) ?? {};
    return rule.every(([key, value]) => derived[key] === value);
  };

  // Both helpers return before touching the pixel at amount 0, ahead of line
  // 1's closing clip, so every line can sleep.
  it.each(RULES.flatMap(([id, rule]) => ([1, 2, 3] as const).map((line) => [line, id, rule] as const)))(
    "lets line %i's %s sleep at amount 0",
    (line, id, rule) => {
      expect(effectsStages(line).find((s) => s.id === id)?.dormantWhen).toEqual(rule);
    },
  );

  it.each(RULES.flatMap(([id, rule]) => ([1, 2, 3] as const).map((line) => [line, id, rule] as const)))(
    "names a float uniform line %i's %s declares, and no array",
    (line, id, rule) => {
      const stage = effectsStages(line).find((s) => s.id === id);
      for (const key of Object.keys(rule)) {
        const uniform = stage?.uniforms.find((u) => u.key === key);
        expect(uniform?.glslType).toBe("float");
        expect(uniform).not.toHaveProperty("length");
      }
    },
  );

  it.each(RULES.map(([id]) => [id] as const))("lets %s keep its other settings while asleep", (id) => {
    const shaped: DevelopParams = {
      vignette: { amount: 0, midpoint: 20, roundness: -60, feather: 90, highlights: 70 },
      grain: { amount: 0, size: 90, roughness: 100, color: 80 },
    };
    expect(holds(3, id, AT_REST)).toBe(true);
    expect(holds(3, id, shaped)).toBe(true);
  });

  it.each([
    [VIGNETTE_STAGE_ID, { ...AT_REST, vignette: { ...AT_REST.vignette, amount: -0.5 } }],
    [VIGNETTE_STAGE_ID, { ...AT_REST, vignette: { ...AT_REST.vignette, amount: 40 } }],
    [GRAIN_STAGE_ID, { ...AT_REST, grain: { ...AT_REST.grain, amount: 1 } }],
  ])("breaks %s for an amount that does something", (id, params) => {
    expect(holds(3, id, params)).toBe(false);
  });
});

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
