# Glossary

## Static content build

This context describes how authored content participates in producing a valid
static artifact. It distinguishes continuing the build from accepting the build
as successful.

### Language

**Collection contract**:
A named project value that identifies an authored-content collection and defines
the usable runtime value expected by its consumers, including a valid substitute
when the source value is unavailable.
_Avoid_: Magic collection string, collection schema when referring to the whole
contract

**Diagnostic**:
A retained account of a content problem that allows independent build work to
continue but makes the resulting static artifact invalid.
_Avoid_: Warning, swallowed error

**Recovery**:
Continuing downstream derivation with a valid substitute after recording a
diagnostic. Recovery never clears the diagnostic or makes the static artifact
valid.
_Avoid_: Success, ignoring the error

**Build boundary**:
The point after relevant static work has completed where accumulated diagnostics
determine whether the build succeeds.
_Avoid_: Fail-fast boundary

## Workspace tooling

This context defines how repository quality tooling claims ownership of files
without crossing workspace boundaries.

### Language

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
