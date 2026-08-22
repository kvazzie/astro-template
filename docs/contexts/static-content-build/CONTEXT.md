# Static content build

This context describes how authored content participates in producing a valid
static artifact. It distinguishes continuing the build from accepting the build
as successful.

## Language

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
