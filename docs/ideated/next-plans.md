# Next Plans

1. Run the remediated Lark-first pipeline on the existing Maven case and confirm Lark reproduction executes before Kiro repair in a fresh run.
2. Close two more real cases and populate the gallery with only real outputs.
3. Capture screenshots and the demo video for the hackathon submission.
4. Polish any remaining visual details in the serious pixel-art web shell after browser QA.
5. Add Lark MCP only if CLI execution is stable and MCP materially improves orchestration.

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
- The earlier external writer artifacts were scrubbed; both existing run report sets have now been regenerated through the focused Kiro writer and accepted by quality gates.
- The Maven case is now legitimately `Closed`.
- The implementation has been refactored to the concept-aligned pipeline: Kiro reconstruction, Lark reproduction evidence, Kiro repair, Lark verification, Kiro creative writer.
- Kiro agent research notes have been captured in `../info/kiro-agent-research-notes.md`.
