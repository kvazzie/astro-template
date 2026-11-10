# 19 — Research a portable namespaces package

**What to build:** Produce a decision-ready research note for extracting the
proven internal-namespace prototype into a reusable, runtime-neutral namespaces
package powered by Unimport, with particular attention to the UnJS ecosystem,
Deno support, configuration discovery, host adapters, publication, and a later
Git history split into a dedicated repository.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

## Problem Statement

The repository has proved that implicit, statically injected bindings can make
internal capabilities visually distinct while retaining real ESM imports,
tooling support, and tree shaking. That proof is currently shaped around one
Astro application and a project-owned registry. Turning it directly into a
published package would prematurely preserve local assumptions about package
boundaries, configuration files, declaration generation, linting, and host
integration.

Prospective users need one declarative namespaces interface that can be embedded
in frontend frameworks, bundlers, test runners, and backend projects across the
Node and Deno ecosystems. The project needs evidence about which existing UnJS
technologies should own configuration, transformation, packaging, CLI behavior,
and compatibility before it commits to a public API or splits package history
into a separate repository.

## Solution

Research and prototype the smallest portable package boundary around Unimport.
Keep the already-agreed user-facing namespace mapping fixed while comparing
technology choices behind it. Exercise configuration loaded from Node and Deno
manifests, the dedicated fallback file, and direct plugin options through one
black-box consumer fixture. Record supported and unsupported execution models,
select the UnJS and non-UnJS dependencies that materially deepen the package,
and produce an implementation plan suitable for a self-contained package and
later repository split.

## User Stories

1. As a package designer, I want to understand which behavior belongs to Unimport, so that the new package does not recreate an existing auto-import engine.
2. As a package designer, I want the product boundary to remain namespaces rather than generic auto imports, so that its purpose stays recognizable.
3. As a package designer, I want the agreed configuration shape treated as an input constraint, so that research does not redesign the user-facing interface unnecessarily.
4. As a Node developer, I want to declare namespaces in `package.json`, so that a normal Node project does not need another configuration file.
5. As a Deno developer, I want to declare the same namespaces in `deno.json` or `deno.jsonc`, so that Deno projects receive an equally native experience.
6. As a cross-runtime developer, I want a dedicated fallback file, so that one namespace declaration can serve projects containing both manifests.
7. As a bundler user, I want to pass the same mapping directly to a plugin, so that programmatic configuration does not require manifest discovery.
8. As a configuration author, I want the dedicated file to contain the mapping directly, so that it does not repeat a redundant top-level `namespaces` property.
9. As a framework author, I want adapters that compose with existing transformation pipelines, so that namespace support can be embedded without owning the framework.
10. As a backend developer, I want the supported execution models documented, so that an untransformed runtime never accepts declarations that will fail at execution.
11. As a Deno developer, I want a proven path for development, testing, checking, compilation, and publication, so that support means more than parsing `deno.json`.
12. As a Deno maintainer, I want the stability of third-party fields in `deno.json` assessed, so that the package does not depend unknowingly on undocumented tolerance.
13. As a Deno workspace user, I want configuration ownership and discovery researched at workspace boundaries, so that one member does not silently acquire another member's namespaces.
14. As a Node workspace user, I want the same boundary behavior across package managers, so that monorepo layout does not change namespace ownership.
15. As a user of import maps, I want namespace sources passed through normal module resolution, so that the package does not invent a second alias language.
16. As a user of npm, JSR, URL, relative, or package-private specifiers, I want portability constraints documented, so that configuration failures are predictable.
17. As an editor user, I want the declaration and language-service strategy researched, so that implicit bindings retain completion, hover, rename, and navigation.
18. As a TypeScript user, I want value and type behavior investigated separately, so that type-only use never creates accidental runtime work.
19. As a linter user, I want collision and shadowing enforcement evaluated for ESLint and Deno tooling, so that generated declarations cannot mask runtime omissions.
20. As a test author, I want production and test transforms to share one configuration, so that tests do not exercise different dependency semantics.
21. As a performance-conscious user, I want namespace, default, and named binding forms tested for tree shaking, so that convenience does not inflate output.
22. As a development-server user, I want dependency invalidation and watch behavior proved, so that changes behind a namespace are not stale.
23. As a library maintainer, I want configuration-loading technologies compared, so that JSON, JSONC, manifests, and direct objects do not require unrelated custom loaders.
24. As a library maintainer, I want schema-validation approaches compared, so that diagnostics are actionable without adding an unnecessarily large runtime dependency.
25. As a library maintainer, I want UnJS configuration packages such as `c12`, `confbox`, `pkg-types`, and related utilities evaluated, so that compatible infrastructure is reused where it fits.
26. As a library maintainer, I want UnJS build, CLI, path, and package utilities evaluated, so that packaging choices are consistent rather than fashionable.
27. As a package consumer, I want dependencies and peer dependencies justified, so that installation remains small and host ownership remains clear.
28. As a release maintainer, I want npm and JSR publication options compared, so that the selected source and artifact format serves both ecosystems.
29. As a repository maintainer, I want the workspace package isolated from template-private modules, so that a later history split does not require architectural surgery.
30. As a repository maintainer, I want a split strategy that preserves useful history, authorship, license, and release metadata, so that the dedicated repository starts maintainably.
31. As a security-conscious user, I want configuration execution and filesystem permissions assessed, so that declarative configuration does not become arbitrary code execution.
32. As an implementer, I want explicit recommendations and rejected alternatives, so that the implementation ticket can proceed without reopening foundational decisions.

