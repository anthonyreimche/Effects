// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Registers the Develop "Effects" panel and the Vignette and Grain stages of
// this release's line. It was core's built-in `core.effects` until Safelight
// 3.2.0 and keeps that panel id, so saved layouts keep it where it was.

import { EffectsPanel } from "./EffectsPanel";
import { initRuntime } from "./rt";
import type { Line, SafelightAPI } from "./safelight";
import { effectsStages } from "./stages";
import { effectsCss } from "./styles";

export const PANEL_ID = "core.effects";
export const STYLESHEET_ID = "safelight.effects.styles";

/** The release line: this release's major version (vite.config.ts). */
export const LINE = __SAFELIGHT_LINE__ as Line;

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  host.registerStylesheet({ id: STYLESHEET_ID, css: effectsCss() });
  for (const stage of effectsStages(LINE)) host.registerProcessingStage(stage);
  host.registerPanel({
    id: PANEL_ID,
    title: "Effects",
    component: EffectsPanel,
    defaultDock: { module: "develop", direction: "right", order: 10, width: 280, height: 150 },
    onReset: () => void host.stores.useDevelopStore.getState().resetParams(["vignette", "grain"], "Reset Effects"),
  });
}
