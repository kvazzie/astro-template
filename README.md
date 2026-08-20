# Opinionated Astro workspace

An Astro project foundation for a deliberate one-person workflow: batteries
included, product UI empty. It starts with the architecture and quality tooling
that are expensive to migrate into later, without adding a demo site that needs a
cleanup commit.

This is intentionally not a universal starter. The defaults represent the
maintainer's view of a good codebase, website, and editing workflow.

## Create a project

The most faithful path is GitHub's **Use this template** action. The Astro CLI is
also supported when this repository is public:

```sh
pnpm create astro@latest --template <owner>/<repository> --no-ai
```

Use pnpm to invoke the wizard. `create-astro` chooses the installer from the
invoking command, not from this repository's `packageManager` field.

`--no-ai` is deliberate. Astro otherwise replaces this repository's opinionated
`AGENTS.md` with generated generic instructions. The flag preserves the workflow
contract documented here. The CLI also removes `private` from the root
`package.json`; GitHub Template and `git clone` preserve it.

Scaffolding through other package managers is not supported. Clone the
repository only when developing the template itself.

## Requirements

- Node.js 24
- pnpm 10.33.2
- Optional: Nix, Devenv, and direnv for the editor/LSP environment

```sh
pnpm install
pnpm dev
```

Copy `.env.example` to `.env` and set `PUBLIC_SITE_URL` before production. Builds
fall back to `https://example.com` so a fresh install and CI remain valid.

## Repository map

```text
.
├── apps/
│   └── web/                 # Astro application
├── scripts/                 # Design generation and validation
├── .github/                 # Quality CI, Dependabot, issue templates
├── DESIGN.md                # Design values and intent
├── AGENTS.md                # Coding-agent workflow contract
├── devenv.nix               # Optional runtime/LSP/hooks environment
├── turbo.json               # Workspace task graph
└── pnpm-workspace.yaml
```

Shared packages belong under `packages/` when the first real shared boundary
appears. The template does not create an empty package layer in advance.

## What is included

The web app is static Astro with strict TypeScript, Tailwind CSS 4, DaisyUI 5,
native Astro i18n, `@gutenye/astro-i18next`, i18next, content collections,
sitemap generation, `ClientRouter`, and a minimal SEO layout.

The initial page contains only enough structure to prove the foundation works.
There is no navigation, footer, component showcase, remote font, placeholder
logo, favicon, social image, form backend, deployment adapter, or provider state.

Quality tooling lives at the workspace root:

- ESLint flat configuration for TypeScript, Astro, and accessibility;
- Prettier with Astro and Tailwind plugins;
- Stylelint for CSS, Astro, and future MDX styles;
- Vitest for public infrastructure seams;
- EditorConfig, Helix, and VS Code settings;
- one CI quality gate and weekly grouped Dependabot updates.

## Commands

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `pnpm dev`             | Watch design/i18n generation and start Astro  |
| `pnpm build`           | Regenerate design/i18n and build every app    |
| `pnpm check`           | Run the complete local and CI quality gate    |
| `pnpm typecheck`       | Run Astro checks through Turbo                |
| `pnpm storybook`       | Run the Astro UI component workbench          |
| `pnpm storybook:build` | Build the static UI component workbench       |
| `pnpm test`            | Run Vitest once                               |
| `pnpm lint`            | Check JavaScript, TypeScript, and Astro       |
| `pnpm stylelint`       | Check CSS and embedded styles                 |
| `pnpm fmt:check`       | Check repository formatting                   |
| `pnpm fmt`             | Apply Prettier explicitly                     |
| `pnpm design:check`    | Lint/export DESIGN.md and verify its contract |
| `pnpm design:generate` | Write disposable generated design CSS         |
| `pnpm i18n:check`      | Check extracted English and generated types   |
| `pnpm i18n:generate`   | Extract English copy and generate types       |

Git hooks installed by Devenv are checks only. Pre-commit runs formatting, ESLint,
and Stylelint checks; pre-push runs `pnpm check`. Nothing silently fixes files.

## Design system

`DESIGN.md` is the only source of design values. The pinned
`@google/design.md` CLI validates it and exports a Tailwind CSS `@theme` file to
`apps/web/src/assets/.generated/design.css`. The generated file is intentionally
ignored: `prepare`, `dev`, `build`, and `check` materialize it when needed.

`apps/web/src/styles/app.css` imports that file and contains stable light/dark
DaisyUI bridge blocks. Those blocks only map semantic roles to generated custom
properties; they never duplicate design values. The validator fails if a mapped
token is missing.

