# 03 — Generate the i18next TypeScript layer

**What to build:** Make the default translation catalog and i18next declarations
disposable generated artifacts owned by the official i18next CLI, while keeping
tracked secondary catalogs beside the generated default locale and preserving
runtime catalog validation as a separate concern.

**Blocked by:** None — can start immediately.

**Status:** completed

- [x] The generated default catalog lives under `src/assets/i18next/.en`, while tracked secondary catalogs remain formatted sibling assets.
- [x] Generated design CSS and i18next declarations live under the asset and `src/@types` boundaries recommended by the project and i18next.
- [x] Every generated artifact is ignored by Git, Prettier, ESLint, and Stylelint where applicable, without ignoring tracked translations.
- [x] Literal translation calls in TypeScript and Astro own the default-language copy and receive generated autocomplete and compile-time validation.
- [x] i18next CLI, Astro extraction, runtime integration, and backend paths are configured in `i18next.config.ts`; framework locale state remains in `src/i18n/index.ts`.
- [x] Generation and watch commands participate in prepare, check, build, and development lifecycles from a clean checkout.
- [x] Invalid translation keys still fail at the existing schema boundary, pathname behavior remains assigned to ticket 12, and the complete quality command passes.
- [x] Follow-up work records how to replace the temporary integration patch with an actively maintained Astro integration.
