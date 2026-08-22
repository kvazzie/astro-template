# 01: Make the shared ESLint contract type-safe

**What to build:** Make every consumer compose the shared ESLint layers through
a type-safe contract, including immutable internal-namespace definitions,
predefined globals, optional MDX support, and a final Prettier compatibility
layer. Workspace checks must validate the configuration files they execute.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] Shared ESLint layers compose through ESLint's typed configuration helper
      without widened tuple or rule-severity errors.
- [x] The internal-namespace configuration accepts readonly namespace and
      consumer-scope values without copies, casts, or mutation.
- [x] Predefined ESLint globals are accepted through the complete ESLint globals
      contract.
- [x] Prettier compatibility is an explicit exported layer that consumers place
      after Astro, internal-namespace, and optional MDX layers.
- [x] Every workspace type check includes the local ESLint and Prettier
      configuration that its commands execute.
- [x] Configuration imports are declared by their owning workspace rather than
      resolving through root dependency leakage.
- [x] The repository type-check command passes.
