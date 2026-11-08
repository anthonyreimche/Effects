// Vignette and Grain on the real renderer (run via `npm run test:gpu`): at
// amount 0 each leaves the frame as it would be without the stage, whatever its
// other settings are, and the live view leaves it out; move the amount and it
// is back in and the frame changes. Every line declares the rules: both helpers
// return before the pixel is touched, ahead of line 1's closing clip.

import { DEFAULT_DEVELOP_PARAMS, proveDormancy } from "./dormancy-rig";
import { GRAIN_STAGE_ID, VIGNETTE_STAGE_ID, effectsStages } from "@ext/stages";

const EFFECTS = "safelight.effects";
const stages = (line: 1 | 2 | 3) => effectsStages(line);
const VIGNETTE = DEFAULT_DEVELOP_PARAMS.vignette;
const GRAIN = DEFAULT_DEVELOP_PARAMS.grain;

proveDormancy(EFFECTS, stages, {
  title: "Vignette",
  stageId: VIGNETTE_STAGE_ID,
  lines: [1, 2, 3],
  // Nothing comes after the Vignette but Grain, which only adds to the colour.
  context: false,
  rests: {
    "its other settings are moved": {
      vignette: { amount: 0, midpoint: 20, roundness: -60, feather: 90, highlights: 70 },
    },
  },
  moves: {
    "darkening": { vignette: { ...VIGNETTE, amount: -60 } },
    "lightening": { vignette: { ...VIGNETTE, amount: 50 } },
  },
});

proveDormancy(EFFECTS, stages, {
  title: "Grain",
  stageId: GRAIN_STAGE_ID,
  lines: [1, 2, 3],
  context: false,
  rests: {
    "its other settings are moved": { grain: { amount: 0, size: 90, roughness: 100, color: 80 } },
  },
  moves: {
    "an amount": { grain: { ...GRAIN, amount: 40 } },
    "a coloured amount": { grain: { ...GRAIN, amount: 40, color: 60 } },
  },
});
