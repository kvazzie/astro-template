# 02 — Adopt Astro's native environment schema

**What to build:** Move project environment metadata onto Astro's native schema
and generated environment modules so a clean project gets runtime validation,
type inference, and one authoritative declaration of public and secret access.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The public site URL is declared through Astro's environment schema with build-safe behavior preserved.
- [ ] Application code reads schema-backed environment exports rather than custom import-meta declarations.
- [ ] The obsolete hand-written environment type declaration is removed.
- [ ] Type checking, static build, and the complete quality command pass.
