# 07 — Add fail-fast SSG contracts

**What to build:** Introduce a small production build-time contract API that
expresses states required for a valid static artifact and aborts prerendering
with actionable diagnostics instead of recovering or emitting fallback markup.

**Blocked by:** 04 — Enforce the module import convention.

**Status:** ready-for-agent

- [ ] A contract violation throws an error carrying a stable code, readable message, structured context, original cause, and useful stack.
- [ ] Catching a violation can only enrich and rethrow it; the API provides no recovery path for invalid state.
- [ ] An intentionally invalid static-render fixture exits non-zero, reports the contract clearly, and does not produce a successful artifact.
- [ ] Valid static generation behaves unchanged and the complete quality command passes.
