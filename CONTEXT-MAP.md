# Context map

## Contexts

- [Static content build](./docs/contexts/static-content-build/CONTEXT.md): retains content
  diagnostics while static build work continues
- [Workspace tooling](./docs/contexts/workspace-tooling/CONTEXT.md): defines how
  quality tooling claims ownership of repository paths

## Relationships

- **Workspace tooling -> Static content build**: Workspace tooling covers the
  code that implements the static content build, but does not define whether a
  static artifact is valid.
