# 13 — Add colocated rendered tests for layouts and pages

**What to build:** Verify page-shell behavior at the real Astro rendering seam,
using colocated tests for layouts and pages while leaving pure UI verification to
Storybook and pure library behavior to focused Vitest tests.

**Blocked by:** 09 — Export DTCG design tokens for build-time consumers; 10 — Build a functional page-head model; 12 — Render native locale-alternate links.

**Status:** ready-for-agent

- [ ] Layout tests render real HTML and verify document language, translated title and description, canonical URL, alternates, robots policy, and generated theme color.
- [ ] Every Open Graph meta element has only `property` and `content`, and every Twitter meta element has only `name` and `content`.
- [ ] Representative page tests cover the complete handoff into the layout for the initial locale and an additional locale.
- [ ] Invalid head or locale input produces the expected contract failure rather than fallback markup.
- [ ] Tests remain colocated with layouts and pages, do not move component structure, and pass through the complete quality command.
