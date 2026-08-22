# Workspace tooling

This context defines how repository quality tooling claims ownership of files
without crossing workspace boundaries.

## Language

**Opt-in scope**:
A tooling ownership policy that covers only explicitly selected repository
paths. New paths remain uncovered until claimed.
_Avoid_: Root scope, allowlist scope

**Opt-out scope**:
A tooling ownership policy that covers every path within a workspace boundary
except explicit exclusions. New paths are covered automatically.
_Avoid_: Workspace scope, denylist scope

**Root coordinator**:
The root command layer that dispatches workspace tasks and checks the root's
Opt-in scope.
_Avoid_: Root tool owner, monolithic configuration

**Workspace task contract**:
The required `check`, `lint`, `lint:fix`, `fmt:check`, and `fmt` commands that let
the Root coordinator include a workspace in repository quality checks.
_Avoid_: Optional workspace scripts, implicit tasks
