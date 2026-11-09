# Project instructions

This repository is an opinionated Astro project foundation. Preserve its narrow,
coherent workflow instead of adding configuration for every possible user.

## Agent skills

### Issue tracker

New issues and specs live in GitHub Issues; existing local work remains in
`.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

GitHub Issues use the five canonical triage roles. See
`docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single root glossary. See `docs/agents/domain.md`.

## Repository map

- `apps/web`: the Astro application.
- `DESIGN.md`: the only source of design-token values and design intent.
- `scripts`: deterministic design generation and validation.
- `devenv.nix`: optional Node, pnpm, LSP, task, and Git-hook environment.
- root configuration files: shared quality tooling for the workspace.

## Commands

Use pnpm from the repository root.

- `pnpm dev`: generate/watch design tokens and i18next definitions, then run the Astro app.
- `pnpm check`: run the complete local/CI quality gate.
- `pnpm test`: run Vitest once.
- `pnpm storybook`: generate design tokens and run the Astro UI workbench.
- `pnpm storybook:build`: generate design tokens and build the static UI workbench.
- `pnpm fmt`, `pnpm lint:fix`, `pnpm stylelint:fix`: explicit fixes.
- `pnpm design:generate`: regenerate disposable CSS from `DESIGN.md`.
- `pnpm i18n:generate`: extract the disposable default catalog and regenerate i18next definitions.

Do not hand-edit generated files under `apps/web/src/assets/.generated`,
`apps/web/src/assets/i18next/.en`, or `apps/web/src/@types`. They are ignored and
created by lifecycle/build commands.

## Architecture rules

- Keep `apps/web` static until a product requirement chooses an adapter.
- Use the `#/*` alias for cross-directory imports inside `apps/web/src`.
  Colocated modules and bootstrap configuration may use relative imports.
- Every Astro component and layout exports its `Props` type and any public
  constant declared in frontmatter. `astro/no-exports-from-components` is
  intentionally disabled for that contract.
- Treat `@gutenye/astro-i18next` as the locale lifecycle owner. Do not call the
  global `changeLanguage()` from components. The integration injects Astro's
  native i18n config from the shared `preload` and `lng` values; do not duplicate
  it with a top-level `i18n` block in `astro.config.ts`.
- User-interface copy, validation messages, and SEO metadata use typed i18n keys.
  Authored long-form content belongs in localized content entries.
- Add framework locale definitions once in `src/i18n/index.ts`; Astro, i18next,
  sitemap, and routes must consume that shared definition. Keep i18next-specific
  extraction, type generation, integration, and backend options in
  `i18next.config.ts`.
- Use Astro content collections for structured authored content and validate
  cross-cutting identifiers such as translation keys at the schema boundary.
- Keep Storybook stories beside pure UI components. Pass translated copy,
  locale, and environment-derived values through story args. Layouts and pages
  belong in rendered Astro tests, not Storybook. Markup-only UI components do
  not need matching Vitest files.
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
