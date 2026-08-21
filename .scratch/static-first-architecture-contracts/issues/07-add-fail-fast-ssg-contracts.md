# 07 — Accumulate SSG diagnostics with explicit recovery

**What to build:** Introduce a small production build-time contract API that
keeps ordinary Astro and Promise data flows usable after content failures,
collects every independent diagnostic, and fails the static build at the build
boundary.

**Blocked by:** 04 — Enforce the module import convention.

**Status:** implemented; repository gate blocked by unrelated worktree errors

## Implementation Result

The application now exposes `Crush` as one registered internal namespace. Its
conditional transforms ordinary tuples, arrays, records, and settled Promise
results without wrapping the surrounding flow. Selected matching values and
selected rejections recover through collection-owned Zod schemas. `Crush.on`
provides the member catch adapter for `Promise.all`.

An Astro integration resets build-scoped diagnostics at build start, emits the
complete deterministic report after static rendering, and throws one aggregate
at the build boundary. The `Site` collection contract now owns its collection ID
and missing-entry recovery, and `Layout.astro` consumes it through the settled
pipeline.

Focused API, type, collection-contract, production-build, and lifecycle tests
cover the specified seams. The valid application build passes. The full
repository gate remains blocked by pre-existing configuration type errors in the
dirty worktree, outside ticket 07.

## Problem Statement

Static generation currently stops at the first missing content entry or rejected
Promise. This hides other independent content failures and forces application
code either to branch repeatedly or to derive output from values whose runtime
shape is unknown. Astro content collection types cannot prove that a requested
entry exists at runtime, and ordinary `Promise.all` exposes only the first
rejection.

The project needs to continue enough of the build to discover all actionable
content problems without pretending that the resulting artifact is valid. Any
substitute that can affect generated output must be conspicuous at the call site,
while diagnostics remain available for one final non-zero build result.

## Solution

Add a narrow set of data-last utilities over ordinary values and Promises. A
collection contract replaces repeated collection-name strings with a named value
that carries the collection identity, the runtime shape expected by consumers,
and a valid recovery value.

The primary flow starts with `Promise.allSettled`. One terminal conditional
selects top-level tuple positions or record fields, identifies fulfilled invalid
values with a Zod matcher, and supplies the corresponding collection contracts
through an explicit `instead` operation. Fulfilled valid values pass through,
fulfilled matching values recover through their collection contracts, and
selected rejections bypass value matching and recover through the same contracts.
The result is the ordinary recovered tuple or record, not settled-result wrappers.

For the secondary `Promise.all` flow, a collection contract can be passed to an
`on` catch adapter. The adapter records the rejection and returns that contract's
recovery value, preventing the member rejection from short-circuiting
`Promise.all`. It does not need a value matcher and does not require a later
conditional for that rejection.

Every recovery retains a diagnostic. Static generation may continue and may
derive output from recovery values, but accumulated diagnostics make the build
fail at the build boundary.

## User Stories

