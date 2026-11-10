# Research: accumulating SSG contract diagnostics

**Issue:** [07 — Accumulate SSG diagnostics with explicit recovery](../issues/07-add-fail-fast-ssg-contracts.md)
**Date:** 2026-08-20
**Status:** superseded research history; replacement specified in issue 07

> [!IMPORTANT]
> The recommendation below predates the decision to recover with explicit
> collection contracts while retaining diagnostics and failing at the build
> boundary. Its opaque `Checked` API and prohibition on recovery are no longer
> the intended design. Keep it only as research history until the replacement
> API is settled.

## Decision

Replace the ticket's fail-fast policy with two layers of accumulation:

1. an opaque validation value collects every independent check at one call site;
2. an Astro integration catches only the library's branded aggregate, associates it
   with the route, skips writing that invalid route, and fails the build once after
   every route has rendered.

Keep the application-facing API to two functions, `check` and `collect`. The Astro
integration factory is the third public value, used only from bootstrap
configuration. This gives the package one way to create a checked value, one way
to finish a group, and one framework adapter.

This is the same essential split established by applicative validation: independent
computations can accumulate errors, while dependent sequencing cannot manufacture
a later input when an earlier computation failed. fp-ts makes the distinction
explicit: ordinary `Either` application returns the first error, while
`getApplicativeValidation` needs a `Semigroup` and concatenates all errors.
[fp-ts `getApplicativeValidation`](https://gcanti.github.io/fp-ts/modules/Either.ts.html#getapplicativevalidation)

## Recommended application API

The public declarations can be approximately:

```ts
declare const checked: unique symbol;

export type Json = null | boolean | number | string | readonly Json[] | { readonly [key: string]: Json };

export interface DiagnosticInput {
  readonly code: string;
  readonly message: string;
  readonly context: Readonly<Record<string, Json>>;
  readonly cause?: unknown;
}

export interface Boundary {
  readonly name: string;
  readonly context?: Readonly<Record<string, Json>>;
}

export interface Checked<A> {
  readonly [checked]: A;
}

type ValueOf<T> = T extends Checked<infer A> ? A : never;

export function check<A, B extends A>(refinement: (received: A) => received is B, onViolation: (received: A) => DiagnosticInput): (received: A) => Checked<B>;

export function check<A>(predicate: (received: A) => boolean, onViolation: (received: A) => DiagnosticInput): (received: A) => Checked<A>;

export function collect<const Fields extends Readonly<Record<string, Checked<unknown>>>>(
  boundary: Boundary,
): (fields: Fields) => {
  readonly [Key in keyof Fields]: ValueOf<Fields[Key]>;
};

export function ssgDiagnostics(): import("astro").AstroIntegration;
```

`Checked<A>` is intentionally opaque. Application code can pass it to `collect`,
but cannot inspect, construct, recover, or extract `A`. Internally it is a small
success/failure union. A failed refinement may carry the original received value,
but the implementation never releases the refined type unless the whole group is
valid.

Example use in `Layout.astro`:

```ts
const { siteEntry, siteUrl } = pipe(
  {
    siteEntry: pipe(
      await getEntry("site", "default"),
      contracts.check(
        (entry): entry is NonNullable<typeof entry> => entry !== undefined,
        () => ({
          code: "SSG_SITE_ENTRY_MISSING",
          message: "Missing the required site/default content entry",
          context: { collection: "site", id: "default" },
        }),
      ),
    ),
    siteUrl: pipe(
      Astro.site,
      contracts.check(
        (site): site is URL => site instanceof URL && site.href === new URL(PUBLIC_SITE_URL).href,
        (site) => ({
          code: "SSG_SITE_URL_MISMATCH",
          message: "Astro.site must match PUBLIC_SITE_URL",
          context: {
            actual: site?.href ?? null,
            expected: PUBLIC_SITE_URL,
          },
        }),
      ),
    ),
  },
  contracts.collect({
    name: "page-head",
    context: { route: Astro.url.pathname },
  }),
);
```

Both property initializers run before `collect`; `collect` either returns the
fully narrowed record or throws one branded aggregate. There is no `match`,
`getOrElse`, `orElse`, fallback callback, or public error constructor.

## Invariants and error modes

- `check` calls its predicate once. A false result creates exactly one diagnostic.
  Its code, message, and JSON-safe context are required; `cause` is optional because
  a violated invariant does not always originate in an exception.
- The implementation creates an `Error` for each failed check at the check site,
  preserving its stack and installing the supplied `cause`. `collect` throws an
  internal `AggregateError` subclass whose `errors` are those individual errors.
  ECMAScript specifies both the `errors` list and optional error `cause` on
  `AggregateError`. [ECMA-262 `AggregateError`](https://tc39.es/ecma262/#sec-aggregate-error-constructor)
- A thrown predicate, diagnostic factory, formatter, or framework operation is an
  implementation fault, not a contract violation. It propagates immediately and
  is never converted into an ordinary diagnostic.
- Checks in one object are independent. Dependent work starts only after a
  successful `collect`; another group may then validate the derived value. This
  avoids pretending that validation can continue without a value.
- `collect` orders diagnostics by field name, not asynchronous completion order.
  The Astro adapter finally orders by route pathname, boundary name, field, and
  code. The output is therefore deterministic when Astro build concurrency is
  greater than one.
- Duplicate diagnostics are retained. Deduplication can erase distinct failures
  that happen to share a code and context.
- A caught branded aggregate can be enriched with boundary and route context, but
  application code receives no recovery operation. Unbranded errors always pass
  through unchanged.

The compiler is a useful precedent for the data shape and terminal behavior:
TypeScript diagnostics carry a category, numeric code, message, optional source
location, and related information, while the Compiler API example concatenates
pre-emit and emit diagnostics before choosing a non-zero exit when emission was
skipped. [TypeScript diagnostic interfaces](https://github.com/microsoft/TypeScript/blob/v5.9.3/src/compiler/types.ts),
[TypeScript Compiler API example](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler)

## Astro adapter

`ssgDiagnostics()` should install a wrapper with `setPrerenderer` during
`astro:build:start`. Astro documents both the factory form, which receives the
default prerenderer, and `setup`, `getStaticPaths`, `render`, and `teardown` as the
custom-prerenderer lifecycle. The API was added in Astro 6 and is public in Astro 7. [Astro custom prerenderer documentation](https://docs.astro.build/en/reference/adapter-reference/#custom-prerenderer)

The wrapper should:

1. delegate every default-prerenderer method;
2. in `render`, catch only the internal branded aggregate, attach the request
   pathname and route component, append it to an integration-owned list, and
   return `new Response(null, { status: 204 })`;
3. rethrow any unbranded error unchanged;
4. in `astro:build:generated`, sort the collected diagnostics and throw one final
   aggregate.

Astro 7.2's generator treats a non-redirect response with a null body as a null
render result, and `generatePathWithPrerenderer` returns without creating a
directory or writing a file for a null result. Thus an invalid route contributes
diagnostics but no fallback markup or route artifact.
[Astro 7.2 generation source](https://github.com/withastro/astro/blob/astro%407.2.0/packages/astro/src/core/build/generate.ts)

Do **not** throw the final aggregate from `teardown`. Astro 7.2 invokes teardown in
a `finally` after route generation. A teardown exception can therefore replace an
unrelated generation exception that is already unwinding. `astro:build:generated`
runs only after static generation and image work have succeeded, so it preserves
an earlier framework/filesystem failure while still turning a diagnostic-bearing
build into a non-zero build.
[Astro 7.2 generation lifecycle](https://github.com/withastro/astro/blob/astro%407.2.0/packages/astro/src/core/build/generate.ts),
[Astro `astro:build:generated`](https://docs.astro.build/en/reference/integrations-reference/#astrobuildgenerated)

### Stability assessment

The prerenderer wrapper is public and stable enough for this pinned Astro starter.
The null-body-means-skip behavior is not stated in the public prerenderer contract;
it is an Astro 7.2 implementation detail. Protect it with the ticket's production
fixture: two invalid routes must both appear in the final diagnostic, the command
must exit non-zero, neither route file may exist, and an unbranded render error
must remain the terminal error. Re-run that fixture on every Astro update.

The integration also occupies an adapter-level seam. The current project is static
and has no adapter, so that is coherent now. If a later product requirement adds
an adapter that supplies its own prerenderer, the two integrations must explicitly
compose rather than relying on integration order.

## Alternatives

| Choice                                                | Advantages                                                                                                                                                      | Costs and reason not chosen                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Opaque `Checked` plus `check`/`collect` — recommended | Two pipe-compatible application functions; record inference preserves names and refinements; deterministic accumulation; no public recovery path; no dependency | Requires a small internal result implementation and an Astro-specific adapter                                                                                                                                                                                                                                                                             |
| fp-ts `Either` applicative validation                 | Established pipe style; `getApplicativeValidation` has the exact independent-error accumulation semantics and accepts a caller-selected `Semigroup`             | Introduces a broad functional-programming dependency and vocabulary for a narrow seam; the same module publicly exposes recovery and fail-fast sequencing operations; the Astro route collector is still custom. [fp-ts `Either`](https://gcanti.github.io/fp-ts/modules/Either.ts.html)                                                                  |
| neverthrow `Result.combineWithAllErrors`              | Directly combines homogeneous arrays or heterogeneous tuples and returns every error in input order                                                             | Static/method-chain style is less natural for this repository's data-last pipes; its `Result` surface includes `orElse`, `unwrapOr`, and other recovery operations; record-shaped named inference and the Astro adapter remain custom. [neverthrow official API](https://github.com/supermacro/neverthrow#resultcombinewithallerrors-static-class-method) |

A mutable diagnostic bag was also considered and rejected. It would make calls
short, but it hides ordering and lifetime in ambient state, cannot soundly return a
narrowed value after recording a failed check, and becomes fragile under concurrent
route rendering.

## Ticket revision

Before implementation, revise the ticket language from “fail-fast” to “diagnostics
accumulation.” Preserve the requirements for stable codes, readable messages,
structured context, causes, stacks, non-zero builds, and no fallback markup. Replace
“catching can only enrich and rethrow” with: application consumers cannot recover;
the Astro adapter may catch branded aggregates solely to attach route context,
skip that route's output, and throw the complete deterministic aggregate at the
build boundary.
