# Confer With Agent Research

Date: 2026-05-27

## Goal

`Confer with agent` should let the user talk to the investigator about a selected cold case, steer the repair, request follow-up work, and ask the agent to run useful commands such as replaying Lark workflows. When the user exits the conversation, the app should return automatically to the Case Desk TUI.

Switching to Kiro CLI interactive mode is the strongest near-term implementation because it uses the real Kiro product surface instead of a weaker imitation.

## Current App State

- The terminal service already runs `ttyd` attached to a `tmux` session named `coldcase`.
- The visible TUI is `node app/cli.js tui`, launched by `scripts/terminal-menu.sh`.
- Bezel buttons and outside-page arrow keys already send allowlisted keys to tmux through the terminal control sidecar.
- `C=Confer` currently prints a Kiro command only; it does not start an agent session.
- Kiro artifacts already exist per run: agents, steering files, prompts, Lark workflow payloads, reports, logs, and state.
- Existing Kiro phases are `reconstruction`, `repair`, `debrief`, and `writer`.
- `case-debriefer` is intentionally read-only, which is too narrow for the desired “steer the fix / rerun Lark” behavior.

## Official Kiro Findings

Sources checked:

- https://kiro.dev/docs/cli/chat/
- https://kiro.dev/docs/cli/terminal-ui/
- https://kiro.dev/docs/cli/reference/cli-commands/
- https://kiro.dev/docs/cli/custom-agents/configuration-reference/
- https://kiro.dev/docs/cli/reference/built-in-tools/
- https://kiro.dev/docs/cli/acp/
- https://agentclientprotocol.com/

Relevant facts:

- Kiro CLI chat is explicitly an interactive terminal conversation surface.
- `kiro-cli chat [INPUT]` accepts a first prompt.
- `--agent <AGENT>` starts chat with a specific custom agent.
- `--tui` forces the terminal UI.
- `--resume`, `--resume-id`, and `--resume-picker` support conversation persistence.
- Sessions are scoped to the current working directory.
- Kiro TUI supports `/exit` and `/quit`, and also supports `Ctrl+C` / `Ctrl+D` for leaving the session.
- Kiro TUI supports shell escapes with `!command`, so the user can run explicit commands from inside the chat.
- Kiro’s shell tool can also run commands chosen by the model.
- Agent configs support `tools`, `allowedTools`, `toolsSettings`, `resources`, `includeMcpJson`, and prompt files.
- `write.allowedPaths`, `shell.deniedCommands`, `shell.allowedCommands`, `shell.autoAllowReadonly`, and `shell.denyByDefault` provide useful permission boundaries.
- Kiro supports ACP (`kiro-cli acp`) over JSON-RPC stdio, and advertises `loadSession: true`, image prompt capability, and MCP HTTP capability.

## Installed CLI Findings

Observed inside the project Docker terminal container:

```text
kiro-cli 2.4.2
```

Installed `kiro-cli chat --help` confirms:

```text
kiro-cli chat [OPTIONS] [INPUT]
--resume
--resume-id <SESSION_ID>
--resume-picker
--agent <AGENT>
--trust-all-tools
--trust-tools <TOOL_NAMES>
--no-interactive
--list-sessions
--require-mcp-startup
--tui
--legacy-ui
--agent-engine <v2|v1|kas>
--mode <vibe|spec>
```

Installed `kiro-cli acp --help` confirms:

```text
kiro-cli acp --agent <AGENT> --trust-all-tools --trust-tools <TOOL_NAMES>
```

ACP initialization was tested with a minimal JSON-RPC `initialize` request. Kiro responded successfully:

```json
{
  "protocolVersion": 1,
  "agentCapabilities": {
    "loadSession": true,
    "promptCapabilities": {
      "image": true,
      "audio": false,
      "embeddedContext": false
    },
    "mcpCapabilities": {
      "http": true,
      "sse": false
    },
    "sessionCapabilities": {}
  },
  "agentInfo": {
    "name": "Kiro CLI Agent",
    "title": "Kiro CLI Agent",
    "version": "2.4.2"
  }
}
```

An experimental `session/new` probe did not produce a response within the short timeout used. This is not a blocker for the terminal handoff path, but it means ACP should be treated as a later integration track that needs protocol-level work.

## Isolated Tmux Experiment

Experiment: start a separate tmux session where Node prints a TUI line, spawns a child process with `stdio: "inherit"`, then resumes after the child exits.

Observed output:

```text
TUI before child
child took terminal
child exiting
TUI resumed code=0
```

