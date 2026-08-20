# 06 — Add the Storybook Astro UI workbench

**What to build:** Provide a production-like Storybook Astro workbench for pure
UI components, with colocated stories as their primary executable states and no
blanket requirement for component unit tests.

**Blocked by:** 04 — Enforce the module import convention; 05 — Export component contracts explicitly.

**Status:** completed

- [x] Storybook development and static builds render Astro UI with the project's real styling and design configuration.
- [x] A private smoke fixture proves the workbench without adding demo UI to the generated application.
- [x] The documented convention places stories beside UI components and passes translated content, locale, and environmental values through args.
- [x] Markup-only UI components are not required to have Vitest files; layouts and pages are explicitly excluded from the Storybook contract.
- [x] The static Storybook build participates in the complete quality command.
