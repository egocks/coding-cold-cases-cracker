# Kiro Agent Research Notes

Updated: 2026-05-26

## Primary References

- Kiro custom agents: https://kiro.dev/docs/cli/custom-agents/creating/
- Kiro agent configuration reference: https://kiro.dev/docs/cli/custom-agents/configuration-reference/
- Kiro headless mode: https://kiro.dev/docs/cli/headless/
- Kiro CLI command reference: https://kiro.dev/docs/cli/reference/cli-commands/

## Relevant Findings

- Project-specific agents live under `.kiro/agents/` and are available when `kiro-cli` runs from that workspace or a subdirectory.
- Custom agents are JSON files. The filename without `.json` becomes the selectable agent name.
- Supported agent fields relevant to this project include `name`, `description`, `prompt`, `tools`, `allowedTools`, `resources`, `toolsSettings`, `hooks`, `includeMcpJson`, `model`, and `welcomeMessage`.
- `prompt` can be inline text or a `file://` URI. The current implementation keeps high-level role text inline and passes the detailed per-run prompt through `kiro-cli chat`.
- `resources` can load local files and glob patterns into startup context. The writer agent now includes original case files, state files, steering files, Lark evidence, Kiro logs, and existing reports.
- Headless Kiro requires `kiro-cli chat --no-interactive` with a prompt argument.
- Headless tool execution should grant only the needed tool classes with `--trust-tools=...`.
- The installed CLI validates agents with `kiro-cli agent validate --path <agent-file>`.

## Project Decisions

- Use Kiro CLI headless as the current Writer AI provider.
- Generate a dedicated `.kiro/agents/case-writer.json` for every run.
- Personify the combined Kiro/Lark system as **Larkule Quirot** in the creative case file, so the user sees one mysterious problem-solving black box rather than two mascots taking turns.
- Preserve and use the original Stack Overflow poster handle/display name when the Stack Exchange API provides it.
- Keep the writer agent narrow:
  - tools: `read`, `write`, `grep`, `glob`, `thinking`, `report`, `introspect`;
  - auto-trusted runtime tools: `read`, `write`, `grep`, `glob`;
  - write paths restricted to `reports/technical-report.md`, `reports/case-file.md`, `reports/user-summary.md`, `reports/evidence-map.json`, and `reports/writer-note.md`.
- Keep reconstruction and repair agents broader because they must create repros, run builds, inspect failures, and modify candidate fixes.
- Keep debrief read-only through prompt, tool list, `allowedTools`, and shell denial settings.
- Validate generated agents during smoke tests when Kiro CLI is available.

## Current Caveat

The official command reference still shows the older positional example `kiro-cli agent validate ./my-agent.json`, while the installed CLI help requires `kiro-cli agent validate --path <agent-file>`. The smoke test follows the installed CLI behavior.