Conclusion: a Node TUI running in tmux can yield the visible terminal to a child process and recover afterward. This strongly supports launching `kiro-cli chat --tui` directly from `app/cli.js` rather than using browser-side command injection.

## Recommended Architecture

Implement `Confer` as an in-process TUI handoff:

1. User presses `C=Confer`.
2. `app/cli.js` pauses the Case Desk TUI.
3. The app generates or refreshes a confer prompt and a `case-confer` agent.
4. The app spawns `kiro-cli chat --tui` with `stdio: "inherit"` and `cwd` set to the correct case workspace.
5. The user chats with Kiro in the same visible ttyd/tmux terminal.
6. Kiro may read artifacts, run approved commands, write allowed files, and use Lark wrapper commands where appropriate.
7. User exits Kiro with `/exit`, `/quit`, `Ctrl+D`, or `Ctrl+C`.
8. The Node TUI resumes and returns to Case Desk or the originating case screen.

This is the smallest implementation that feels real. It avoids an arbitrary browser command endpoint and avoids a custom ACP client for v1.

## Proposed Kiro Agents

Add a new agent:

```text
case-confer
```

Purpose:

- interactive investigator conversation;
- answer questions about the selected case;
- review artifacts and timeline;
- accept user hints;
- recommend next moves;
- run safe replay commands;
- rerun Lark through app-provided wrappers;
- update planning notes when the run is paused or finished.

Keep `case-debriefer` for read-only closed-case explanation. Use `case-confer` for active case discussion.

## Confer Modes

### Pre-Brief Mode

Available before casework starts.

Recommended workspace:

```text
artifacts/prebrief/<case-id>/
```

Behavior:

- does not create a real case run;
- does not change public case status;
- includes case metadata, original post text, narrative teaser, URL, tags, and risks;
- allows brainstorming and reproduction strategy;
- write access should be limited to prebrief notes only.

Suggested prompt file:

```text
artifacts/prebrief/<case-id>/prompts/kiro-confer-prebrief.md
```

### Active Run Mode

Available while casework is ongoing.

Behavior:

- read-only by default while the pipeline is actively running;
- can explain current status and evidence;
- can prepare suggestions, but should not mutate run artifacts while a pipeline phase owns them.

This preserves the earlier UX rule: Monitor is read-only, and Confer is read-only until a step pauses or the run finishes.

### Paused Or Finished Run Mode

Available when status is `awaiting_kiro_supervision`, `partial`, `blocked`, `resolution_validated`, or `closed`.

Behavior:

- can read all run artifacts;
- can write notes, prompts, reports, and bounded workspace changes;
- can run app wrapper commands to continue or rerun parts of the investigation;
- can help the user challenge or deepen an existing result.

## Commands Kiro Should Be Allowed To Use

Avoid teaching Kiro internal Node module paths. Provide explicit wrapper commands:

```bash
node /workspace/app/cli.js advance-run "$PWD"
node /workspace/app/cli.js run-pipeline "$PWD"
node /workspace/app/cli.js zip <run-id>
```

Add more precise helpers:

```bash
node /workspace/app/cli.js rerun-lark "$PWD" reproduction
node /workspace/app/cli.js rerun-lark "$PWD" verification
node /workspace/app/cli.js refresh-run "$PWD"
```

The new `rerun-lark` helper should:

- load the run from disk;
- regenerate Lark workflow payloads if needed;
- invoke only the selected Lark phase;
- append the correct log;
- update `case-state.json`;
- avoid marking a case `closed`.

The agent can still run local replay scripts:

```bash
tests/lark/red/replay-reproduction.sh
tests/lark/green/replay-verification.sh
```

## Suggested Launch Commands

Run-based mutable Confer:

```bash
cd "$RUN_WORKSPACE"
kiro-cli chat --tui \
  --agent case-confer \
  --trust-tools=read,write,shell,grep,glob,web_fetch,web_search \
  "$(cat prompts/kiro-confer.md)"
```

Run-based read-only Confer:

```bash
cd "$RUN_WORKSPACE"
kiro-cli chat --tui \
  --agent case-confer \
  --trust-tools=read,grep,glob,web_fetch,web_search \
  "$(cat prompts/kiro-confer.md)"
```

Pre-brief Confer:

```bash
cd "$PREBRIEF_WORKSPACE"
kiro-cli chat --tui \
  --agent case-confer \
  --trust-tools=read,write,grep,glob,web_fetch,web_search \
  "$(cat prompts/kiro-confer-prebrief.md)"
```

