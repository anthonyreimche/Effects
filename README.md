# Effects for Safelight

The Develop **Effects** panel: Vignette and Grain.

- **Vignette:** Amount darkens (negative) or lightens (positive) the edges.
  Midpoint sets how far in it reaches, Roundness goes from rectangular to
  round, Feather softens its edge, and Highlights keeps bright areas from
  darkening.
- **Grain:** Amount, Size, Roughness (a second, finer layer) and Color
  (separate grain per channel instead of one shared grain).

Each drag is one Undo step. Right-click the panel's header and choose
**Reset to defaults** to set both back as one step.

Until Safelight 3.2.0 this panel was built in. It keeps the built-in panel's
id (`core.effects`), so layouts saved before then keep it where it was, and
photos keep their vignette and grain settings. While the extension is off or
uninstalled, those photos show without their effects; Develop says so and
offers to bring it back.

## Release lines

A release's major version is its line: the process version its effects were
written for. Line 1 clips what the effects make to the displayable range, as
Safelight did for its first process version. Lines 2 and 3 pass it on to the
steps after them. The installed release draws every photo with its line, so
picking a 1.x release in the Extensions store brings back the first look for
all photos.

To build another line, set `version` in both `safelight.json` and
`package.json` to that major version; `vite.config.ts` reads the line from it.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```

`test/stages.test.ts` pins each line's stage text with the same hashes as
Safelight's own copy (`src/rendering/webgl/essential-stages.test.ts` in the
app). Change both together.