1. As a page author, I want a missing content entry to produce a usable recovery value, so that independent page derivation can continue.
2. As a page author, I want recovery to be explicit in the pipeline, so that I can see where generated output may differ from authored content.
3. As a page author, I want valid content values to pass through unchanged, so that contracts do not alter successful builds.
4. As a page author, I want recovered tuple elements to retain useful inferred types, so that destructuring does not expose `undefined` or settled-result wrappers downstream.
5. As a page author, I want recovered record fields to retain their names and inferred types, so that object-shaped pipelines remain readable.
6. As a content author, I want all independent content problems reported together, so that I can fix them in one editing pass.
7. As a content author, I want diagnostics to identify the expected collection contract, so that I know which authored content must be corrected.
8. As a build operator, I want recovery to preserve diagnostics, so that continued rendering never turns an invalid artifact into a successful build.
9. As a build operator, I want the build to exit non-zero once accumulated diagnostics are complete, so that invalid output cannot be mistaken for a deployable artifact.
10. As a build operator, I want rejected Promises to retain their original causes, so that infrastructure and loader failures remain diagnosable.
11. As a build operator, I want diagnostics ordered deterministically, so that local and CI reports are stable despite concurrent rendering.
12. As a build operator, I want recovery values to be allowed to affect generated output, so that later independent checks can still execute before final failure.
13. As an Astro developer, I want collection IDs to come from collection contract objects, so that application code does not repeat magic collection strings.
14. As an Astro developer, I want each collection contract to describe the runtime value returned to consumers, so that missing entries can be recovered at the point where Astro's static types stop helping.
15. As an Astro developer, I want collection contracts to own valid recovery behavior, so that callers do not rebuild partial entry shapes ad hoc.
16. As a pipeline author, I want the conditional utility to compose with `.then`, so that it fits ordinary Promise pipelines without introducing a new execution model.
17. As a pipeline author, I want top-level tuple positions and record fields selected declaratively, so that I can validate heterogeneous results without manual branching.
18. As a pipeline author, I want one matcher applied to several selected values, so that repeated absence checks stay concise.
19. As a pipeline author, I want each selected location mapped explicitly to its expected collection contract, so that heterogeneous recovery remains unambiguous.
20. As a pipeline author, I want selected settled rejections handled without a redundant normalization step, so that `Promise.allSettled` remains the primary straightforward flow.
21. As a `Promise.all` user, I want an explicit catch adapter for individual member rejections, so that I can preserve the familiar combinator when needed.
22. As a `Promise.all` user, I want a caught rejection to recover completely at that member, so that I do not need an additional conditional for the same rejection.
23. As a TypeScript developer, I want array, tuple, and record shapes preserved through the public API, so that recovery does not erase structural information.
24. As a maintainer, I want the utilities to remain a small layer over normal control flow, so that the project does not acquire an Effect or Result programming model for content loading.
25. As a maintainer, I want unexpected implementation faults to remain ordinary failures, so that diagnostic recovery cannot hide bugs in the contract machinery itself.
26. As a maintainer, I want diagnostic state scoped and reset for each build lifecycle, so that development rebuilds and tests cannot inherit stale failures.
27. As a coding agent, I want the operation names to describe the domain sentence directly, so that I can apply the API without first learning a general pattern-matching language.

## Implementation Decisions

- The public surface is a deep, narrow module of data-last utilities. It augments
  ordinary synchronous values, `Promise.all`, and `Promise.allSettled`; it does
  not introduce a wrapped computation type or own Promise scheduling.
- `Crush` is the design codename for the namespace, not a settled public product
  name. The operation grammar described here must survive any namespace rename.
- A collection contract is a named object with at least a stable collection ID
  and a recovering runtime schema. Application calls read the ID from this object
  rather than repeating collection-name strings.
- A collection contract's runtime schema describes the usable value returned to
  the pipeline. It guarantees a valid output when invoked for recovery and may
  use Zod's catch behavior to produce that output.
- Recovery records a diagnostic before returning a substitute. A schema catch
  must not erase the issue that caused recovery.
- The conditional grammar is `if` followed by a top-level selector, then `is`
  with a positive-match Zod schema and an `instead` mapping. `is` means that a
  selected fulfilled value matching the schema is invalid for this condition.
- The operation is named `instead`, not `insteadOf`. Its call has two deliberate
  readings: use the supplied collection contract instead, and the received value
  arrived instead of that collection contract.
- `instead` maps every selected tuple index or record key explicitly to the
  collection contract expected at that location. Tuple mappings use their actual
  indices; record mappings use their actual property names.
- Selectors support only top-level array or tuple indices and top-level record
  keys in this ticket. They do not define a nested object-path language.
- On ordinary input, selected values are checked independently. Every match is
  diagnosed and recovered before the transformed container is returned.
- On `Promise.allSettled` input, the same conditional directly unwraps fulfilled
  results. A selected rejection is diagnosed and recovered through its mapped
  collection contract without being tested by the value matcher, because no
  fulfilled value exists to match.
- The `Promise.allSettled` path returns the recovered ordinary tuple or record in
  one terminal transformation. It does not require a separate defer or unwrap
  operation.
- The secondary `on` operation accepts one collection contract and returns a
  Promise rejection handler. It records the rejection, preserves its cause,
  recovers through the contract, and returns the recovered value.
- `on` performs no value matching. A Promise that fulfills with an invalid value
  is outside the catch handler and still requires an explicit conditional where
  that case matters.
- An item recovered by `on` needs no additional conditional for that rejection.
  Other independently fulfilled invalid items may still use the conditional.
