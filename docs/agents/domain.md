# Domain docs

How engineering skills consume this repository's domain documentation.

## Before exploring, read these

- `GLOSSARY.md` at the repository root for terms relevant to the task.
- `docs/adr/` for decisions relevant to the task.

If a file or directory does not exist, proceed silently. The `/domain-modeling`
skill creates glossaries and ADRs only when terms or decisions are resolved.

## File structure

```text
/
├── GLOSSARY.md
└── docs/adr/
```

## Use the glossary's vocabulary

When an issue title, refactor proposal, hypothesis, or test name refers to a
domain concept, use its term from `GLOSSARY.md`. Avoid the synonyms marked
`_Avoid_`. If a concept is absent, reconsider whether the project uses it or
record the vocabulary gap through `/domain-modeling`.

## Flag ADR conflicts

If proposed work contradicts an ADR, state the conflict instead of silently
overriding the decision.
