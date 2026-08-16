# 09 — Export DTCG design tokens for build-time consumers

**What to build:** Extend the pinned design generation pipeline so DESIGN.md
atomically produces both styling CSS and tool-neutral DTCG JSON, giving Astro
frontmatter a validated build-time source for browser metadata without shipping
the token document to the client.

**Blocked by:** 07 — Add fail-fast SSG contracts.

**Status:** ready-for-agent

- [ ] One generation command validates DESIGN.md and produces both CSS and DTCG JSON deterministically.
- [ ] Both generated artifacts are disposable, ignored, written atomically, and materialized during preparation, development, checks, and builds.
- [ ] The DTCG contract contains and validates the named browser-theme color required by page-head rendering.
- [ ] Missing, malformed, or partial token output fails through a readable build contract.
- [ ] Public-seam tests cover successful dual export and failure without leaving partial artifacts.
