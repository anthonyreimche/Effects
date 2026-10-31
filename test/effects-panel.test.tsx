// The panel draws core's Panel, closed by default, with a Vignette and a Grain
// section of core Sliders over the photo's params, as core's Effects panel did.
// A drag writes the whole group back; its end is one undoable step.

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EffectsPanel } from "../src/EffectsPanel";
import { React, initRuntime } from "../src/rt";
import { DEFAULT_PARAMS, fakeApi } from "./support/fake-api";

function setup() {
  const rig = fakeApi({ vignette: { ...DEFAULT_PARAMS.vignette, amount: -20 } });
  initRuntime(rig.api);
  const view = render(<EffectsPanel />);
  return { rig, view };
}

afterEach(cleanup);

describe("EffectsPanel", () => {
  it("is core's Effects panel, closed by default", () => {
    const { rig } = setup();
    expect(rig.panelProps()).toEqual({ title: "Effects", defaultOpen: false });
  });

  it("heads its two sections", () => {
    setup();
    expect(screen.getByText("Vignette")).toBeTruthy();
    expect(screen.getByText("Grain")).toBeTruthy();
  });

  it("draws core's sliders with core's labels, ranges and the photo's values", () => {
    const { rig, view } = setup();
    expect(rig.sliders(view.container).map(({ label, value, min, max, step }) => [label, value, min, max, step])).toEqual([
      ["Amount", -20, -100, 100, 1],
      ["Midpoint", 50, 0, 100, 1],
      ["Roundness", 0, -100, 100, 1],
      ["Feather", 50, 0, 100, 1],
      ["Highlights", 0, 0, 100, 1],
      ["Amount", 0, 0, 100, 1],
      ["Size", 25, 25, 100, 1],
      ["Roughness", 50, 0, 100, 1],
      ["Color", 0, 0, 100, 1],
    ]);
  });

  it("writes the whole group when a slider moves", () => {
    const { rig, view } = setup();
    const feather = rig.sliders(view.container)[3];
    act(() => feather.onChange(65));
    expect(rig.calls).toEqual([{ setParam: "vignette", value: { ...DEFAULT_PARAMS.vignette, amount: -20, feather: 65 } }]);
    expect(rig.sliders(view.container)[3].value).toBe(65);
  });

  it("names the undo step after the section and slider", () => {
    const { rig, view } = setup();
    const sliders = rig.sliders(view.container);
    act(() => {
      sliders[0].onCommit?.();
      sliders[6].onCommit?.();
    });
    expect(rig.calls).toEqual([{ commitEdit: "Vignette Amount" }, { commitEdit: "Grain Size" }]);
  });
});
