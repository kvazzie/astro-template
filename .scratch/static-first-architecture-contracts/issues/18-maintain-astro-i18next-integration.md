# 18 — Maintain a current Astro i18next integration

**What to build:** Contribute the required fixes to `@gutenye/astro-i18next` or
maintain a dedicated fork/package so this template can depend on a current,
tested integration instead of carrying a pnpm patch indefinitely.

**Blocked by:** 03 — Generate the i18next TypeScript layer.

**Status:** ready-for-agent

- [ ] A public GitHub issue documents the function-valued backend path failure, current pnpm patch, Astro compatibility needs, and the lack of an actively maintained alternative.
- [ ] Upstream contribution versus a maintained fork is decided after reviewing repository activity, maintainer appetite, and the package's Elastic license obligations.
- [ ] The maintained integration supports current Astro and i18next releases, native locale routing, middleware-owned language changes, conditional filesystem catalog paths, and translation hot reloads.
- [ ] Integration tests cover static generation, default and secondary locale loading, function-valued backend paths, middleware behavior, and hot updates.
- [ ] Conditional catalog-path behavior and its tests move out of this application's `i18next.config.ts` into the maintained library's public contract.
- [ ] A released package replaces the local pnpm patch only after the template's complete quality command passes.
