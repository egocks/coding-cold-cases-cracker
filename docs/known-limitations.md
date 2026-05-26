# Known Limitations

- Docker Desktop on the development machine previously hit a local BuildKit/containerd metadata I/O error. This is documented in `docs/blockers.md` and should be retested after Docker Desktop recovery.
- Some cases depend on Android, Vagrant, desktop tools, historical services, or old repositories. These may become `partial` or `blocked` unless a responsible minimal model can be created.
- `KIRO_API_KEY` is optional, but fully unattended runs need it. Blank keys use supervised Kiro login in the browser terminal.
- GitHub publishing needs `GITHUB_TOKEN`. Without it, Lark may be unable to access generated local workspaces remotely.
- Groq report generation needs `GROQ_API_KEY`. Without it, the app writes deterministic evidence reports instead of creative narrative reports.
- Lark MCP is not yet enabled; Lark CLI is the primary integration path.
- The default runner intentionally avoids a heavyweight global Gradle install for judge speed. Gradle cases should use a generated/project Gradle wrapper or a later optional Gradle runner profile.
