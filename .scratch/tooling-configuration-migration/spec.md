# Complete the workspace tooling configuration migration

**Status:** ready-for-agent

## Problem Statement

The tooling configuration migration is incomplete. Shared ESLint and Prettier
configuration has moved into workspace packages, but configuration ownership,
task routing, type checking, dependency declarations, and documentation still
partly follow the former root-owned model.

As a result, the repository-wide quality gate fails on generated files and
TypeScript errors. More seriously, ESLint can report success while application
rules are not applied because their file patterns are evaluated from the wrong
boundary. Some tooling workspaces also appear in Turbo without executable lint
tasks, and several configuration imports resolve only because matching packages
happen to exist at the repository root.

For a template repository, these failures are copied into every derived project.
The template needs an explicit ownership model that remains correct when users
add root files, workspace source files, generated artifacts, or new workspaces.

## Solution

Complete the migration around two tooling ownership policies.

Root tooling uses an **Opt-in scope**. It covers only repository paths that the
root explicitly claims. Adding a new root path does not silently place it under a
root configuration.

Each app, package, and tooling workspace uses an **Opt-out scope**. It covers all
files inside its workspace boundary and excludes only generated files,
dependencies, build output, and other deliberate exceptions. Adding a normal
source or configuration file inside a workspace automatically places it under
that workspace's quality checks.

Root commands coordinate workspace tasks and run checks for the root's own
Opt-in scope. Shared configuration packages provide typed configuration layers,
while each consumer owns path selection and workspace-specific overrides. The
complete `pnpm check` command becomes green and trustworthy under the pinned
Node version.

## User Stories

1. As a template maintainer, I want root tooling to use an Opt-in scope, so that
   it never claims files owned by an app or package.
2. As a template maintainer, I want each workspace to use an Opt-out scope, so
   that new workspace files are checked without editing a central path list.
3. As a template user, I want a newly added application source file to be linted
   automatically, so that quality coverage does not depend on remembering a
   second configuration change.
4. As a template user, I want generated declarations and generated design or
   localization assets excluded by their owning workspace, so that generation
   does not make formatting or linting fail.
5. As a template user, I want a newly added root directory to remain outside
   root checks until it is explicitly claimed, so that the root does not assume
   ownership of a future workspace or provider directory.
6. As a template maintainer, I want root commands to coordinate all workspace
   checks, so that contributors keep one documented entry point for local and CI
   validation.
7. As a template maintainer, I want every in-scope workspace to expose the tasks
   expected by Turbo, so that a missing script cannot produce a misleading
   successful run.
8. As a template maintainer, I want ESLint rules evaluated relative to the
   consuming workspace boundary, so that application-only rules apply during the
   real application lint command.
9. As a template maintainer, I want the ESLint configuration tests to use the
   same working directory and file paths as the real command, so that tests
   cannot pass under different path semantics.
10. As a template maintainer, I want shared ESLint exports to retain ESLint's
    flat-config types, so that consumer configuration errors fail type checking.
11. As a template maintainer, I want shared namespace configuration to accept
    readonly domain values, so that it composes with immutable namespace
    definitions without copying or weakening them.
12. As a template maintainer, I want shared namespace configuration to accept
    the full ESLint globals contract, so that predefined browser globals remain
    valid and type-safe.
13. As a template maintainer, I want Prettier compatibility applied after every
    ESLint rule layer, so that Astro or optional MDX configuration cannot
    re-enable conflicting formatting rules.
14. As a template user adding MDX, I want the documented ESLint fragment and
    ordering to match the exported tooling API, so that the documented setup
    works as written.
15. As a workspace author, I want configuration files included in that
    workspace's type check, so that broken local configuration cannot hide
    behind a source-only TypeScript include.
16. As a workspace author, I want every imported tool declared in the owning
    package manifest, so that package behavior does not depend on root dependency
    leakage.
17. As a template maintainer, I want plugin dependencies owned by the shared
    tooling packages, so that the root manifest does not retain obsolete copies
    from the previous architecture.
18. As a contributor, I want explicit formatting and lint fix commands to follow
    the same ownership model as their check variants, so that fixes touch only
    files owned by the selected root or workspace configuration.
19. As a CI maintainer, I want the complete quality gate to run under Node 24, so
    that local verification matches the repository's declared engine contract.
20. As a future agent, I want the workspace tooling glossary and repository
    documentation to describe the same ownership model, so that later changes do
    not collapse back into a broad root configuration.

