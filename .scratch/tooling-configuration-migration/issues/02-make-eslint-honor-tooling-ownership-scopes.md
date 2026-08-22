# 02: Make ESLint honor tooling ownership scopes

**What to build:** Make real ESLint commands enforce an Opt-in scope for root
files and an Opt-out scope inside each app, package, and tooling workspace. A
restricted application import must fail through the same workspace boundary
used by the production lint command, and every workspace must participate in
lint orchestration.

**Blocked by:** 01: Make the shared ESLint contract type-safe.

**Status:** ready-for-agent

- [ ] Root lint configuration covers only explicitly claimed root-owned paths
      and does not claim app, package, or tooling workspace files.
- [ ] Each workspace lint configuration covers normal files within its boundary
      by default and excludes only deliberate artifacts.
- [x] A regression test executes from the application workspace boundary with
      app-local file paths.
- [x] The regression test rejects a registered private import and accepts an
      allowed import, proving that application rules are active.
- [ ] Every app, package, and tooling workspace exposes executable lint and
      lint-fix tasks.
- [ ] Turbo's lint plan contains no nonexistent workspace commands.
- [ ] The root lint command coordinates workspace linting and checks only the
      root's Opt-in scope.
- [ ] The repository lint command passes.
