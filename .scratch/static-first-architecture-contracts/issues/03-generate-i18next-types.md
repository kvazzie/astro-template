# 03 — Generate the i18next TypeScript layer

**What to build:** Replace the hand-written recursive translation-key type
machinery with definitions generated from the default locale by the official
i18next CLI, while preserving runtime catalog validation as a separate concern.

**Blocked by:** None — can start immediately.

**Status:** completed

- [x] Translation calls and metadata key references receive generated autocomplete and compile-time validation.
- [x] Generation and watch commands participate in the normal project lifecycle, and CI fails when definitions are stale.
- [x] The custom recursive TypeScript key computation is removed without removing required runtime key validation.
- [x] Invalid translation keys still fail at the existing schema boundary, and the complete quality command passes.
