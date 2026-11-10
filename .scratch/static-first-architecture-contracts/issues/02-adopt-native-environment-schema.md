# 02 — Adopt Astro's native environment schema

**What to build:** Move project environment metadata onto Astro's native schema
and generated environment modules so a clean project gets runtime validation,
type inference, and one authoritative declaration of public and secret access.

**Blocked by:** None — can start immediately.

**Status:** completed

- [x] The public site URL is declared through Astro's environment schema with build-safe behavior preserved.
- [x] Application code reads schema-backed environment exports rather than custom import-meta declarations.
- [x] The obsolete hand-written environment type declaration is removed.
- [x] Type checking, static build, and the complete quality command pass.
