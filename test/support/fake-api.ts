// A stand-in Safelight API over real React and zustand. The develop store holds
// the effects params the way core's does and records every write. Core's Panel
// draws its children; core's Slider is replaced by a stub that keeps the props
// it was last rendered with, by label, so a test can drive a drag and its
// commit the way the real one would.

import * as React from "react";
import { create } from "zustand";
import type {
  DevelopParams,
  DevelopStoreState,
  PanelContribution,
  PanelProps,
  ProcessingStageContribution,
  SafelightAPI,
  SliderProps,
  StoreApi,
  StylesheetContribution,
} from "../../src/safelight";

export type DevelopCall =
  | { setParam: keyof DevelopParams; value: DevelopParams[keyof DevelopParams] }
  | { commitEdit: string }
  | { resetParams: (keyof DevelopParams)[]; label: string };

export const DEFAULT_PARAMS: DevelopParams = {
  vignette: { amount: 0, midpoint: 50, roundness: 0, feather: 50, highlights: 0 },
  grain: { amount: 0, size: 25, roughness: 50, color: 0 },
};

export interface Rig {
  api: SafelightAPI;
  develop: StoreApi<DevelopStoreState>;
  /** Every develop store write, in order. */
  calls: DevelopCall[];
  panels: PanelContribution[];
  stages: ProcessingStageContribution[];
  stylesheets: StylesheetContribution[];
  /** The props core's Panel was last rendered with. */
  panelProps(): Omit<PanelProps, "children">;
  /** The latest props of each slider drawn in `root`, in document order. */
  sliders(root: ParentNode): SliderProps[];
}

export function fakeApi(params: Partial<DevelopParams> = {}): Rig {
  const calls: DevelopCall[] = [];
  const panels: PanelContribution[] = [];
  const stages: ProcessingStageContribution[] = [];
  const stylesheets: StylesheetContribution[] = [];
  let lastPanel: Omit<PanelProps, "children"> | null = null;
  const sliderProps = new Map<number, SliderProps>();
  let nextSlider = 0;

  const develop: StoreApi<DevelopStoreState> = create<DevelopStoreState>()((set) => ({
    params: { ...DEFAULT_PARAMS, ...params },
    setParam: (key, value) => {
      calls.push({ setParam: key, value });
      set((s) => ({ params: { ...s.params, [key]: value } }));
    },
    commitEdit: async (label) => {
      calls.push({ commitEdit: label });
    },
    resetParams: async (keys, label) => {
      calls.push({ resetParams: keys, label });
      set((s) => ({ params: { ...s.params, ...Object.fromEntries(keys.map((k) => [k, DEFAULT_PARAMS[k]])) } }));
    },
  }));

  function Panel({ children, ...props }: PanelProps) {
    lastPanel = props;
    return React.createElement("section", { "aria-label": props.title }, children);
  }

  function Slider(props: SliderProps) {
    const id = React.useRef(nextSlider++).current;
    sliderProps.set(id, props);
    return React.createElement("div", { "data-slider": id }, `${props.label} ${props.value}`);
  }

  const api: SafelightAPI = {
    version: 1,
    extensionId: "safelight.effects",
    react: React,
    registerPanel: (c) => void panels.push(c),
    registerProcessingStage: (c) => void stages.push(c),
    registerStylesheet: (c) => void stylesheets.push(c),
    components: { Panel, Slider },
    stores: { useDevelopStore: develop },
    ui: { tokens: { textMuted: "var(--color-text-muted)" } },
  };

  return {
    api,
    develop,
    calls,
    panels,
    stages,
    stylesheets,
    panelProps: () => {
      if (!lastPanel) throw new Error("Panel has not rendered");
      return lastPanel;
    },
    sliders: (root) =>
      [...root.querySelectorAll("[data-slider]")].map((el) => {
        const props = sliderProps.get(Number(el.getAttribute("data-slider")));
        if (!props) throw new Error("a slider without props");
        return props;
      }),
  };
}
