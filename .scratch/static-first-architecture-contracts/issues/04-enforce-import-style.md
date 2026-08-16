# 04 — Enforce the module import convention

**What to build:** Establish a visible distinction between environment APIs,
internal independent modules, and Astro components so imports communicate the
kind of dependency they introduce and ESLint prevents drift.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Framework and environment APIs use named imports.
- [ ] Internal independent modules use namespace imports, while Astro components use default imports.
- [ ] Type-only imports follow the same convention.
- [ ] ESLint reports representative violations and accepts compliant imports without requiring physical path changes.
- [ ] The complete quality command passes with the convention applied to current code.
