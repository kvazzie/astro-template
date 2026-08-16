# 12 — Render native locale-alternate links

**What to build:** Replace custom pathname manipulation with a dedicated head
component that delegates alternate URL construction to Astro's native i18n API
and consumes only explicit locale and URL inputs.

**Blocked by:** 04 — Enforce the module import convention; 05 — Export component contracts explicitly; 11 — Pass locale explicitly across component boundaries.

**Status:** ready-for-agent

- [ ] The dedicated component exports its Props contract and receives supported locales, active locale context, and the current URL explicitly.
- [ ] Alternate URLs come from Astro's native relative-locale URL API and follow the routing configuration supplied by the active integration.
- [ ] The custom pathname helper and its obsolete tests are removed.
- [ ] Rendered coverage includes the initial locale and an additional locale without asserting routing controls the project does not own.
- [ ] The static build and complete quality command pass.
