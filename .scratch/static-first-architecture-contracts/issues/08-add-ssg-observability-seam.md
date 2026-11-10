# 08 — Add an observability seam to SSG contracts

**What to build:** Let finite static builds report contract activity through a
narrow optional tracing seam while keeping local builds private, dependency-light,
and fully useful without a collector or network connection.

**Blocked by:** 07 — Accumulate SSG diagnostics with explicit recovery.

**Status:** ready-for-agent

- [ ] The default reporter is local or no-op and never exports telemetry over the network.
- [ ] An optional OpenTelemetry adapter records contract spans, exceptions, and explicit error status without swallowing the thrown failure.
- [ ] Build completion and build failure both flush or shut down tracing cleanly before process exit.
- [ ] In-memory tests verify reporting, error status, exception recording, and flushing without credentials or a real collector.
- [ ] The complete quality command passes with telemetry export disabled.
