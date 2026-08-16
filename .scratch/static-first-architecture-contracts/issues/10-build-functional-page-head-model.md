# 10 — Build a functional page-head model

**What to build:** Replace layout-local metadata construction with a pure
functional page-head API that accepts already translated constituent values and
returns the complete immutable model needed to render canonical, social, robots,
image, title, description, and browser-theme metadata.

**Blocked by:** 03 — Generate the i18next TypeScript layer; 04 — Enforce the module import convention; 05 — Export component contracts explicitly; 07 — Add fail-fast SSG contracts; 09 — Export DTCG design tokens for build-time consumers.

**Status:** ready-for-agent

- [ ] The page-head function receives translated title and description strings and does not call translation infrastructure.
- [ ] Full title, canonical URL, image URL, robots policy, card type, and other derived values come from one immutable functional model rather than a class or mutable builder.
- [ ] Browser theme color is read from generated DTCG data during SSG; no literal design value remains in the layout and no token JSON is added to client output.
- [ ] The layout renders the prepared model and contains no metadata derivation beyond document composition.
- [ ] Colocated library tests cover public transformations and contract failures, and the complete quality command passes.
