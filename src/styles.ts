// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The look core gave the Effects panel with Tailwind utilities, as plain CSS
// (the app's Tailwind build never scans an extension). `:where()` drops every
// rule to zero specificity, so a stylesheet that restyles the panel wins over
// them. The `html.sl-larger-text` and `html.sl-title-headings` rules repeat
// core's Accessibility rules for 10 px, uppercase and widely tracked text.

const P = "safelight-effects";

export const cls = {
  sections: `${P}-sections`,
  heading: `${P}-heading`,
  sliders: `${P}-sliders`,
} as const;

/** Tailwind's neutral-500, which core's section headings used. */
const HEADING_GREY = "#737373";

export function effectsCss(): string {
  return `
:where(.${cls.sections} > :not(:last-child)) { margin-block: 0 0.25rem; }
:where(.${cls.heading}) { padding: 0.5rem 0.5rem 0.125rem; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${HEADING_GREY}; }
:where(.${cls.sliders} > :not(:last-child)) { margin-block: 0 0.125rem; }
html.sl-larger-text .${cls.heading} { font-size: 12px !important; text-transform: none !important; letter-spacing: normal !important; }
html.sl-title-headings .${cls.heading} { text-transform: capitalize !important; }
`;
}
