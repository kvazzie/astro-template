# 01 — Rename formatting commands to fmt

**What to build:** Rename the public formatting command family from `format` to
`fmt` everywhere so developers, CI, editor tasks, hooks, and documentation use
one concise vocabulary without compatibility aliases.

**Blocked by:** None — can start immediately.

**Status:** completed

- [x] `fmt` applies formatting and `fmt:check` verifies formatting from the workspace root.
- [x] Every documented command, task, and hook uses the new names; the old script names no longer exist.
- [x] The complete quality command passes after the rename.
