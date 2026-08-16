# 05 — Export component contracts explicitly

**What to build:** Make every current and future Astro component or layout expose
its Props type and public constants as an intentional API, while preserving the
repository's existing component organization.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Every current Astro component and layout exports its Props type and any public constant it declares.
- [ ] The ESLint rule that prohibits component exports is disabled deliberately and the convention is documented for agents.
- [ ] No component directories, companion files, barrel files, or index modules are moved or normalized as part of this work.
- [ ] Astro type checking and the complete quality command pass.