## Implementation Decisions

- This ticket produces research, prototypes, and decisions; it does not publish or migrate the production package.
- The product is a declarative namespaces layer powered by Unimport. Unimport continues to own identifier detection and static import injection.
- The agreed public mapping is not reopened by the research. Each exposed namespace identifier maps to a descriptor with a `from` module specifier and an `import` selector. The selector uses `*` for a namespace import, `default` for a default import, and an export name for a named import aliased to the exposed identifier.
- `package.json` and `deno.json`/`deno.jsonc` are the default declarative locations. A dedicated `namespace.json` or `namespace.jsonc` file is the fallback and contains the namespace mapping directly, without a wrapping `namespaces` property.
- Programmatic integrations receive the same mapping directly through a `namespaces` plugin or integration factory.
- Research must determine deterministic discovery and ambiguity behavior when multiple manifests or the fallback file coexist. Silent merging is not acceptable.
- Research must compare raw Unimport, its unplugin integration, and maintained framework-aware adapters. The result must distinguish core transformation capabilities from convenience wrappers.
- Research must survey relevant UnJS projects for configuration discovery, JSONC parsing, package metadata, path handling, CLI construction, build output, and publication. Each adopted dependency must replace meaningful custom behavior; ecosystem affinity alone is not sufficient.
- Research must determine whether the package should provide one adapter package, subpath exports, or separately versioned adapters for Vite, Rollup, Rolldown, Webpack, esbuild, Astro, Vitest, and other proven hosts.
- Research must verify Deno manifest parsing independently from Deno source transformation. Acceptance of a custom field is not sufficient evidence that native `deno run`, `deno test`, `deno check`, `deno compile`, language services, and publication are supported.
- Research must compare Deno integration through a wrapper CLI, ahead-of-time transformed output, bundler adapters, or another maintained extension seam. Unsupported native commands must be reported explicitly.
- Research must determine a declaration strategy for Node TypeScript, Deno TypeScript, editors, included consumer scopes, and excluded bootstrap scopes.
- Research must evaluate whether type-position namespace access can be guaranteed across supported hosts. Explicit type imports remain an acceptable fallback.
- Research must define how host globals, configured namespaces, lexical bindings, and excluded transform scopes are kept consistent across transformation, declarations, and linting.
- Research must define the portability contract for module specifiers. The package should preserve host resolution rather than inventing an alias syntax, while documenting which specifiers work across Node, Deno, browsers, and bundlers.
- Research must compare npm-only publication, dual npm and JSR publication, and source-first versus built-artifact distribution.
- Research must document CommonJS behavior rather than assuming ESM injection works in CommonJS sources.
- The current workspace extraction is prototype evidence. Its Node-only filesystem validation and current-package `#/` restriction are not automatically part of the reusable contract.
- The final research note must include chosen technologies, rejected alternatives, supported-host tiers, public compatibility promises, dependency roles, repository-split prerequisites, and a sequenced implementation plan.

## Testing Decisions

- Use one highest public seam: a black-box consumer fixture configured through each supported frontend and exercised through the public adapter. The observable result is valid transformed, executable, and type-checkable code, not Unimport descriptor arrays or internal schema output.
- Run the same fixture cases for namespace, default, named, and aliased named imports. This keeps host comparisons focused on equivalent behavior.
- Exercise `package.json`, `deno.json`, `deno.jsonc`, direct plugin options, `namespace.json`, and `namespace.jsonc` through their real discovery paths.
- Prototype host adapters only far enough to answer feasibility and ownership questions. Each prototype must record runtime and tool versions, exact commands, limitations, and whether it uses maintained public APIs.
- Deno research must include at least one actual execution path and one type-checking or editor-compatible path. Merely validating JSON configuration is insufficient.
- Tree-shaking evidence must inspect production output for an unused export behind a configured binding.
- Watch evidence must mutate a configured source module and verify that an importing consumer observes the change through normal dependency invalidation.
- Declaration evidence must start from a clean fixture without a previously generated declaration artifact.
- Configuration tests must cover precedence, ambiguity, malformed JSONC, duplicate identifiers where detectable, invalid binding names, missing descriptors, and unsupported `import` selectors.
- Repository-split research must prove that the candidate package can install, type-check, test, pack, and build without importing the template's private source or root-only configuration.
- Existing registry, transform, lint, tree-shaking, and watch tests are prior art, but research tests should use the future consumer-facing mapping instead of preserving prototype internals.

## Out of Scope

- Publishing a package to npm or JSR.
- Creating the final dedicated repository.
- Replacing the template's current namespace implementation.
- Reimplementing Unimport's parser, injection engine, or bundler plugins.
- Committing to every framework or runtime before a maintained integration seam is proved.
- Runtime mutation of `globalThis` to emulate implicit bindings.
- Hiding side-effect imports, dynamic imports, or re-exports.
- Automatic directory scanning that turns filesystem layout into a public namespace contract.
- A graphical configuration editor.
- Broad redesign of the template's import-map or application architecture.

## Further Notes

- The research outcome should narrow the implementation ticket when a desired host cannot support the contract reliably. A smaller honest support matrix is preferable to adapters that only parse configuration.
- The dedicated package should remain useful outside Astro. Astro is one integration target and the location of the original proof, not the product boundary.
- The public vocabulary is `namespaces`, even when a descriptor selects a default or named export. The exposed identifier is the namespace-system binding; the `import` selector explains how it is sourced.
- This ticket is the appropriate place to investigate package and repository names before either becomes a compatibility commitment.
