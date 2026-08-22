# 04: Close the migration through the complete quality gate

**What to build:** Finish the tooling migration as a coherent template workflow.
Remove dependency leftovers from the former root-owned configuration, align the
documentation with the Opt-in and Opt-out scopes, and prove that a clean Node 24
checkout passes the same complete quality gate used by CI.

**Blocked by:** 01: Make the shared ESLint contract type-safe; 02: Make ESLint
honor tooling ownership scopes; 03: Make Prettier honor tooling ownership scopes.

**Status:** ready-for-agent

- [ ] Plugin and configuration dependencies are owned by the shared tooling
      packages or their actual CLI consumers, with obsolete root copies removed.
- [x] The workspace manifest and lockfile describe every app, package, and
      tooling workspace without redundant discovery sources.
- [ ] The documented root commands match their coordinator behavior and the
      local workspace task contract.
- [ ] The optional MDX instructions use the exported ESLint layers in their
      supported order without installing MDX into the application prematurely.
- [ ] The tooling glossary and repository documentation use Opt-in scope and
      Opt-out scope consistently.
- [x] Frozen dependency installation succeeds under Node 24.
- [ ] Turbo dry runs contain executable check, lint, and formatting tasks for
      every workspace expected to participate.
- [ ] The complete repository quality command passes under Node 24.
- [ ] No unrelated application, static-build, design, localization, or
      deployment behavior changes as part of the migration.
