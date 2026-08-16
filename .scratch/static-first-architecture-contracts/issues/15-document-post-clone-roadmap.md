# 15 — Document the post-clone customization roadmap

**What to build:** Record an opinionated roadmap for a future idempotent
post-clone tool that can remove optional workflow layers cleanly without turning
the default template into an interactive matrix of configuration choices.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The roadmap identifies removal of Nix and Devenv, MDX readiness, and other optional layers as explicit future actions.
- [ ] Each proposed action is idempotent, leaves the quality gate green, and avoids cleanup commits in a newly generated project.
- [ ] The roadmap distinguishes future tooling from currently supported project creation and does not add a dormant wizard implementation.
- [ ] Documentation formatting and the complete quality command pass.
