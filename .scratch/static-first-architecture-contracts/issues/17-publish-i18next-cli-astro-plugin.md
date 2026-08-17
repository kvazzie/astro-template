# 17 — Publish an Astro plugin for i18next CLI

**What to build:** Turn the proven local Astro extraction adapter into a
dedicated, maintained i18next CLI plugin package, using this ticket as the source
for the public GitHub issue before implementation begins.

**Blocked by:** 03 — Generate the i18next TypeScript layer.

**Status:** ready-for-agent

- [ ] A public GitHub issue captures the package boundary, current local adapter behavior, and the reasons the unpublished `@classictrader/i18next-cli-plugin-astro` repository is not adopted directly.
- [ ] The package supports the current Astro compiler and i18next CLI peer ranges and fails extraction when Astro compilation fails.
- [ ] End-to-end tests prove extraction of keys and default values from both Astro frontmatter and template expressions.
- [ ] CI, semantic releases, registry publication, ownership, and maintenance expectations are established before the template consumes the package.
- [ ] The template replaces its local adapter only after a released package passes the complete quality command.