## Session Persistence

Kiro conversations are directory-scoped. That helps us:

- run work sessions from the case run workspace;
- run pre-brief sessions from a prebrief workspace;
- avoid mixing unrelated cases.

Do not blindly use `--resume` yet. Some run workspaces already contain writer/reconstruction sessions, so `--resume` could reopen the wrong conversation. Better v1:

- start a fresh prompted Confer session every time;
- tell the user `/chat resume` is available inside Kiro if they want to pick up a previous conversation;
- later add session tracking by parsing `kiro-cli chat --list-sessions` and storing a selected `confer_session_id`.

## Permission Model

Use agent config and launch flags together.

For read-only sessions:

- tools: `read`, `grep`, `glob`, `web_fetch`, `web_search`, `thinking`, `report`, `introspect`;
- allowed tools: `read`, `grep`, `glob`;
- shell denied or omitted.

For mutable paused/finished sessions:

- tools: `read`, `write`, `shell`, `grep`, `glob`, `web_fetch`, `web_search`, `thinking`, `report`, `introspect`;
- write allowed paths:
  - `repro/**`
  - `repaired/**`
  - `reports/**`
  - `prompts/**`
  - `lark/**`
  - `tests/lark/**`
  - `case.json`
  - `case-state.json`
- shell denied commands:
  - `git push.*`
  - `git commit.*`
  - `rm -rf /.*`
  - `rm -rf ~.*`
  - `docker .*`
- allowed or encouraged commands:
  - `node /workspace/app/cli.js advance-run .*`
  - `node /workspace/app/cli.js rerun-lark .*`
  - `tests/lark/red/replay-reproduction.sh`
  - `tests/lark/green/replay-verification.sh`
  - common read-only commands via `autoAllowReadonly`.

Do not expose a browser endpoint that accepts arbitrary shell commands.

## User Experience

Before launch, show a short transition screen:

```text
Confer With Agent
-----------------

Opening Larkule Quirot in Kiro CLI.

You can:
- ask questions about this case;
- give hints or objections;
- request replay commands;
- ask for another pass at the fix.

Exit Kiro with /exit, /quit, Ctrl+D, or Ctrl+C to return to the Case Desk.
```

After Kiro exits:

```text
Confer session ended.
Refreshing case state...
Returning to Case Desk.
```

## ACP Alternative

ACP is technically viable and worth keeping as a later track.

Pros:

- could support an in-app chat panel;
- could show streaming messages, tool calls, and status updates outside the terminal;
- could eventually integrate with the Evidence Board and Bulletins more tightly.

Cons:

- requires implementing a JSON-RPC ACP client;
- requires handling session lifecycle, prompt turns, tool notifications, cancellation, and optional Kiro extensions;
- our quick `initialize` probe worked, but a short `session/new` probe did not complete, so deeper protocol work is needed;
- it does not improve the hackathon-critical path as much as launching the real Kiro TUI.

Recommendation: use terminal handoff for v1, document ACP as a future web-native chat path.

## Implementation Plan

1. Add `case-confer` support in `app/lib/kiro.js`.
2. Generate `prompts/kiro-confer.md` for run workspaces.
3. Add prebrief scratch workspace generation under ignored `artifacts/prebrief/<case-id>/`.
4. Add `launchConferSession(rl, coldCase, run)` in `app/cli.js`.
5. Replace `printConferCommand` call sites with the launcher.
6. Use `child_process.spawnSync` or `spawn` with `stdio: "inherit"` and `cwd` set to the correct workspace.
7. Pause/restore readline cleanly before and after Kiro.
8. Add `rerun-lark` and `refresh-run` CLI commands so Kiro has stable app-level actions.
9. Update `docs/implemented/ui-flow.md` after implementation.
10. Smoke test through ttyd/tmux:
    - prebrief Confer;
    - paused/finished run Confer;
    - read-only active-run Confer;
    - exit Kiro and return to Case Desk.

## Open Questions

- Should mutable Confer be allowed on `resolution_validated`, or should it require the user to explicitly reopen the case first?
- Should Kiro update `case-state.json` directly during Confer, or should it write notes and rely on app commands to mutate state?
- Should `Confer` return to Case Desk always, or to the screen it launched from?
- Should prebrief notes become visible later in the Case Dossier after casework starts?

## Blockers

No genuine blocker found.

The only significant caution is ACP: initialization works, but a proper ACP chat client is not a quick implementation. It should not block the terminal handoff approach.
