# 20 — Extract and publish the namespaces package

**What to build:** Turn the validated namespace prototype into a self-contained,
declarative package powered by Unimport, implement the host adapters selected by
the research ticket, prepare the package for a history-preserving Git split,
publish it from a dedicated repository, and leave the template ready to consume
the released package in a follow-up migration.

**Blocked by:** 19 — Research a portable namespaces package.

**Status:** ready-for-agent

## Problem Statement

JavaScript and TypeScript projects can use Unimport to inject static imports, but
doing so directly exposes library-specific descriptors and requires each project
to independently solve configuration discovery, namespace validation, generated
declarations, transform scope, lint agreement, framework wiring, test-runner
integration, and backend execution. The current template proves these concerns
for one Astro application, but its implementation is not a portable public
package and cannot be split safely while it depends on repository-specific
assumptions.

Users need a small declarative namespaces product, not another generic
auto-import engine. They should be able to describe exposed identifiers and
their source imports in the manifest native to their ecosystem, in a dedicated
fallback file, or directly in a bundler or framework plugin. The same
configuration must produce ordinary static ESM imports across the supported
frontend and backend hosts and must fail clearly wherever the transform is not
available.

## Solution

Build a self-contained namespaces package around Unimport. Accept one explicit
mapping from exposed identifiers to `from` and `import` descriptors, regardless
of whether it comes from `package.json`, `deno.json`, the dedicated fallback
file, or direct plugin options. Normalize and validate the mapping once, then
project it into the selected transform, declaration, lint, test, and runtime
adapters.

Develop the package inside an isolated workspace boundary with its own tests,
documentation, build, license, and release configuration. Prove it through one
black-box consumer fixture across all supported configuration frontends and
host adapters. Once the package is independent, split its history into a
dedicated repository and publish the supported artifacts. Keep replacement of
the template's local implementation as a deliberate follow-up after a released
version passes the template's full quality gate.

## User Stories

1. As a JavaScript developer, I want to declare namespaces as data, so that I do not need to understand Unimport descriptors.
2. As a TypeScript developer, I want the same declarative interface, so that runtime convenience does not weaken editor or type-checker behavior.
3. As a configuration author, I want each exposed identifier to have explicit `from` and `import` fields, so that the resulting import is understandable without library-specific knowledge.
4. As a namespace user, I want `*` to select a module namespace, so that one qualified identifier exposes a deliberate module interface.
5. As a namespace user, I want `default` to select a default export, so that default-export modules fit the same declarative system.
6. As a namespace user, I want an export name to select a named export, so that individual capabilities can be exposed without a wrapper module.
7. As a namespace user, I want a named export aliased to the configured identifier, so that application vocabulary is independent of upstream export names.
8. As a Node project author, I want the mapping in `package.json` by default, so that I do not need another configuration file.
9. As a Deno project author, I want the mapping in `deno.json` or `deno.jsonc` by default, so that the package feels native to Deno projects.
10. As a mixed-runtime project author, I want `namespace.json` or `namespace.jsonc` as a fallback, so that Node and Deno can share one declaration.
11. As a dedicated-file user, I want the file contents to be the mapping itself, so that I do not repeat a top-level `namespaces` wrapper.
12. As a bundler user, I want to pass the same mapping directly to `namespaces`, so that programmatic configuration is concise and fully typed.
13. As a framework author, I want to embed the package's adapter, so that users receive namespace support through the framework's normal plugin surface.
14. As a backend developer, I want an execution path selected for my runtime, so that implicit identifiers never reach an untransformed process.
15. As a Deno developer, I want supported development and test commands, so that Deno support is operational rather than configuration-only.
16. As a Deno compiler user, I want compile and publication limitations documented, so that generated executables and JSR packages do not contain unresolved identifiers.
17. As a Node workspace user, I want the nearest owning package to control discovery, so that namespaces do not leak across workspace members.
18. As a Deno workspace user, I want the equivalent member boundary, so that workspace layout does not change identifier availability.
19. As a cross-runtime user, I want module specifiers resolved by the host, so that namespace configuration composes with package and Deno import maps.
20. As a user of external modules, I want any supported host specifier accepted when the selected adapter can resolve it, so that the package does not impose one application's internal-only policy.
21. As an application developer, I want imports injected only when a configured identifier is referenced, so that unused namespaces create no runtime dependency.
22. As a module-system user, I want injected dependencies to be real static imports, so that cycles, errors, and evaluation follow ordinary ESM semantics.
23. As a performance-conscious developer, I want unused exports tree-shaken, so that namespace convenience does not inflate production output.
24. As a watch-mode user, I want changes behind configured modules to invalidate consumers, so that iterative development remains correct.
25. As a test author, I want tests to use the same transform and mapping as production, so that test success predicts deployed behavior.
26. As an editor user, I want generated declarations available from a clean checkout, so that completion and navigation do not depend on starting a dev server first.
27. As a TypeScript user, I want type-only limitations explicit, so that a type reference never creates an accidental runtime import.
28. As a maintainer, I want invalid identifiers rejected, so that generated code is always syntactically valid strict ESM.
29. As a maintainer, I want collisions and shadowing diagnosed, so that local code cannot silently replace an implicit binding.
30. As a maintainer, I want excluded files diagnosed when they use configured identifiers, so that ambient declarations cannot hide missing runtime transforms.
31. As a configuration author, I want malformed and ambiguous configuration to fail with its source location, so that mistakes are corrected at the declaration boundary.
32. As a security-conscious user, I want manifest and dedicated-file loading to remain declarative, so that discovery does not execute arbitrary project code.
33. As a plugin author, I want direct object configuration to avoid filesystem discovery, so that embedded integrations remain deterministic.
34. As a package maintainer, I want adapter dependencies isolated behind exports or optional peers, so that users do not install frameworks they do not use.
35. As a package maintainer, I want the workspace package to test and pack independently, so that it can be split without copying template infrastructure.
36. As a release maintainer, I want automated compatibility checks and semantic releases, so that supported hosts receive deliberate versioned changes.
37. As an npm user, I want a documented package with accurate exports and peer ranges, so that installation failures are actionable.
38. As a Deno or JSR user, I want the distribution selected by research to be first-class, so that Deno is not supported only through Node compatibility by accident.
39. As a repository maintainer, I want useful package history preserved in the new repository, so that architectural decisions remain traceable.
40. As a template maintainer, I want adoption deferred until a release exists, so that extracting the package does not destabilize the application proof.