Change the design in `DESIGN.md`, then run:

```sh
pnpm design:check
```

## Internationalization

Internationalization is enabled before the project needs a second language.
English is the only initial locale and has no URL prefix. Add locales in
`apps/web/src/i18n/index.ts`; the integration injects Astro's native i18n config
from that definition, while i18next and sitemap consume the same values. All
i18next-specific extraction, type-generation, integration, and backend options
live in `apps/web/i18next.config.ts`. Do not add a duplicate top-level `i18n`
block to `astro.config.ts`.

Interface copy and SEO metadata use typed i18next keys. English copy belongs in
literal calls such as `t("page.title", "Home")`; the CLI extracts it into the
ignored `apps/web/src/assets/i18next/.en/` directory that it owns. Future
authored secondary catalogs live in sibling locale directories such as
`apps/web/src/assets/i18next/ru/` and remain tracked and formatted. Authored
prose belongs in localized content entries instead of becoming an unwieldy
translation catalog.

The official i18next CLI generates disposable declarations under
`apps/web/src/@types/`. Never edit them. `prepare`, `dev`, `build`, and `check`
materialize the generated catalog and declarations; `pnpm dev` then watches
source translation calls for changes.

`@gutenye/astro-i18next` owns locale changes during route generation. Components
must not call the global `changeLanguage()` themselves. A pinned pnpm patch lets
its hot-update hook follow the filesystem backend's function-valued locale path;
remove that patch once the integration supports conditional catalog paths.

## Component workbench

Storybook is the executable workbench for pure UI components. Put each
`*.stories.ts` file beside the component it describes under `src/components`.
Stories pass translated copy, the active locale, and values derived from the
environment through args. The component stays independent of i18next, Astro
routing, content collections, and environment modules.

The workbench imports the application stylesheet and uses the same Astro and
Tailwind configuration as production. Run `pnpm storybook` while building UI.
The complete `pnpm check` command builds the static workbench to verify every
story on a clean checkout.

Do not add stories for layouts or pages. Those depend on Astro's rendering
environment and belong in colocated rendered tests. A markup-only UI component
does not need a Vitest file unless it gains non-visual behavior that a story
cannot verify.

## Content and SEO

The `site` content collection is a real singleton used by the layout. Its schema
validates translation-key references. Add project-specific collections only when
their content model is known.

`Layout.astro` accepts translated title and optional description strings plus an
image, canonical path, and `noindex`. It supplies canonical, Open Graph, Twitter,
alternate-language, accessibility, and page-transition boilerplate. `robots.txt`
and sitemap URLs derive from the same `Astro.site` value.

## Add MDX

MDX is intentionally not installed before it has a use case. Formatting,
Stylelint, Helix, and an ESLint fragment are ready for it.

```sh
cd apps/web
pnpm astro add mdx
```

Then import `mdxConfig` from the root `eslint.mdx.config.mjs` and spread it before
`eslint-config-prettier` in `eslint.config.ts`. Add a real `.mdx` page and run
`pnpm check`; do not install MDX as a dormant dependency.

## Devenv and editors

The normal workflow is plain pnpm. Devenv is an optional layer for modal editors:

```sh
devenv shell
pnpm install
```

It pins Node 24, enables pnpm without auto-installing project dependencies, and
provides Astro, TypeScript, Tailwind, ESLint, HTML/CSS/JSON, YAML, TOML, and
Markdown language servers plus Prettier. `.helix/languages.toml` wires those
servers for Helix; Neovim can consume the same binaries through the user's own
configuration. VS Code recommendations and a dev launch task are included.

## Optional documentation tools

Coding agents should consult current primary documentation before changing
framework configuration. Two useful free options are:

- [Context7](https://context7.com/) for version-aware library documentation;
- [daisyUI GitMCP](https://daisyui.com/docs/mcp/) for the upstream daisyUI
  repository context.

Configure MCP servers in the user's editor or agent, not in this repository. They
must never become build dependencies or carry credentials in project files.

## Project stance

Bug reports and focused workflow proposals are welcome, particularly from people
who work in a similar way. This remains a personal, opinionated foundation:
maintainer fit matters more than broad configurability, and review or merge timing
is not guaranteed. The issue forms ask for concrete friction and tradeoffs rather
than generic feature requests.

## License

[0BSD](LICENSE). Use, copy, modify, and distribute the code for any purpose,
without an attribution requirement.
