# Next Plans

1. Close 1-2 more real cases and populate the gallery with only real outputs.
2. Improve the Lark bridge so deterministic workflow generation/in-flight conflicts do not cause false-positive closure.
3. Add a branch-update path to the GitHub publisher for repeat publishes of the same run.
4. Capture screenshots and the demo video for the hackathon submission.
5. Polish the README quickstart around the now-proven Docker/Kiro/Lark/Groq flow.

## Current Verified State

- Docker daemon/containerd blocker is resolved.
- All Compose images build.
- `terminal` and `kiro-agent` now include Kiro CLI `2.4.1`, Java 21, Maven `3.9.9`, and Node.
- `app` now includes Node, Java 21, Maven `3.9.9`, Kiro CLI `2.4.1`, GetLark CLI `0.5.0`, Git, and Zip.
- `lark-cli` can authenticate to Lark with `GETLARK_API_KEY`.
- The app reports Kiro `persisted-login-ready`; `KIRO_API_KEY` is still optional.
- The Lark bridge now uses the official `GETLARK_API_KEY` env var, `wfl_grp_...` workflow group IDs, and `wflw_...` workflow IDs.
- Case source fetching uses the Stack Exchange API body first, avoiding StackPrinter rate-limit junk.
- The Maven cold case workspace has been created with the full original question body.
- Kiro reproduced and repaired the Maven cold case locally, writing `reports/technical-report.md`.
- GitHub publishing now works with the corrected token.
- The Maven cold case artifact branch is published and replayable.
- Lark reproduced the original Maven failure from the published branch.
- Lark found an extra modern-JDK compiler compatibility issue, which was fixed in the repaired parent POM.
- Lark AI verification retry passed against the updated published branch.
- Groq generated final report artifacts for the Maven cold case after evidence truncation.
- The Maven case is now legitimately `Closed`.
