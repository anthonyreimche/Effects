// What activate() registers: the Effects panel under core's old panel id,
// title, dock spot and reset (so saved layouts keep it), the stylesheet, and the
// Vignette and Grain stages of this release's line.

import { describe, expect, it } from "vitest";
import { EffectsPanel } from "../src/EffectsPanel";
import { LINE, PANEL_ID, STYLESHEET_ID, activate } from "../src/index";
import { effectsStages } from "../src/stages";
import { fakeApi } from "./support/fake-api";
import manifest from "../safelight.json";
import type { ProcessingStageContribution } from "../src/safelight";

describe("activate", () => {
  it("registers the Effects panel, as core's core.effects did", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.panels).toEqual([
      {
        id: "core.effects",
        title: "Effects",
        component: EffectsPanel,
        defaultDock: { module: "develop", direction: "right", order: 10, width: 280, height: 150 },
        onReset: expect.any(Function),
      },
    ]);
    expect(PANEL_ID).toBe("core.effects");
  });

  it("resets Vignette and Grain as one step from the dock header", async () => {
    const rig = fakeApi({ grain: { amount: 40, size: 25, roughness: 50, color: 0 } });
    activate(rig.api);
    rig.panels[0].onReset?.();
    expect(rig.calls).toEqual([{ resetParams: ["vignette", "grain"], label: "Reset Effects" }]);
    expect(rig.develop.getState().params.grain.amount).toBe(0);
  });

  it("registers the stages of the line its major version names", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(LINE).toBe(Number(manifest.version.split(".")[0]));
    const text = (stages: ProcessingStageContribution[]) => stages.map(({ derive: _, ...rest }) => rest);
    expect(text(rig.stages)).toEqual(text(effectsStages(LINE)));
    expect(rig.stages.every((s) => typeof s.derive === "function")).toBe(true);
  });

  it("is a line 3 release", () => {
    expect(LINE).toBe(3);
  });

  it("registers its stylesheet once", () => {
    const rig = fakeApi();
    activate(rig.api);
    expect(rig.stylesheets.map((s) => s.id)).toEqual([STYLESHEET_ID]);
    expect(rig.stylesheets[0].css).toContain(".safelight-effects-heading");
  });

  it("colours the group headings with the theme's muted text", () => {
    const rig = fakeApi();
    activate(rig.api);
    const heading = rig.stylesheets[0].css.split("\n").find((l) => l.startsWith(":where(.safelight-effects-heading)"));
    expect(heading).toContain("color: var(--color-text-muted);");
  });
});
