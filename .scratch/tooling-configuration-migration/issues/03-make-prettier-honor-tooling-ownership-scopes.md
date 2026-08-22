# 03: Make Prettier honor tooling ownership scopes

**What to build:** Make formatting use an Opt-in scope at the repository root
and an Opt-out scope within every workspace. Generated files must remain under
their producing workspace's exclusions, while every normal workspace file is
formatted automatically.

**Blocked by:** None (can start immediately).

**Status:** completed

- [x] Root format commands select only explicitly claimed root-owned paths and
      coordinate workspace formatting separately.
- [x] Every app, package, and tooling workspace exposes executable format-check
      and format-fix tasks.
- [x] Each workspace format command covers normal files within its boundary by
      default.
- [x] Generated declarations, generated design assets, generated localization
      assets, dependencies, and build output are excluded by their owning
      workspace.
- [x] A newly generated artifact does not make the repository format check fail
      and is not rewritten by the format-fix command.
- [x] Prettier and shared Prettier configuration imports are declared by the
      workspaces that execute or consume them.
- [x] Turbo's formatting plan contains no nonexistent workspace commands.
- [x] The repository format-check command passes after generation.
