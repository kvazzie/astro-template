# 04 — Enforce the module import convention

**Blocked by:** None — can start immediately.

**Status:** completed

**Research:** [Module imports and implicit internal namespaces](../research/04-enforce-import-style.md)

## Implementation Result

The validated registry now exposes the `i18n` and `siteContent` folder
interfaces as implicit value namespaces in application source and Vitest. Astro,
Vitest, generated TypeScript declarations, and ESLint consume projections of the
same registry, while bootstrap files, registered entrypoints, scripts, external
packages, workspace packages, Astro components, and side-effect imports retain
explicit imports.

The feasibility spike proved static namespace injection and value typing, but
Astro's compiled intermediate output did not reliably preserve a type-only
namespace reference for Unimport without producing a runtime import. The
specified fallback is therefore active: exported types use an explicit
`import type * as namespace` from the registered folder entrypoint. Focused
tests cover transform scope, clean declarations, Astro frontmatter, ESLint,
tree shaking, and watch-style invalidation; the complete `pnpm check` gate
passes.

## Problem Statement

Application source does not yet communicate dependency kind clearly enough.
An explicit import of a private implementation module looks too similar to an
import that crosses a framework, runtime, npm-package, or workspace-package
seam. Requiring explicit namespace imports for private modules would add a
qualifier, but it would retain repetitive declarations and would not create the
natural visual distinction desired by the project.

The project needs one coherent convention in which package-private modules are
recognizable at every use site, dependencies that cross a package or runtime
seam remain visible as imports, Astro components retain their component import
semantics, and tooling prevents these categories from drifting. The convention
must work consistently in TypeScript, Astro frontmatter, tests, editors, lint,
and production builds without weakening the workspace-package seam.

## Solution

Introduce a small, validated registry of package-private module interfaces.
Each registered module owns one deliberate folder entrypoint and one stable
namespace name. An Unimport-based adapter makes that namespace available on
demand inside the application transform scope by injecting a real static ESM
namespace import. Callers use the qualified namespace without writing an
internal import declaration.

All framework APIs, environment APIs, npm dependencies, Node APIs, and other
workspace packages remain explicit imports. Astro components remain explicit
default imports, side effects remain explicit side-effect imports, and
bootstrap or configuration modules retain explicit imports because they execute
before the application transform exists.

The registry is the single project-owned seam. Astro, Vitest, TypeScript, and
ESLint consume adapter projections from the same validated records. A focused
feasibility spike must prove the complete value-and-type behavior before the
convention is applied to current application source.

## User Stories