- Diagnostics accumulate in build-scoped state and are emitted together at the
  build boundary. Recovery does not remove, downgrade, or mark a diagnostic as
  handled.
- Each diagnostic has a stable machine-readable code, a readable message, the
  selected location, collection identity, route or component context when
  available, original cause when present, and a useful stack.
- Diagnostic ordering is deterministic and independent of Promise completion or
  route rendering order. Distinct occurrences are retained even when their
  messages or codes match.
- The build boundary throws one aggregate after relevant static work has had the
  opportunity to finish. Any accumulated diagnostic makes the command exit
  non-zero.
- Recovered output may be rendered before the aggregate is thrown. Such output is
  diagnostic evidence from a failed build, not a successful static artifact.
- A thrown matcher, collection contract, diagnostic formatter, or build
  integration is an implementation fault. It propagates as an ordinary failure
  rather than being converted into a recoverable content diagnostic.
- The implementation uses the existing Zod supplied through Astro. It does not
  add a generic pattern-matching, Result, validation, or effect-system dependency.

## Testing Decisions

- The highest acceptance seam is an intentionally invalid production static-build
  fixture. It exercises the public content-loading pipeline and build boundary
  rather than invoking diagnostic storage or framework hooks directly.
- The invalid fixture contains several independent failures, including a
  fulfilled missing value and a rejected Promise. It proves that both are
  reported, recovery allows later independent derivation to run, and the final
  build exits non-zero.
- The invalid fixture verifies stable codes, readable collection and location
  context, preserved rejection causes, useful stacks, and deterministic report
  ordering.
- The fixture may inspect recovered rendering to prove that substitutes reached
  downstream derivation, but it must never treat those files as a successful
  artifact. The command's final non-zero result is authoritative.
- A valid production fixture proves that ordinary values pass through unchanged,
  no diagnostics are emitted, and static generation behaves as before.
- Focused public API tests cover top-level tuple indices, arrays, and record keys;
  multiple matches; heterogeneous collection contracts; unchanged valid values;
  and recovery of selected settled rejections.
- Focused public API tests prove that the `Promise.allSettled` flow performs its
  unwrapping and recovery in one transformation without a defer step.
- Focused public API tests prove that `Promise.all` member catches using `on`
  record rejection causes, return recovered values, and need no later conditional
  for those rejections.
- Type-level assertions cover tuple arity, record keys, collection-contract output
  types, removal of settled-result wrappers, and removal of matched absence types
  after recovery.
- Lifecycle tests run independent builds or equivalent integration lifecycles in
  one process and prove that diagnostics do not leak between them.
- Tests assert caller-visible values, reports, exit status, and generated output.
  They do not assert singleton internals, helper call order, or private diagnostic
  representations.
- Existing content-schema tests are prior art for schema-boundary behavior. The
  repository's production build and complete quality command remain the final
  integration gates.
- The complete `pnpm check` command must pass after the feature is implemented.

## Out of Scope

- A generic Effect, Result, applicative-validation, or pattern-matching library.
- Replacing or wrapping `Promise.all` and `Promise.allSettled` with project-owned
  scheduling combinators.
- A nested path-selection language or arbitrary structural pattern matching.
- Silent recovery, successful builds with retained diagnostics, or treating
  recovered output as deployable.
- Runtime SSR recovery, server adapters, request-time error handling, or client
  validation.
- Optional OpenTelemetry reporting, which remains ticket 08.
- Recovery from bugs thrown by matchers, formatters, collection contracts, or the
  build integration itself.
- Selecting a permanent public namespace name as part of this design codename.

## Further Notes

- The intended sentence is: crush the program if a selected value is the invalid
  matcher instead of the mapped collection contract. This is specialized static
  content-build language, not a general matching DSL.
- `Promise.allSettled` is the primary multi-source use case because it exposes all
  member outcomes. The conditional consumes those outcomes directly.
- The `on` catch adapter exists for code that deliberately keeps `Promise.all`.
  It is complete for rejection recovery but cannot observe a fulfilled invalid
  value.
- The original fail-fast and no-recovery ticket language is superseded. Recovery
  keeps derivation running; the retained diagnostic protects artifact validity at
  the build boundary.
