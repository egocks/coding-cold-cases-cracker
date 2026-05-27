# Known Limitations

- Docker Desktop on the development machine previously hit a local BuildKit/containerd metadata I/O error. This is documented in `blockers.md` and should be retested after Docker Desktop recovery.
- Some cases depend on Android, Vagrant, desktop tools, historical services, or old repositories. These may become `partial` or `blocked` unless a responsible minimal model can be created.
- `KIRO_API_KEY` is optional, but fully unattended runs need it. Blank keys use supervised Kiro login in the browser terminal.
- GitHub publishing needs `GITHUB_TOKEN`. Without it, Lark may be unable to access generated local workspaces remotely.
- Creative report generation now uses the Dockerized Kiro CLI `case-writer` agent. If Kiro is not authenticated or the output fails narrative quality gates, the app writes deterministic evidence reports and records the creative writer failure.
- Existing generated case reports may be scrubbed and regenerated when provider limits or quality gates make the user-facing narrative unreliable. The forensic Kiro/Lark artifacts should be preserved while only writer outputs are replaced.
- Lark may not always generate a synthetic unit test for historical cases. In those cases, the app preserves command-level red/green replay artifacts and documents why replay is the responsible evidence model.
- Lark MCP is not yet enabled; Lark CLI is the primary integration path.
- The default runner intentionally avoids a heavyweight global Gradle install for startup speed. Gradle cases should use a generated/project Gradle wrapper or a later optional Gradle runner profile.
