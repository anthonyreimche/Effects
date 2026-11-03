// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The panel's sliders, as core's NESTED_ADJUSTMENTS lists them
// (src/state/develop-adjustments.ts): the same fields, labels and ranges, so a
// slider stops where core's adjustment list (Speed Edit, api.develop) does.
// Each default is core's DEFAULT_VIGNETTE / DEFAULT_GRAIN value
// (src/catalog/defaults.ts), which a double-click resets the slider to.

import type { GrainParams, VignetteParams } from "./safelight";

export interface SliderSpec<K extends string> {
  field: K;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export const VIGNETTE_SLIDERS: readonly SliderSpec<keyof VignetteParams>[] = [
  { field: "amount", label: "Amount", min: -100, max: 100, step: 1, default: 0 },
  { field: "midpoint", label: "Midpoint", min: 0, max: 100, step: 1, default: 50 },
  { field: "roundness", label: "Roundness", min: -100, max: 100, step: 1, default: 0 },
  { field: "feather", label: "Feather", min: 0, max: 100, step: 1, default: 50 },
  { field: "highlights", label: "Highlights", min: 0, max: 100, step: 1, default: 0 },
];

export const GRAIN_SLIDERS: readonly SliderSpec<keyof GrainParams>[] = [
  { field: "amount", label: "Amount", min: 0, max: 100, step: 1, default: 0 },
  { field: "size", label: "Size", min: 25, max: 100, step: 1, default: 25 },
  { field: "roughness", label: "Roughness", min: 0, max: 100, step: 1, default: 50 },
  { field: "color", label: "Colour", min: 0, max: 100, step: 1, default: 0 },
];