1. As an application developer, I want package-private dependencies to appear as qualified namespaces without import declarations, so that I can distinguish them immediately from external dependencies.
2. As an application developer, I want every external dependency to remain an explicit import, so that package and runtime seams stay visible at the top of a module.
3. As a workspace maintainer, I want dependencies on other workspace packages to count as external, so that monorepo colocation does not weaken package contracts.
4. As an application developer, I want a namespace member to resolve to a real static ESM import, so that normal bundling, dependency analysis, and module semantics are preserved.
5. As a module author, I want each registered namespace to expose one deliberate module interface, so that implementation files remain hidden behind a small surface.
6. As a module author, I want registration to be explicit rather than inferred from every folder, so that the filesystem does not accidentally become a public interface.
7. As a maintainer, I want namespace names to be stable and reviewable, so that renaming a folder does not silently change application source semantics.
8. As a maintainer, I want invalid, duplicate, or colliding namespace names to fail early, so that configuration never falls back to ambiguous last-one-wins behavior.
9. As a maintainer, I want registered entrypoints to be restricted to the owning package, so that the implicit mechanism cannot absorb workspace-package or npm-package dependencies.
10. As a TypeScript developer, I want namespace-qualified values to retain their inferred types, so that implicit internal access does not reduce type safety.
11. As a TypeScript developer, I want exported type members to be reachable through the same namespace qualifier when tooling proves that behavior reliable, so that value and type conventions remain coherent.
12. As a TypeScript developer, I want type-only namespace use to avoid surviving as an unnecessary runtime import, so that type references do not introduce side effects or bundle work.
13. As an Astro developer, I want the namespace convention to work in component frontmatter, so that Astro modules follow the same dependency language as TypeScript modules.
14. As an Astro developer, I want component dependencies to remain explicit default imports, so that component construction remains visibly different from independent module access.
15. As an application developer, I want stylesheet and other side-effect imports to remain explicit, so that evaluation-only dependencies are never hidden.
16. As a configuration author, I want bootstrap modules to retain explicit imports, so that they do not depend on a transformer that they are responsible for creating.
17. As a script author, I want standalone Node scripts to retain explicit imports, so that they remain executable without an application-specific loader.
18. As a test author, I want Vitest to apply the same namespace transform as the application, so that tests exercise production dependency semantics.
19. As a test author, I want watch mode to observe changes behind registered entrypoints, so that implicit namespaces do not make iterative testing stale.
20. As an editor user, I want completion, hover information, rename support, and go-to-definition for namespace members, so that removing import declarations does not remove navigability.
21. As a maintainer, I want generated declarations to be reproducible and available before type checking, so that clean checkouts and CI do not depend on a prior development server run.
22. As a maintainer, I want ESLint globals to come from the same registry as the transform, so that lint and runtime cannot disagree about available namespaces.
23. As a maintainer, I want ESLint to reject explicit bound imports of registered private modules in application scope, so that callers cannot bypass the convention.
24. As a maintainer, I want ESLint to reject local declarations and import aliases that shadow registered namespaces, so that an implicit dependency cannot be silently replaced.
25. As a maintainer, I want ESLint to accept explicit workspace-package imports, component imports, side-effect imports, and bootstrap exceptions, so that the policy does not erase meaningful distinctions.
26. As a framework user, I want framework and environment APIs to continue using explicit named imports where the project declares that convention, so that those environment-provided capabilities remain recognizable.
27. As a library user, I want ordinary external libraries to follow their actual public export contracts, so that the project does not force named syntax onto default-export packages.
28. As a performance-conscious developer, I want unused members behind a namespace entrypoint to remain tree-shakeable, so that the convention does not inflate production output.
29. As a performance-conscious developer, I want enumeration, spreading, and wholesale passing of namespace objects to be discouraged, so that static member access remains analyzable.
30. As an agent implementing later architecture issues, I want the registry to remain independent of current physical alias details, so that future package import maps can replace source specifiers without redesigning the convention.
31. As a repository maintainer, I want one shared registry seam rather than separate Astro, test, type, and lint lists, so that policy changes remain local and verifiable.
32. As a repository maintainer, I want a failed feasibility spike to stop or narrow the feature, so that the project does not adopt custom ambient namespace machinery merely to preserve the original idea.

## Implementation Decisions

- Build one project-owned internal-namespace registry module. Its interface is a list of stable namespace names and current-package entrypoint specifiers; Unimport-specific descriptors are hidden in an adapter.
- Treat the registry as the sole policy seam consumed by build, test, declaration, and lint adapters. Do not duplicate namespace lists in tool configuration.
- Validate registry records before tool configuration is produced. Names must be unique valid identifiers, entrypoints must resolve within the owning application package, and package-like specifiers—including workspace-package specifiers—must be rejected.
- Back each registered namespace with a checked-in folder entrypoint that defines the module interface. Implementation files behind that entrypoint are not registered individually.
- Keep the initial registry deliberately small and capability-oriented. Adding a folder to the repository does not make it implicitly accessible.
- Translate each registry record into a true static namespace import entry. Do not use directory export scanning because it flattens individual exports into unrelated globals.
- Begin implementation with a throwaway feasibility spike using the maintained Astro-aware auto-import adapter, which is powered by Unimport. The raw Unimport Vite adapter may replace it only if the spike proves equivalent Astro behavior and its smaller interface is materially clearer.
- Limit implicit consumption to application modules and tests that intentionally share the application transform environment. Exclude bootstrap configuration, repository tooling, standalone scripts, generated code, dependencies, component modules when acting as components, and side-effect assets.
- Treat every import from another workspace package as an external package dependency regardless of its location in the repository. Such imports remain explicit and follow the package's public export contract.
- Keep explicit named imports for the established framework-and-environment source registry. Do not generalize that rule to every external dependency.
- Keep Astro component values as explicit default imports. Named contracts exported by component modules remain available where later component-contract work requires them.
- Keep stylesheets and other evaluation-only dependencies as explicit side-effect imports.
- Keep current-package imports explicit in bootstrap configuration and standalone scripts because those modules execute before or outside the transform. Explicit namespace syntax remains the preferred internal spelling in those scopes.
- Generate both value and type declarations from the registry only if the spike proves that one qualifier works reliably in TypeScript, Astro checking, and editor tooling. Pure type use must not leave an unnecessary runtime import.
- If the type-namespace spike fails, retain explicit type namespace imports or abandon implicit namespaces. Do not introduce flattened global type names or custom ambient namespace generation in this issue.
- Produce declarations deterministically at a lifecycle point that runs before type checking in a clean checkout. The declaration output is generated, reproducible, and included by the application TypeScript project.
- Derive readonly ESLint globals, explicit-private-import restrictions, and namespace-shadowing restrictions from the same registry.
- In eligible application scope, reject bound relative or private-alias imports that bypass registered module interfaces. Continue permitting explicit component imports and side-effect imports.
- Fail configuration with actionable diagnostics for duplicate names, invalid identifiers, collisions with application globals, escaped entrypoints, missing entrypoints, or self-importing entrypoints. Represent consumer coverage as one fixed owning-package scope so overlapping scopes cannot be configured.
- Preserve normal ESM behavior behind the seam. Injected imports participate in the ordinary Vite module graph, HMR, cycle detection, and tree shaking.
- Avoid namespace enumeration, spreading, dynamic member lookup, and passing namespace objects wholesale. Callers should use statically named members.
- Keep future convention discovery and virtual facade generation behind the registry seam, but do not implement either initially.
- Update the framework-and-environment import rule alongside the namespace feature, including migration of any current default import that violates the named-environment convention.
- Complete the feature only when the repository's full quality command passes from the workspace root.

