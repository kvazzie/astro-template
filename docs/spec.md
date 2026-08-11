# Template implementation specification

This file records the decisions agreed during the design interview for the first
implementation of this repository.

## Product stance

- Build a public, 0BSD-licensed, highly opinionated Astro starter for a
  one-person workflow.
- Support GitHub Template and
  `pnpm create astro@latest --template <owner>/<repository> --no-ai`.
- Explain that `--no-ai` preserves the repository's `AGENTS.md`, and support only
  pnpm scaffolding.
- Keep the initial application visually clean and free of demo cleanup work.
- Welcome reproducible bugs and focused proposals without promising broad
  configurability or fast contribution review.

## Workspace and runtime

- Use a pnpm Turborepo monorepo with one Astro app at `apps/web` and no empty
  shared package.
- Pin Node 24 and pnpm; keep project development independent from Devenv.
- Keep Devenv as an optional LSP/editor layer with check-only Git hooks and no
  automatic dependency installation.
- Include Helix and VS Code project settings; do not include Neovim settings.

## Application foundation

- Configure static Astro, strict TypeScript, Tailwind CSS 4, DaisyUI 5,
  `@gutenye/astro-i18next`, Astro's native i18n behavior, i18next, content
  collections, sitemap, and ClientRouter.
- Start with English as the only unprefixed default locale and require typed keys
  for interface copy and SEO metadata.
- Use a real `site` singleton content collection for global SEO defaults.
- Provide a minimal layout with canonical, Open Graph, Twitter, locale-alternate,
  robots, accessibility, and reduced-motion behavior.
- Use `PUBLIC_SITE_URL` with `https://example.com` as a build-safe fallback.
- Keep output static and exclude deployment adapters, APIs, forms, provider state,
  remote fonts, logos, placeholder images, and branded components.
- Do not install MDX. Preserve plug-and-play formatter/editor readiness, an
  optional ESLint fragment, and README setup instructions.

## Design system

- Treat root `DESIGN.md` as the sole source of light/dark design values.
- Pin `@google/design.md` exactly, generate ignored Tailwind CSS, import it from
  the app stylesheet, and map generated variables into stable DaisyUI themes.
- Run generation during `prepare`, before builds/checks, and in watch mode during
  development.
- Validate the complete semantic token contract and replace generated output
  atomically. Never commit the generated CSS.
- Document Context7 and the free daisyUI GitMCP as optional user-level tools, not
  project dependencies.

## Quality and maintenance

- Configure ESLint for TypeScript/Astro/accessibility, Prettier with Astro and
  Tailwind plugins, Stylelint for CSS/Astro/future MDX, EditorConfig, and Vitest.
- Test the design-token validator and translation-key boundary at their public
  seams.
- Provide explicit fix commands; Git hooks must never mutate files.
- Run frozen install plus the complete `pnpm check` gate in one GitHub Actions
  job.
- Configure weekly Dependabot updates without automerge, grouping general
  development tooling while leaving Astro, Tailwind, and DaisyUI separate.
- Keep all project documentation, comments, script messages, and default content
  in English.
