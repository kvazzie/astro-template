# Research: module imports and implicit internal namespaces

**Issue:** [04 — Enforce the module import convention](../issues/04-enforce-import-style.md)
**Date:** 2026-08-18
**Status:** implemented with the explicit type-namespace fallback

## Follow-up decision: implicit internal namespaces

Use Unimport to make a small, explicit registry of **current-package public
folder entrypoints** available as implicit namespace bindings. Do not use
Unimport's `dirs` scanner for this architecture.

The intended source-level distinction becomes:

| Dependency kind                                                   | Source spelling                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| Registered folder inside the current package                      | implicit namespace, for example `i18n.localizePathname(...)`        |
| Framework, environment, npm package, or another workspace package | ordinary explicit import using the package's public export contract |
| Astro component                                                   | explicit default import                                             |
| Stylesheet or other side effect                                   | explicit side-effect import                                         |
| Configuration/bootstrap dependency                                | explicit import, because it executes before the transform exists    |

In particular, `@workspace/*` is always on the explicit side of the boundary.
A linked package may live in the same repository, but it is a separate package
contract, not an implementation folder of its consumer. Vite also treats linked
dependencies as modules in its graph rather than as an excuse to erase their
package boundary. [Vite SSR dependency behavior](https://vite.dev/guide/ssr#ssr-externals)

This is a stronger and more natural marker than the earlier proposal to write
internal dependencies as explicit namespace imports: application code has no
internal import declaration at all, while every dependency crossing a package
or runtime boundary remains visible.

### Use true namespace mappings, not directory export scanning

Unimport directly supports a namespace entry:

```ts
{ name: "*", as: "i18n", from: "#/i18n" }
```

When `i18n` is referenced without a local binding, Unimport injects
`import * as i18n from "#/i18n"`. Its declaration generator represents the
binding as `const i18n: typeof import("#/i18n")`. These are real ESM imports
inserted at transform time, not properties installed on `globalThis`.
[Unimport namespace import configuration](https://github.com/unjs/unimport#namespace-import),
[Unimport import and declaration stringification](https://github.com/unjs/unimport/blob/main/src/utils.ts)

By contrast, `dirs` scans every matching file and flattens its named and type
exports into separate global identifiers. A default export is named from its
filename (or the parent directory for an `index` file). It does not create one
namespace per configured folder. That behavior would erase the very domain
prefix this proposal wants and would make collisions depend on filenames and
export names. [Unimport directory auto-import documentation](https://github.com/unjs/unimport#directory-auto-import),
[Unimport directory scanner](https://github.com/unjs/unimport/blob/main/src/node/scan-dirs.ts)

The registry should therefore map a deliberately chosen namespace name to a
deliberately authored barrel module:

```ts
const internalNamespaces = [
  { name: "i18n", from: "#/i18n" },
  { name: "siteContent", from: "#/content/site" },
] as const;
```

Each target is a public entrypoint for one cohesive folder, not a glob. A folder
is not implicitly public merely because it exists. Namespace names must be
unique, stable, valid identifiers, and validated before they are handed to
Unimport. Unimport otherwise deduplicates by effective binding name, lets a
higher `priority` win, and warns when different equal-priority sources collide;
architecture configuration should fail earlier and more clearly.
[Unimport import priority contract](https://github.com/unjs/unimport/blob/main/src/types.ts),
[Unimport collision handling](https://github.com/unjs/unimport/blob/main/src/utils.ts#L124-L190)

### Value and type namespaces need a feasibility spike

The intended convention requires the same qualifier in value and type
positions, for example:

```ts
const path = i18n.localizePathname(...);
type Key = siteContent.SiteMetadataKey;
```

Unimport can be given complementary value and type namespace entries for the
same alias:

```ts
{ name: "*", as: "siteContent", from: "#/content/site" }
{ name: "*", as: "siteContent", from: "#/content/site", type: true }
```

The value entry produces the ambient `const`; the type entry goes through
Unimport's type re-export path (`export type * as siteContent`). Unimport keeps
complementary value/type entries during deduplication and excludes pure type
entries from its runtime import map. [Unimport context import-map construction](https://github.com/unjs/unimport/blob/main/src/context.ts),
[Unimport type declaration generation](https://github.com/unjs/unimport/blob/main/src/utils.ts#L239-L333)

That source behavior is promising, but it is not enough to adopt the convention
without an end-to-end proof. The implementation must first spike all of these:

- a value namespace and a type member from the same alias in `.ts`;
- the same pair in Astro frontmatter under `astro check`;
- an alias used only in a type position, verifying that no unnecessary runtime
  import survives the Vite/Astro pipeline;
- editor navigation and completion from the generated declaration file;
- the same transform in Vitest, including watch mode;
- production output for a barrel with several unused exports.

If the type namespace is not reliable in Astro tooling, do not fall back to
flattened global type names. Keep explicit `import type * as ...` for types, or
drop the implicit proposal; either is clearer than maintaining custom ambient
namespace code generation in issue 04.

### Transform scope and unavoidable explicit seams

The implicit registry should apply only to application modules in
`apps/web/src` and to tests that intentionally share that application
environment. It should not apply repository-wide.

`astro.config.ts`, `i18next.config.ts`, `vitest.config.ts`, ESLint configuration,
and scripts execute before—or outside—the application's Vite transform. They
cannot depend on an implicit binding installed by their own configuration.
Those bootstrap files should keep explicit imports, including explicit
namespace imports when the dependency is a current-package module. This is a
real phase boundary, not an exception worth hiding with a Node loader.

Astro supports Vite plugins under `vite.plugins`, and Astro's own component
compiler runs as a pre-transform. Raw `unimport/unplugin` is a post-transform,
so it can operate on Astro's compiled module when `.astro` is deliberately
included. Raw Unimport's defaults include JS/TS, Vue, and Svelte, but not
`.astro`; its declaration file is written at `buildStart`.
[Astro Vite plugin configuration](https://docs.astro.build/en/reference/configuration-reference/#vite),
[Astro compiler Vite plugin](https://github.com/withastro/astro/blob/astro%407.2.0/packages/astro/src/vite-plugin-astro/index.ts),
[Unimport unplugin implementation](https://github.com/unjs/unimport/blob/main/src/unplugin.ts)

There are two reasonable integration choices:

| Choice                                         | Advantages                                                                                                                                  | Costs / risks                                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `unimport/unplugin` via Astro's `vite.plugins` | smallest surface; accepts the exact `Import[]` registry; enough for static namespace entries                                                | must explicitly include `.astro`; must wire the same options into Vitest; core has no ESLint writer and its defaults are not Astro-oriented |
| `unplugin-auto-import/astro`                   | official Astro adapter; default filter includes `.astro`; wraps Unimport; produces relative declaration paths and can generate lint globals | another wrapper/configuration vocabulary; its lint output targets legacy `.eslintrc` rather than this repository's flat config              |

The wrapper's Astro adapter only pushes its Vite plugin during
`astro:config:setup`, and its transform is still powered by Unimport.
[unplugin-auto-import Astro adapter](https://github.com/unplugin/unplugin-auto-import/blob/main/src/astro.ts),
[wrapper transform defaults and declaration generation](https://github.com/unplugin/unplugin-auto-import/blob/main/src/core/ctx.ts),
[official Astro setup](https://github.com/unplugin/unplugin-auto-import#astro)

Prefer `unplugin-auto-import/astro` for the spike because it is the maintained
Astro-facing seam and removes an easy-to-miss `.astro` filter. If the spike
shows that the raw plugin is equally reliable and its smaller interface is
materially clearer, using raw Unimport remains acceptable. In either case,
derive flat-config ESLint globals directly from the project's namespace
registry; do not add a generated legacy ESLint file.

### Registry design alternatives

#### A. Explicit folder-entrypoint registry — recommended

Authors add one record containing a namespace name and an entrypoint specifier.
The entrypoint is a checked-in barrel owned by the folder. The same records feed
the Astro plugin, Vitest plugin, generated declarations, and ESLint.

This is the strongest option because it makes the public folders and their
names reviewable data, has deterministic types, does not need file watching or
export discovery, and preserves a deep-module boundary. Ordinary Vite dependency
tracking handles changes behind the injected static ESM import; Vite records
transformed imports in its environment module graph for HMR.
[Vite environment module graph](https://vite.dev/guide/api-environment-instances#separate-module-graphs)

#### B. Convention-discovered entrypoints — defer

A convention could discover files such as `src/**/index.ts` or a specially
named `*.namespace.ts`, then derive namespace names from paths. This reduces
registry maintenance but makes filesystem shape part of the public API, makes
renames semantic, and tends to create many shallow namespaces. It also needs
collision validation and reliable watch-mode discovery. The wrapper can rescan
configured directories during updates, whereas raw Unimport scans its `dirs`
only at build start, but that still yields flattened exports unless additional
project code converts the discovered entrypoints into star entries.
[Unimport build-start scanning](https://github.com/unjs/unimport/blob/main/src/unplugin.ts),
[unplugin-auto-import update handling](https://github.com/unplugin/unplugin-auto-import/blob/main/src/core/unplugin.ts)

Use this only if maintaining the explicit registry becomes measurable friction.

#### C. Generated virtual facade — reject initially

A custom plugin could scan folders and emit a virtual module or generated
barrel per namespace. It could avoid authored `index.ts` files, but it would
make issue 04 own export parsing, path normalization, collision policy,
watch/HMR invalidation, source maps, generated declaration machinery, and
tree-shaking behavior. Unimport's `virtualImports` feature exposes registered
identifiers through a virtual import source; it does not turn folders into
separate namespace objects. [Unimport options and addon interfaces](https://github.com/unjs/unimport/blob/main/src/types.ts)

That is too much mechanism for an import-style contract. Reject it unless a
future requirement demonstrates that deliberate barrels cannot work.

### Revised lint contract

The namespace registry should be a small shared configuration module consumed
by tooling, not duplicated selector strings.

- In application transform scope, reject bound imports from current-package
  `#/*` and relative independent modules. Registered internal APIs are reached
  through their implicit namespace.
- Continue allowing explicit default imports of `.astro` components and
  explicit side-effect imports such as CSS.
- Continue enforcing named imports for the existing framework/environment API
  registry below. Other external packages follow their actual public export
  contract rather than a blanket named-only rule.
- Always treat bare workspace specifiers such as `@workspace/*` as external and
  explicit.
- In bootstrap/config/scripts, allow explicit current-package namespace imports
  because those files cannot be transformed by their own application plugin.
- Declare the configured implicit names as readonly globals for the relevant
  ESLint file scopes, and reject local declarations/import aliases that shadow
  them. The wrapper itself recommends relying on TypeScript instead of
  `no-undef` for typed source; this project still needs lint-side shadowing and
  import-boundary rules. [unplugin-auto-import ESLint guidance](https://github.com/unplugin/unplugin-auto-import#eslint)

### Revised implementation plan

1. Run a throwaway feasibility spike with one tiny folder barrel and one
   namespace. Exercise `.ts`, `.astro`, `astro check`, Vitest/watch, editor
   declarations, and the built output. Test paired value/type star entries.
2. If the spike passes, create the explicit `internalNamespaces` registry and a
   validator. Keep entries inside `apps/web`; reject duplicate names and reject
   package specifiers including `@workspace/*`.
3. Author the minimum public folder entrypoints needed by current code. Do not
   create a barrel for every directory and do not use `dirs` scanning.
4. Feed the registry into the selected Astro and Vitest plugin adapters and
   generate an ignored/reproducible declaration file that is included by the
   app tsconfig.
5. Derive ESLint readonly globals and import restrictions from the registry.
   Add public-seam lint tests for application scope, bootstrap exceptions,
   components, side effects, and workspace-package imports.
6. Migrate application consumers to namespace-qualified implicit references;
   keep external, component, side-effect, and bootstrap imports explicit.
7. Verify `pnpm lint` during iteration and finish with `pnpm check`. Add a
   production-output assertion or fixture if the spike finds namespace barrel
   tree-shaking sensitive; namespace objects that are enumerated, spread, or
   passed wholesale should be avoided.

## Previous explicit-import decision (superseded for internal application modules)

The framework/environment registry research below still applies to explicit
external imports. Its proposal for explicit namespace imports of internal
application modules is superseded by the implicit registry above if the
feasibility spike passes.

Define the named-import boundary as data in `eslint.config.ts`, not as an
implicit test such as “every bare package import.” The registry should contain
exact module specifiers plus two deliberately broad protocol families:

| Source                              | Put in the initial ESLint registry                    | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js built-ins                   | `node:*`                                              | They are runtime-environment APIs. Node exposes their public API as named exports (as well as a CommonJS-compatible default), so the project can intentionally choose the named form. [Node ESM: `node:` and built-in modules](https://nodejs.org/download/release/latest-v24.x/docs/api/esm.html#built-in-modules)                                                                                                                                                                                                          |
| Astro virtual modules               | `astro:*`                                             | These are framework-provided virtual API boundaries. Current official examples use named imports for environment variables, content, assets, transitions, actions, and i18n. [Astro module reference sources](https://github.com/withastro/docs/tree/main/src/content/docs/en/reference/modules), [environment API](https://docs.astro.build/en/reference/modules/astro-env/), [i18n API](https://docs.astro.build/en/reference/modules/astro-i18n/)                                                                         |
| Adopted Astro package APIs          | `astro`, `astro/config`, `astro/loaders`, `astro/zod` | These are the named, non-component Astro entrypoints the repository currently consumes. Keep them exact: Astro also exports component and runtime entrypoints, so a blanket `astro/*` rule would be too broad. Add other documented Astro entrypoints when a project issue actually adopts them. [Astro 7.2.0 export map](https://github.com/withastro/astro/blob/astro%407.2.0/packages/astro/package.json#L23-L99), [config imports](https://docs.astro.build/en/reference/modules/astro-config/#imports-from-astroconfig) |
| Astro compiler API                  | `@astrojs/compiler`                                   | The i18next extractor calls the compiler as a framework API and already imports its `transform` export by name.                                                                                                                                                                                                                                                                                                                                                                                                              |
| Build and test environment          | `vite`, `vitest`, `vitest/config`                     | Vite's programmatic environment/config API and Vitest's test/config APIs are supplied by the active tool environment and are documented as named imports. [Vite `loadEnv`](https://vite.dev/guide/api-javascript.html#loadenv), [Vitest API](https://vitest.dev/api/describe), [Vitest config](https://vitest.dev/config/include)                                                                                                                                                                                            |
| Repository configuration frameworks | `eslint/config`, `i18next-cli`, `prettier`            | These imports are public configuration/type APIs, including type-only imports, and should remain visibly distinct from local configuration modules. ESLint itself documents `defineConfig` as a named import. [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files)                                                                                                                                                                                                                         |

Represent the two families as patterns and the remaining entries as exact
strings. Give the exported/local constant a purpose-revealing name such as
`frameworkAndEnvironmentApiSources`; do not call it `externalModules`, because
most external packages are intentionally outside this convention.

The registry is a project support policy, not an attempt to enumerate every API
that Astro, Node, or the JavaScript ecosystem could expose. Add an exact entry
when the repository adopts another framework surface. In particular, issue 06
should add the actual Storybook framework/type entrypoint selected during that
implementation; issue 08 should evaluate any OpenTelemetry entrypoints then.
Those packages are not installed yet, so guessing their eventual specifiers in
issue 04 would make the list less reliable.

## Explicit exclusions

Do **not** classify every dependency or every `@astrojs/*` package as a
named-import API. The current repository has valid default-export contracts for
`@astrojs/sitemap`, `@tailwindcss/vite`,
`@gutenye/astro-i18next/integration`, `i18next`, `@eslint/js`,
`eslint-plugin-astro`, `eslint-config-prettier/flat`, `globals`, and
`typescript-eslint`. `yaml` is an ordinary independent library API, not a
framework/environment seam. These imports should follow the package's public
export contract rather than this architectural marker.

Also do not use a blanket `astro/*` pattern. Astro 7.2.0's public export map
includes `astro/components/*`, `astro/debug`, JSX runtimes, client/runtime
entrypoints, and internal facilities alongside named APIs. Some of those are
components or framework internals and therefore have different import
semantics. The `astro:*` virtual-module family is safe to group; slash
entrypoints should remain explicit. [Astro 7.2.0 export map](https://github.com/withastro/astro/blob/astro%407.2.0/packages/astro/package.json#L23-L99)

`Astro`, `import.meta.env`, `import.meta.*`, and `process.env` are environment
APIs but are not import declarations. This issue's binding-style rule cannot
govern them. Astro recommends its typed `astro:env/server` API (including
`getSecret()`) over direct `process.env` access when programmatic access is
needed, while Vite defines `import.meta.env` as a special build-time object.
[Astro environment API](https://docs.astro.build/en/reference/modules/astro-env/),
[Vite environment variables](https://vite.dev/guide/env-and-mode)

## Previous ESLint mechanism (partly retained)

The revised lint contract above governs the implementation. The selector
research below remains useful for the explicit framework/component cases, but
its explicit internal-namespace rule is superseded by implicit access in the
application transform scope.

Use core ESLint facilities; no import-style plugin is required.

The clearest implementation is `no-restricted-syntax` with selectors generated
from the registry:

- for a registered source, reject `ImportDefaultSpecifier` and
  `ImportNamespaceSpecifier`, leaving `ImportSpecifier` (named imports) valid;
- for internal independent modules, reject default and named specifiers,
  leaving namespace imports valid;
- for Astro component sources, reject namespace imports and the named-as-default
  spelling (`{ default as Component }`), leaving the component value's default
  import valid while permitting named component contracts.

ESLint supports node types, nested attributes, regular expressions, child
relationships, and `:matches()` in selectors, and explicitly recommends
`no-restricted-syntax` for precise project-specific patterns. This provides
specific diagnostics without a new dependency. [ESLint selector syntax](https://eslint.org/docs/latest/extend/selectors),
[`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax)

`no-restricted-imports` is a viable alternative for the named-only side. Its
`paths` entries match exact sources, `patterns` support groups or regular
expressions, and putting `"default"` in `importNames` rejects default imports.
It also rejects a namespace import when restricted names exist because a
namespace contains the restricted export. However, that behavior produces a
less direct namespace diagnostic and does not express “namespace only” as
cleanly as selectors, so one selector-based mechanism is preferable for all
three categories. [ESLint `no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports)

Type-only imports use the same `ImportSpecifier`, `ImportDefaultSpecifier`, and
`ImportNamespaceSpecifier` shapes, so the same selectors enforce the issue's
type-only requirement. For `.astro` modules, the default type denotes the
component while ordinary named type imports may denote the exported `Props`
contract required by issue 05. Keep the current TypeScript
`verbatimModuleSyntax` setting; it ensures type imports are explicit but does
not choose named versus namespace versus default binding style. A separate
`@typescript-eslint/consistent-type-imports` rule is optional and may duplicate
TypeScript diagnostics; it is not needed to express this issue's three-way
style. [typescript-eslint type-import guidance](https://typescript-eslint.io/rules/consistent-type-imports/)

## Previous repository impact (superseded for application consumers)

The current named framework/environment imports already match the proposed
policy. One current environment import does not:

- `scripts/design-tokens.mjs` imports the default `node:path` object. It will
  need named imports for the individual path functions it uses.

Current local independent modules use named imports in configuration, tests,
content setup, and the layout. Under the revised plan, eligible application and
test consumers move to implicit namespace-qualified access, while bootstrap
configuration retains explicit imports. `#/layouts/Layout.astro` is already a
default component import. The stylesheet side-effect import has no binding and
should remain allowed. Named exports from `.astro` files must also remain
available for issue 05's `Props` and public-constant contracts; only the
component value itself is default-only.

Component detection may temporarily use a terminal `.astro` source check. When
issue 16 replaces `#/*` with role-based package imports, it must update the
declared component-source patterns to the new component/layout map names rather
than rely on a physical extension. Keeping source categories as named constants
in the ESLint config makes that migration explicit.

## Previous implementation plan (superseded)

This was the plan for explicit internal namespace imports. Use the revised
implementation plan above if the Unimport feasibility spike passes.

1. Add three clearly named source-category constants to `eslint.config.ts`:
   the registry above, current internal-module source patterns, and current
   Astro-component source patterns. Generate safely escaped selector fragments
   from the constants instead of duplicating source lists inside rule strings.
2. Add selector restrictions for JavaScript, TypeScript, and Astro frontmatter.
   Apply the same binding-shape policy to `import type` declarations. Leave
   side-effect-only imports alone.
3. Add public-seam lint tests using ESLint's programmatic `lintText` API and
   representative filenames. Assert both acceptance and rejection for each
   category, including type-only forms, named `.astro` contracts, and `.astro`
   frontmatter. This directly proves behavior rather than testing the generated
   selector strings.
4. Migrate existing imports only after the lint tests fail for the intended
   examples. Do not change import paths. The expected framework migration is
   the `node:path` import; local modules will change to namespace bindings;
   Astro component imports remain default.
5. Run `pnpm lint` during iteration, then finish with the repository-required
   `pnpm check`.

Minimum test matrix:

| Category                                | Accept                                                | Reject                                   |
| --------------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| registered framework/environment source | named value and named type imports                    | default and namespace imports            |
| internal independent module             | namespace value and namespace type imports            | named and default imports                |
| Astro component module                  | default component import and named exported contracts | namespace and `{ default as Component }` |
| side-effect stylesheet                  | side-effect-only import                               | n/a                                      |

Keep re-exports and dynamic `import()` out of issue 04 unless the issue is
explicitly expanded. They do not have the same binding-style signal as static
`ImportDeclaration` nodes, and broadening the work would obscure the stated
acceptance seam.
