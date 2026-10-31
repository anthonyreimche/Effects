// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The Develop "Effects" panel: Vignette and Grain sliders over the open photo's
// params, each drag one undoable step.

import { GRAIN_SLIDERS, VIGNETTE_SLIDERS, type SliderSpec } from "./adjustments";
import { React, api } from "./rt";
import type { DevelopParams } from "./safelight";
import { cls } from "./styles";

type Group = "vignette" | "grain";

function Section<G extends Group>({
  group,
  title,
  sliders,
}: {
  group: G;
  title: string;
  sliders: readonly SliderSpec<Extract<keyof DevelopParams[G], string>>[];
}) {
  const { Slider } = api.components;
  const useDevelopStore = api.stores.useDevelopStore;
  const values = useDevelopStore((s) => s.params[group]);
  const setParam = useDevelopStore((s) => s.setParam);
  const commitEdit = useDevelopStore((s) => s.commitEdit);
  return (
    <div>
      <div className={cls.heading}>{title}</div>
      <div className={cls.sliders}>
        {sliders.map((s) => (
          <Slider
            key={s.field}
            label={s.label}
            value={values[s.field] as number}
            min={s.min}
            max={s.max}
            step={s.step}
            onChange={(v) => setParam(group, { ...values, [s.field]: v })}
            onCommit={() => void commitEdit(`${title} ${s.label}`)}
          />
        ))}
      </div>
    </div>
  );
}

export function EffectsPanel() {
  const { Panel } = api.components;
  return (
    <Panel title="Effects" defaultOpen={false}>
      <div className={cls.sections}>
        <Section group="vignette" title="Vignette" sliders={VIGNETTE_SLIDERS} />
        <Section group="grain" title="Grain" sliders={GRAIN_SLIDERS} />
      </div>
    </Panel>
  );
}
