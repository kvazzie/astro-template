# Project instructions

This repository is an opinionated Astro project foundation. Preserve its narrow,
coherent workflow instead of adding configuration for every possible user.

## Repository map

- `apps/web`: the Astro application.
- `DESIGN.md`: the only source of design-token values and design intent.
- `scripts`: deterministic design generation and validation.
- `devenv.nix`: optional Node, pnpm, LSP, task, and Git-hook environment.
- root configuration files: shared quality tooling for the workspace.

## Commands

Use pnpm from the repository root.

- `pnpm dev`: generate/watch design tokens and run the Astro app.
- `pnpm check`: run the complete local/CI quality gate.
- `pnpm test`: run Vitest once.
- `pnpm fmt`, `pnpm lint:fix`, `pnpm stylelint:fix`: explicit fixes.
- `pnpm design:generate`: regenerate disposable CSS from `DESIGN.md`.

Do not hand-edit `apps/web/src/styles/design.generated.css`. It is ignored and is
created by lifecycle/build commands.

## Architecture rules

- Keep `apps/web` static until a product requirement chooses an adapter.
- Use the `#/*` alias for cross-directory imports inside `apps/web/src`.
  Colocated modules and bootstrap configuration may use relative imports.
- Treat `@gutenye/astro-i18next` as the locale lifecycle owner. Do not call the
  global `changeLanguage()` from components. The integration injects Astro's
  native i18n config from the shared `preload` and `lng` values; do not duplicate
  it with a top-level `i18n` block in `astro.config.ts`.
- User-interface copy, validation messages, and SEO metadata use typed i18n keys.
  Authored long-form content belongs in localized content entries.
- Add locale definitions once in `src/i18n/config.ts`; Astro, i18next, sitemap,
  and routes must consume that shared definition.
- Use Astro content collections for structured authored content and validate
  cross-cutting identifiers such as translation keys at the schema boundary.
- Browser scripts under `ClientRouter` must be idempotent and initialize through
  Astro lifecycle events, not only `DOMContentLoaded`.
- Preserve semantic HTML, visible focus, reduced motion, and WCAG AA contrast.

## Design rules

- Change visual values in `DESIGN.md`, never in generated CSS.
- Use DaisyUI semantic component classes and theme variables. Components must not
  hardcode raw colors.
- The light/dark bridge in `apps/web/src/styles/app.css` maps semantic DaisyUI
  roles to generated tokens; it must not contain token values.
- Run `pnpm design:check` after changing the design system.
- Avoid gradients, glass effects, decorative animation, excessive cards, and
  oversized pills unless the product establishes a concrete reason.

For current Astro, Tailwind, DaisyUI, or other library behavior, consult current
primary documentation. Context7 or the free daisyUI GitMCP server are useful
optional documentation sources; they are not project dependencies.

## Change discipline

- Prefer a deep, explicit module over a wide layer of helpers.
- Add dependencies only for a present requirement.
- Add or update tests at public seams. Do not test implementation details.
- Never make Git hooks mutate files. Fixes remain explicit commands.
- Finish every change with `pnpm check`.
