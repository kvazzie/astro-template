# Domain docs

How engineering skills consume this repository's domain documentation.

## Before exploring, read these

- `CONTEXT-MAP.md` at the repository root. It points to the glossary for each
  context. Read every context relevant to the task.
- `docs/adr/` for decisions that apply across contexts.
- Context-local `docs/adr/` directories for decisions limited to the context
  being changed.

If any of these files do not exist, proceed silently. The `/domain-modeling`
skill creates glossaries and ADRs only when terms or decisions are resolved.

## File structure

This repository uses a multi-context layout:

```text
/
├── CONTEXT-MAP.md
├── docs/adr/
└── docs/contexts/
    ├── static-content-build/
    │   ├── CONTEXT.md
    │   └── docs/adr/
    └── workspace-tooling/
        ├── CONTEXT.md
        └── docs/adr/
```

Context-local ADR directories are created only when that context needs one.

## Use the glossary's vocabulary

When output names a domain concept in an issue title, refactor proposal,
hypothesis, or test name, use the term defined by the relevant `CONTEXT.md`. Do
not substitute a word that the glossary marks under `_Avoid_`.

If a needed concept is absent, reconsider whether the project uses it. Record a
real vocabulary gap through `/domain-modeling`.

## Flag ADR conflicts

If proposed work contradicts an ADR, state the conflict instead of silently
overriding the decision.
