# 14 — Package the optional MDX ESLint configuration

**What to build:** Move the plug-and-play MDX linting surface into a dedicated
workspace package and make the pnpm workspace manifest the sole authority for
workspace discovery, without installing MDX into the application prematurely.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The optional MDX ESLint configuration is consumable from a dedicated workspace package with its own required dependencies.
- [ ] Adding Astro MDX later requires a documented import and no restructuring of the main lint configuration.
- [ ] The redundant root workspace declaration is removed while pnpm and Turbo still discover every package.
- [ ] MDX remains absent from the application until a real content requirement exists.
- [ ] Frozen installation and the complete quality command pass.
