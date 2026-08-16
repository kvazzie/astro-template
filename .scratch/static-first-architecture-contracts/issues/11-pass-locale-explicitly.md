# 11 — Pass locale explicitly across component boundaries

**What to build:** Make locale an explicit component and layout input, with a
clear conversion boundary that supplies a valid BCP 47 document language instead
of letting reusable modules read Astro's current locale implicitly.

**Blocked by:** 04 — Enforce the module import convention; 05 — Export component contracts explicitly; 07 — Add fail-fast SSG contracts.

**Status:** ready-for-agent

- [ ] Current pages pass locale context explicitly into every component or layout that needs it.
- [ ] Reusable components and layouts no longer read the current locale from an Astro global.
- [ ] The document language is a validated BCP 47 tag derived at an explicit boundary.
- [ ] Missing or invalid locale input fails with an actionable SSG contract report.
- [ ] Type checking, representative static rendering, and the complete quality command pass.
