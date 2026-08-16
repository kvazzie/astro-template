# 16 — Migrate implementation boundaries to package import maps

**What to build:** Replace the catch-all source alias with narrow extensionless
package import maps that expose architectural roles instead of physical paths,
after the preceding module changes have stabilized the boundaries to publish.

**Blocked by:** 01 — Rename formatting commands to fmt; 02 — Adopt Astro's native environment schema; 03 — Generate the i18next TypeScript layer; 04 — Enforce the module import convention; 05 — Export component contracts explicitly; 06 — Add the Storybook Astro UI workbench; 07 — Add fail-fast SSG contracts; 08 — Add an observability seam to SSG contracts; 09 — Export DTCG design tokens for build-time consumers; 10 — Build a functional page-head model; 11 — Pass locale explicitly across component boundaries; 12 — Render native locale-alternate links; 13 — Add colocated rendered tests for layouts and pages; 14 — Package the optional MDX ESLint configuration.

**Status:** ready-for-agent

- [ ] Narrow maps expose supported roles such as components, layouts, localization, libraries, and styles without exposing the complete source tree.
- [ ] Every internal source specifier is extensionless; physical `.ts`, `.js`, `.astro`, or other extensions are owned by map targets rather than consumers.
- [ ] Existing component directories, companion files, barrels, and index modules are preserved even when explicit map entries are needed.
- [ ] Astro, TypeScript, Vitest, Storybook, ESLint, and supported editors resolve the same imports without private fallback aliases or silent extension inference.
- [ ] The legacy catch-all alias is removed only after all call sites migrate, and the complete quality command passes.