## Implementation Decisions

- Root configuration uses an Opt-in scope. It selects only root-owned scripts,
  configuration, documentation, and other explicitly claimed paths.
- App, package, and tooling configurations use an Opt-out scope. They cover the
  whole owning workspace and list only deliberate exclusions.
- Root commands are coordinators. They dispatch workspace tasks through Turbo
  and run tool commands only for the root's Opt-in scope.
- Each workspace provides the lint, lint-fix, format-check, and format-fix tasks
  required by repository orchestration. A task expected by Turbo must never have
  a nonexistent command.
- Shared ESLint exports are created through ESLint's typed configuration helper.
  Consumers compose typed arrays without relying on widened inferred tuples.
- The internal-namespace ESLint factory accepts readonly namespace definitions,
  readonly consumer scope values, and ESLint-compatible globals.
- File selection in shared ESLint layers is relative to the consumer's workspace
  boundary. Repository-relative domain values are translated at the consumer
  boundary instead of leaking into app-local CLI behavior.
- Prettier compatibility is an explicit ESLint layer and is always composed last.
  Optional MDX configuration is inserted before that final layer.
- Workspace TypeScript checks include public source and local tooling
  configuration. A workspace check must validate the configuration that its
  scripts execute.
- Every package declares the tools and shared configurations imported by its
  local configuration. Shared tooling packages own their plugins. Consumers own
  the corresponding CLI package when they execute it.
- Dependencies left at the root only for the former monolithic configuration are
  removed after workspace manifests are complete.
- Generated-file exclusions remain with the workspace that produces those files.
  Root formatting does not discover or format workspace-owned output.
- Repository documentation describes the coordinator role of the root, the two
  scope policies, the workspace task contract, and the working optional MDX
  setup.
- The migration does not introduce deployment adapters, additional application
  frameworks, or broad configuration switches.

## Testing Decisions

- The highest acceptance seam is `pnpm check` under Node 24. It exercises design
  and localization generation, formatting, linting, type checking, Storybook,
  tests, and production build through the same command used locally and in CI.
- ESLint configuration behavior needs one focused regression seam because a
  clean source tree cannot prove that a restrictive rule was applied. Extend the
  existing configuration test suite to execute from the application workspace
  boundary with app-local file paths. A registered private import must fail, and
  an allowed import must pass.
- Workspace orchestration needs one focused regression seam because Turbo treats
  a missing package script as a skipped task. Inspect Turbo's dry-run plan and
  assert that every in-scope app, package, and tooling workspace has executable
  lint and check tasks.
- Type checking is the regression seam for exported configuration contracts and
  local configuration files. It must catch invalid shared config composition,
  mutable-only factory parameters, invalid globals, and undeclared config
  imports.
- Formatting is tested after generated artifacts have been materialized. The
  repository format check must ignore workspace-owned generated files while
  checking normal root and workspace files.
- Tests assert externally visible pass or fail behavior and resolved rule
  coverage. They do not snapshot full generated configuration objects or test
  internal helper implementation.
- Existing ESLint configuration tests are the prior art for rule behavior.
  Existing workspace checks and the complete repository quality gate are the
  prior art for type and integration coverage.

## Out of Scope

- Changing application behavior, static build behavior, design tokens, content
  schemas, localization behavior, or Storybook stories.
- Adding an Astro adapter or changing the repository from static output.
- Adding MDX before the application has a real MDX use case.
- Replacing pnpm, Turbo, ESLint, Prettier, Stylelint, or Vitest.
- Making the shared tooling packages public or designing them for use outside
  this template repository.
- Adding configuration switches for unsupported workspace layouts or package
  managers.
- Fixing unrelated Vite native config-loader warnings or Storybook bundle-size
  warnings.

## Further Notes

- The current full check first fails during formatting because a generated
  application declaration is discovered from the root.
- The application type check independently reports four errors at the shared
  ESLint consumer boundary.
- The real app-local ESLint CLI currently accepts a restricted private import,
  while the existing configuration test suite passes with repository-relative
  paths. The migration is incomplete even if the visible check failures are
  fixed.
- Direct tooling-package lint commands currently pass, but Turbo does not invoke
  them because the expected scripts are absent.
- Stylelint, the existing test suite, Storybook build, and the production build
  pass when run separately. They remain part of final regression verification.
- Local diagnosis ran under Node 25 and produced the expected engine warning.
  Final acceptance must use the pinned Node 24 runtime.