## Implementation Decisions

- The package is a namespace declaration, validation, discovery, and integration layer powered by Unimport. It does not fork or reimplement Unimport's detection and injection engine.
- The public configuration is a mapping keyed by the identifier exposed to authored source. Every value is an object with a `from` module specifier and an `import` selector.
- An `import` selector of `*` produces a namespace import under the configured identifier. A selector of `default` produces a default import. Any other valid selector names an exported binding that is imported under the configured identifier.
- The public descriptor remains explicit even where a shorter string form could be inferred. User clarity without prior knowledge of the implementation libraries takes precedence over saving one property.
- `package.json` and `deno.json`/`deno.jsonc` are the default declarative sources. Their top-level `namespaces` field contains the mapping.
- `namespace.json` and `namespace.jsonc` are fallback configuration files. Their root object is the mapping itself and must not contain a redundant `namespaces` wrapper.
- Direct bundler and framework integration uses a `namespaces` factory receiving the mapping object directly. Supplying direct configuration bypasses manifest and fallback-file discovery.
- Configuration discovery and ambiguity follow the precedence selected by the research ticket. Multiple implicit sources must never merge silently.
- Configuration ownership stops at the selected package or workspace-member boundary. Parent configuration does not leak into child packages unless a future explicit composition feature defines that behavior.
- The `from` value is a module specifier passed to normal host resolution. The package does not introduce a separate path-alias language and does not retain the template prototype's `#/`-only restriction as a universal rule.
- The package emits real static ESM imports on demand. It does not install runtime globals or service-locator objects.
- Side-effect imports, dynamic imports, and re-exports remain explicit source syntax because they do not expose an unresolved local identifier with the same semantics.
- Host adapters own safe include and exclude defaults appropriate to their source pipeline. The normalized consumer scope must be shared by transformation, declarations, tests, and linting for that host.
- Bootstrap configuration, generated artifacts, the namespace package itself, and any other untransformed scope must not appear to support implicit identifiers. If ambient declarations are visible there, linting or an equivalent diagnostic must reject their use.
- Namespace identifiers must be valid strict-ESM bindings and must not collide with configured globals, other namespace identifiers, or adapter-reserved bindings.
- Manifest and dedicated-file loaders parse data without executing project configuration code. JSONC support preserves comments and trailing commas while retaining source-aware diagnostics.
- Direct plugin configuration is typed and validated through the same public normalization seam as declarative files.
- Generated declarations are deterministic, reproducible, ignored or published according to the host contract, and available before clean type checking and editor startup.
- Type-only behavior follows the capability decision from research. Where implicit type namespaces cannot be guaranteed without runtime imports, the package documents and enforces explicit type imports rather than generating custom ambient namespace machinery.
- Namespace objects are intended for static member access. Documentation discourages enumeration, spreading, dynamic member lookup, and wholesale passing where those patterns would weaken tree shaking.
- Entry modules must not acquire a self-import through the same configured identifier. The implementation prevents or diagnoses self-injection at the public configuration boundary.
- Adapter support is tiered according to research evidence. Core, officially supported, experimental, and unsupported hosts are labeled honestly rather than sharing one vague compatibility claim.
- Deno support includes the selected source-transformation execution path, configuration loading, type checking, testing, watch behavior, and documented permissions. Parsing `deno.json` alone is not considered support.
- CommonJS behavior follows the explicit research decision. ESM-only support is acceptable when documented and enforced.
- Adapter-specific dependencies are optional peers or isolated exports where practical. Installing the core package must not install every supported framework or bundler.
- The package contains its own manifest, source, tests, fixtures, TypeScript configuration, formatting and lint rules or inherited publishable equivalents, build, package verification, README, changelog policy, license, CI, and release configuration before splitting.
- The package must not import application-private modules, depend on generated application artifacts, or require the template repository's root scripts to test, build, or pack.
- The dedicated repository preserves the package's relevant Git history and establishes its selected default branch, ownership, issue templates, security policy, release automation, npm provenance, and JSR configuration where applicable.
- The template continues using its proven local implementation until a released package is available. Replacement and deletion of the local implementation are a follow-up migration verified by the template's complete quality command.