## Testing Decisions

- Use one highest-level contract seam: a representative validated namespace registry observed through the production Astro, Vitest, TypeScript, and ESLint adapters. Tests assert caller-visible source behavior and diagnostics rather than adapter descriptor arrays or generated selector strings.
- Make the feasibility spike a release gate rather than an implementation detail. It must prove value access and exported type access through the same namespace in TypeScript and Astro frontmatter.
- Verify a type-only namespace reference does not create a surviving runtime import in production-transformed output.
- Verify Astro checking recognizes generated declarations from a clean lifecycle without requiring a prior development-server run.
- Verify a representative Astro page builds and renders while consuming a registered namespace, an explicit external dependency, an explicit component, and an explicit side effect.
- Verify Vitest executes a module that consumes the same namespace and observes changes in watch-oriented transformation behavior.
- Verify generated declarations provide completion-compatible value and type shapes and resolve their entrypoints consistently with the application TypeScript project.
- Verify production output omits unused exports behind a representative entrypoint. Add a focused output fixture only if the spike shows namespace tree shaking is sensitive.
- Verify registry validation rejects duplicate names, invalid identifiers, missing or escaped entrypoints, package specifiers, workspace-package specifiers, and self-importing module interfaces with actionable messages.
- Verify ESLint accepts implicit registered access, explicit framework imports, ordinary external public contracts, workspace-package imports, default component imports, side-effect imports, and explicit bootstrap namespace imports.
- Verify ESLint rejects explicit bound imports of registered private modules in application scope, disallowed framework import shapes, namespace and named-as-default component forms, and declarations that shadow registered namespaces.
- Verify JavaScript, TypeScript, type-only syntax, and Astro frontmatter wherever the corresponding convention applies.
- Prefer programmatic linting of representative source strings at the lint configuration's public seam. Do not test selector construction or registry-to-rule translation as isolated implementation details.
- Follow existing test prior art by using Vitest for observable configuration and module behavior. Existing repository tests assert exported configuration outcomes and pure module behavior instead of private helper state.
- Finish verification with the complete workspace quality command, covering formatting, linting, style linting, Astro checking, tests, and the static production build.

## Out of Scope

- Implicit imports from npm packages, Node built-ins, framework modules, or other workspace packages.
- Automatic component imports or implicit stylesheet and side-effect imports.
- Repository-wide transformation of bootstrap configuration, ESLint configuration, scripts, or arbitrary tooling modules.
- Unimport directory scanning that exposes individual file exports as global identifiers.
- Convention-based discovery of every folder entrypoint.
- Generated virtual namespace facades, export parsing, or automatic barrels.
- A custom Node loader or runtime global object used to emulate the application transform outside Vite.
- Custom editor extensions or navigation plugins.
- Dynamic import expressions and re-export syntax beyond what is necessary for authored folder entrypoints.
- The later migration from physical source aliases to narrow package import maps.
- Pre-registering framework entrypoints for Storybook, observability, or other features that have not yet selected their actual dependencies.
- Changing Astro's static output mode or selecting a server adapter.

## Further Notes

- The research note linked above records the primary-source findings, the
  explicit-registry recommendation, and the rejected alternatives.
- This feature intentionally trades per-file import locality for a stronger
  visual distinction between package-private use and seam-crossing imports.
  Namespace qualification and deliberate module interfaces preserve as much
  navigability as possible.
- The preferred design is a deep module: a small registry interface hides
  validation, transform configuration, declaration generation, lint policy,
  and test integration while concentrating change in one seam.
- The completed feasibility spike narrowed the design to implicit value
  namespaces plus explicit type namespaces because Astro's intermediate output
  could not reliably preserve type-only injection without a runtime import.
