# Lark Integration

Lark is the forensic verification spine of Coding Cold Cases Cracker.

## CLI Strategy

The project uses Lark CLI first because the hackathon rewards Lark CLI and/or MCP usage and because the CLI is judge-friendly inside Docker.

The bridge uses the CLI-supported `GETLARK_API_KEY` environment variable before invoking `getlark`.

Per run, the app generates:

- `lark/reproduction-workflow.json`
- `lark/verification-workflow.json`
- `lark/README.md`

When a key is available, the app attempts to:

1. create a workflow group named `Coding Cold Cases - Hackathon - <case-id> - <run-id>`
2. create an AI-driven reproduction workflow
3. create a deterministic verification workflow
4. invoke both workflows with `--wait --verbose`
5. store raw output in `logs/lark.log`

Verified:

- `getlark workflow-groups list --limit 1` succeeds from the Dockerized `lark-cli` image with `GETLARK_API_KEY`.
- Workflow group IDs use the `wfl_grp_...` shape shown by the installed CLI help.

## Why Lark Matters

The app does not treat Lark as decorative logging. Lark owns closure:

- failed reproduction evidence helps Kiro investigate
- verification evidence decides whether the case is truly closed
- raw Lark output remains visible in the TUI/API artifacts

## MCP Position

Lark MCP is intentionally deferred until the CLI path is reliable. It should be added only if it improves agent orchestration or evidence retrieval enough to justify the extra moving parts.