## Testing Decisions

- Use one primary black-box seam: a consumer fixture supplies public configuration, runs the public adapter, and executes and type-checks the resulting code. Tests assert caller-visible behavior and diagnostics rather than internal schemas or generated Unimport descriptors.
- Reuse the same fixture contract across `package.json`, `deno.json`, `deno.jsonc`, `namespace.json`, `namespace.jsonc`, and direct `namespaces` options.
- The fixture matrix covers namespace, default, named, and aliased named imports and proves the exact observable exports reached through each configured identifier.
- Configuration discovery tests cover nearest-package ownership, workspace members, fallback behavior, direct-option precedence, simultaneous manifests, ambiguous definitions, missing configuration, malformed JSON, malformed JSONC, and source-located diagnostics.
- Validation tests cover invalid strict identifiers, reserved identifiers, global collisions, duplicate keys where the selected parser can observe them, missing `from`, missing `import`, invalid selectors, unresolved sources, self-injection, and local shadowing.
- Transformation tests prove that no import is added for an unused configured identifier and that the emitted dependency is an ordinary static ESM import when used.
- Production-output tests include a sentinel unused export and assert that supported bundlers remove it.
- Watch tests mutate the configured source module and assert that a consumer observes the new value through normal dependency invalidation.
- Clean declaration tests remove prior generated output, run the supported lifecycle, and verify type checking, completion-compatible shapes, and source navigation targets.
- Type-only tests verify that pure type references follow the documented policy and never leave an unnecessary runtime import.
- Excluded-scope tests verify that bootstrap modules, entry modules, generated files, and unsupported hosts receive an actionable error rather than a false ambient success.
- Deno tests run through the actual supported Deno commands or wrapper selected by research. They cover configuration discovery, execution, testing, checking, watch invalidation, permissions, and compilation or clearly document any unsupported command.
- Node tests cover the supported maintained Node release range and package import maps. Bun or other runtime tests are added only when promoted to a documented support tier.
- Host-adapter smoke tests remain narrow and reuse the shared black-box cases. They prove lifecycle wiring that the core fixture cannot exercise, not copies of normalization tests.
- Package tests run after an isolated pack/install into a temporary consumer with no workspace symlinks. This catches undeclared dependencies and root-only assumptions.
- Repository-split verification runs install, formatting, linting, type checking, unit and fixture tests, build, pack, and publication dry runs from the split repository.
- npm and JSR artifacts, where selected, are inspected to ensure only intended source, declarations, metadata, licenses, and documentation are published.
- Existing project registry and Unimport integration tests are prior art for validation, Astro transformation, generated declarations, tree shaking, and watch behavior. The package tests replace their project-specific configuration with the public namespaces interface.

## Out of Scope

- Reimplementing Unimport or maintaining a fork without a separately justified upstream requirement.
- Generic directory scanning that exposes every file or export automatically.
- Runtime globals, dependency-injection containers, or service locators presented as static imports.
- Implicit side-effect imports, dynamic imports, or re-exports.
- Automatic namespace inheritance across workspace packages.
- Guaranteeing support for every bundler, framework, test runner, runtime, or editor in the first release.
- Treating manifest parsing alone as Deno runtime support.
- Publishing authored library source that contains unresolved implicit identifiers without a declared transform requirement.
- Replacing the template's current implementation before a package release passes the template quality gate.
- Redesigning application import maps, framework APIs, or monorepo package boundaries as part of extraction.
- A visual configuration editor or framework-specific scaffolding UI.

## Further Notes

- The name “namespaces” describes the product's exposed binding system, even when a descriptor sources a default or named export. The descriptor keeps that sourcing explicit.
- The dedicated fallback filename is singular: `namespace.json` or `namespace.jsonc`. Its contents are already the namespace map.
- A separate repository is part of the delivery boundary, not merely an aspirational follow-up. The workspace phase exists to prove independence and preserve useful history before the split.
- The research ticket may narrow adapters or publication targets when evidence shows that a host cannot satisfy static imports, declarations, lint agreement, and execution reliably.
