//#region src/adjustments.ts
var e = [
	{
		field: "amount",
		label: "Amount",
		min: -100,
		max: 100,
		step: 1,
		default: 0
	},
	{
		field: "midpoint",
		label: "Midpoint",
		min: 0,
		max: 100,
		step: 1,
		default: 50
	},
	{
		field: "roundness",
		label: "Roundness",
		min: -100,
		max: 100,
		step: 1,
		default: 0
	},
	{
		field: "feather",
		label: "Feather",
		min: 0,
		max: 100,
		step: 1,
		default: 50
	},
	{
		field: "highlights",
		label: "Highlights",
		min: 0,
		max: 100,
		step: 1,
		default: 0
	}
], t = [
	{
		field: "amount",
		label: "Amount",
		min: 0,
		max: 100,
		step: 1,
		default: 0
	},
	{
		field: "size",
		label: "Size",
		min: 25,
		max: 100,
		step: 1,
		default: 25
	},
	{
		field: "roughness",
		label: "Roughness",
		min: 0,
		max: 100,
		step: 1,
		default: 50
	},
	{
		field: "color",
		label: "Colour",
		min: 0,
		max: 100,
		step: 1,
		default: 0
	}
], n, r;
function i(e) {
	r = e, n = e.react;
}
//#endregion
//#region src/styles.ts
var a = "safelight-effects", o = {
	sections: `${a}-sections`,
	heading: `${a}-heading`,
	sliders: `${a}-sliders`
}, s = "#737373";
function c() {
	return `
:where(.${o.sections} > :not(:last-child)) { margin-block: 0 0.25rem; }
:where(.${o.heading}) { padding: 0.5rem 0.5rem 0.125rem; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${s}; }
:where(.${o.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
html.sl-larger-text .${o.heading} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${o.heading} { text-transform: capitalize !important; }
`;
}
//#endregion
//#region src/EffectsPanel.tsx
function l({ group: e, title: t, sliders: i }) {
	let { Slider: a } = r.components, s = r.stores.useDevelopStore, c = s((t) => t.params[e]), l = s((e) => e.setParam), u = s((e) => e.commitEdit);
	return /* @__PURE__ */ n.createElement("div", null, /* @__PURE__ */ n.createElement("div", { className: o.heading }, t), /* @__PURE__ */ n.createElement("div", { className: o.sliders }, i.map((r) => /* @__PURE__ */ n.createElement(a, {
		key: r.field,
		label: r.label,
		value: c[r.field],
		min: r.min,
		max: r.max,
		step: r.step,
		defaultValue: r.default,
		onChange: (t) => l(e, {
			...c,
			[r.field]: t
		}),
		onCommit: () => void u(`${t} ${r.label}`)
	}))));
}
function u() {
	let { Panel: i } = r.components;
	return /* @__PURE__ */ n.createElement(i, {
		title: "Effects",
		defaultOpen: !1
	}, /* @__PURE__ */ n.createElement("div", { className: o.sections }, /* @__PURE__ */ n.createElement(l, {
		group: "vignette",
		title: "Vignette",
		sliders: e
	}), /* @__PURE__ */ n.createElement(l, {
		group: "grain",
		title: "Grain",
		sliders: t
	})));
}
//#endregion
//#region src/stages.ts
var d = "safelight.effects.vignette", f = "safelight.effects.grain", p = (e) => e === 1 ? "return clamp(c, 0.0, 1.0);" : "return c;";
function m(e) {
	return {
		id: d,
		name: "Vignette",
		phase: "effects",
		priority: 50,
		glsl: "c = applyVignette(c, vUv);",
		helpers: `vec3 applyVignette(vec3 c, vec2 uv) {
  if (abs(uVignetteAmount) < 0.001) return c;
  vec2 centered = uv - 0.5;
  float roundness = uVignetteRoundness / 100.0;
  float rx = abs(centered.x);
  float ry = abs(centered.y);
  float rect = max(rx, ry);
  float circ = length(centered);
  float r = mix(rect, circ, clamp(roundness + 0.5, 0.0, 1.0)) * 2.0;
  float midpoint = mix(0.5, 1.5, 1.0 - uVignetteMidpoint / 100.0);
  float feather = mix(0.05, 0.95, uVignetteFeather / 100.0);
  float lo = max(0.0, midpoint - feather * 0.5);
  float hi = midpoint + feather * 0.5;
  float edge = smoothstep(lo, hi, r);
  float vigAmt = uVignetteAmount / 100.0;
  float darkening = vigAmt < 0.0 ? -vigAmt * edge : 0.0;
  float lightening = vigAmt > 0.0 ?  vigAmt * edge : 0.0;
  float hlProtect = uVignetteHighlights > 0.001
    ? clamp(luma(c) * (uVignetteHighlights / 100.0) * 2.0, 0.0, 1.0)
    : 0.0;
  darkening *= (1.0 - hlProtect);
  c = c * (1.0 - darkening) + c * lightening;
  ${p(e)}
}`,
		uniforms: [
			{
				key: "uVignetteAmount",
				glslType: "float",
				default: 0,
				range: {
					min: -100,
					max: 100
				},
				label: "Amount"
			},
			{
				key: "uVignetteMidpoint",
				glslType: "float",
				default: 50,
				range: {
					min: 0,
					max: 100
				},
				label: "Midpoint"
			},
			{
				key: "uVignetteRoundness",
				glslType: "float",
				default: 0,
				range: {
					min: -100,
					max: 100
				},
				label: "Roundness"
			},
			{
				key: "uVignetteFeather",
				glslType: "float",
				default: 50,
				range: {
					min: 0,
					max: 100
				},
				label: "Feather"
			},
			{
				key: "uVignetteHighlights",
				glslType: "float",
				default: 0,
				range: {
					min: 0,
					max: 100
				},
				label: "Highlights"
			}
		],
		derive: ({ vignette: e }) => ({
			uVignetteAmount: e.amount,
			uVignetteMidpoint: e.midpoint,
			uVignetteRoundness: e.roundness,
			uVignetteFeather: e.feather,
			uVignetteHighlights: e.highlights
		})
	};
}
function h(e) {
	return {
		id: f,
		name: "Grain",
		phase: "effects",
		priority: 60,
		glsl: "c = applyGrain(c, vUv);",
		helpers: `float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float gaussGrain(vec2 seed) {
  float u1 = max(grainHash(seed), 1e-6);
  float u2 = grainHash(seed + vec2(127.1, 311.7));
  return sqrt(-2.0 * log(u1)) * cos(6.28318530718 * u2);
}

float grainNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float g00 = gaussGrain(i);
  float g10 = gaussGrain(i + vec2(1.0, 0.0));
  float g01 = gaussGrain(i + vec2(0.0, 1.0));
  float g11 = gaussGrain(i + vec2(1.0, 1.0));
  return mix(mix(g00, g10, f.x), mix(g01, g11, f.x), f.y);
}

vec3 applyGrain(vec3 c, vec2 uv) {
  if (uGrainAmount < 0.001) return c;
  float amount = uGrainAmount / 100.0;
  float sizeT = (uGrainSize - 25.0) / 75.0;
  float rough = uGrainRoughness / 100.0;
  float chromaVar = uGrainColor / 100.0;
  float freq = mix(1400.0, 200.0, sizeT * sizeT);
  vec2 guv = vec2(uv.x * uImageAspect, uv.y) * freq;
  float L = luma(c);
  float density = mix(0.08, 1.0, sqrt(clamp(L, 0.0, 1.0)));
  float sigma = amount * density * 0.14;
  if (chromaVar < 0.01) {
    float n = grainNoise(guv);
    if (rough > 0.15) {
      float t = (rough - 0.15) / 0.85;
      n += grainNoise(guv * 2.17 + 17.3) * 0.5 * t;
    }
    c += vec3(n * sigma);
  } else {
    float rFreq = 1.0 + 0.25 * chromaVar;
    float bFreq = 1.0 - 0.15 * chromaVar;
    float nR = grainNoise(guv * rFreq);
    float nG = grainNoise(guv + vec2(43.7, 91.3));
    float nB = grainNoise(guv * bFreq + vec2(71.9, 37.1));
    if (rough > 0.15) {
      float t = (rough - 0.15) / 0.85;
      nR += grainNoise(guv * rFreq * 2.17 + 17.3) * 0.5 * t;
      nG += grainNoise((guv + vec2(43.7, 91.3)) * 2.17 + 17.3) * 0.5 * t;
      nB += grainNoise((guv * bFreq + vec2(71.9, 37.1)) * 2.17 + 17.3) * 0.5 * t;
    }
    c.r += nR * sigma;
    c.g += nG * sigma;
    c.b += nB * sigma;
  }
  ${p(e)}
}`,
		uniforms: [
			{
				key: "uGrainAmount",
				glslType: "float",
				default: 0,
				range: {
					min: 0,
					max: 100
				},
				label: "Amount"
			},
			{
				key: "uGrainSize",
				glslType: "float",
				default: 25,
				range: {
					min: 25,
					max: 100
				},
				label: "Size"
			},
			{
				key: "uGrainRoughness",
				glslType: "float",
				default: 50,
				range: {
					min: 0,
					max: 100
				},
				label: "Roughness"
			},
			{
				key: "uGrainColor",
				glslType: "float",
				default: 0,
				range: {
					min: 0,
					max: 100
				},
				label: "Color"
			}
		],
		derive: ({ grain: e }) => ({
			uGrainAmount: e.amount,
			uGrainSize: e.size,
			uGrainRoughness: e.roughness,
			uGrainColor: e.color
		})
	};
}
function g(e) {
	return [m(e), h(e)];
}
//#endregion
//#region src/index.tsx
var _ = "core.effects", v = "safelight.effects.styles", y = 3;
function b(e) {
	i(e), e.registerStylesheet({
		id: v,
		css: c()
	});
	for (let t of g(3)) e.registerProcessingStage(t);
	e.registerPanel({
		id: _,
		title: "Effects",
		component: u,
		defaultDock: {
			module: "develop",
			direction: "right",
			order: 10,
			width: 280,
			height: 150
		},
		onReset: () => void e.stores.useDevelopStore.getState().resetParams(["vignette", "grain"], "Reset Effects")
	});
}
//#endregion
export { y as LINE, _ as PANEL_ID, v as STYLESHEET_ID, b as activate };

//# sourceMappingURL=index.js.map