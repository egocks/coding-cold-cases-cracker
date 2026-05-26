# Next Implementation Step

## Recommendation

The best next step is to turn the successful `lark-cold-case-poc` skeleton into the real `coding-cold-cases-cracker` foundation.

Do not start with the aesthetic shell. Start with the core incident-reproduction engine:

```text
Cold case menu TUI
  -> case workspace generator
  -> Kiro agent handoff through ttyd
  -> red/green local runner
  -> GitHub publishing
  -> Lark workflow group creation
  -> Lark execution against the published workspace
  -> Groq-written case story
  -> case gallery
```

## Why This Is the Best Next Step

The POC already proved:

- Kiro CLI can be configured with a local agent.
- Kiro can use tools when the agent config is correct.
- Kiro can reproduce, repair, verify, and write a report.
- Lark workflow payloads can be generated and validated.

The biggest missing proof is:

> Can Lark run a real generated case workspace from a reachable remote source and produce verification evidence?

That is the next architecture risk to retire.

## Concrete Build Order

### Phase 1: Real TUI and Case Index

Build the TUI under `coding-cold-cases-cracker/`.

Features:

- Parse `coding-cold-cases-java-stackoverflow.md`.
- List all cases.
- Search by title, tags, and cold signal.
- Open a case detail view.
- Start a new investigation workspace for any selected case.

Output:

- `cases/index/cases.json`
- `cases/workspaces/<case-id>/<run-id>/case.json`

### Phase 2: Kiro Agent Pack

Create generated Kiro agent resources per case.

Features:

- `.kiro/agents/case-investigator.json`
- `.kiro/steering/product.md`
- `.kiro/steering/tech.md`
- `.kiro/steering/structure.md`
- `prompts/kiro-handoff.md`

Agent must include:

- read/write/shell tools
- fetch/search tools where available
- case URL
- original case text and metadata
- strict red/green evidence requirements

### Phase 3: Docker-First Runtime and Web Shell

Build a Docker-first runtime so judges can run the project with one command after installing Docker.

Goal:

- `docker compose up` starts the app.
- The browser opens to the serious pixel-art shell.
- The shell embeds the TUI/terminal experience.
- Kiro, Lark, Groq, language runtimes, build tools, and `ttyd`/terminal dependencies live inside containers.
- Judges should not need Homebrew, local Java, local Maven, local Kiro, local Node, or local `ttyd`.

Container services:

- `app`: TUI/web shell controller and API.
- `terminal`: `ttyd` or Node pseudo-terminal exposing the TUI.
- `agent`: Kiro CLI runtime for investigation.
- `runner`: Docker-in-Docker or mounted Docker socket runner for case builds/tests, used carefully.
- `lark`: Lark CLI bridge.
- `writer`: Groq story generation worker, or folded into `app` if simpler.

Important Kiro auth behavior:

- `KIRO_API_KEY` is optional but preferred.
- If `KIRO_API_KEY` is present, use headless autopilot mode.
- If `KIRO_API_KEY` is blank, fall back to interactive Kiro device/browser login inside the Dockerized terminal.
- Persist interactive login state in Docker volumes so judges authenticate once.

Implemented foundation:

- `docker-compose.yml` defines `app`, `terminal`, `kiro-agent`, `lark-cli`, and `runner`.
- `scripts/kiro-status.sh` reports `autopilot-ready`, `interactive-ready`, or `interactive-login-required`.
- `scripts/kiro-solve.sh` chooses headless or interactive Kiro using the same case prompt and agent name.
- Kiro auth/config is persisted in named Docker volumes.

### Phase 4: GitHub Publishing

Add a publishing step that pushes case workspaces to the permanent GitHub repository.

Recommended structure:

```text
cases/workspaces/<case-id>/<run-id>/
```

This makes the workspace reachable by Lark and judges.

### Phase 5: Lark Execution

Create real Lark resources using prefix:

`Coding Cold Cases - Hackathon - ...`

Per case:

- workflow group
- reproduction workflow
- verification workflow
- evidence summary workflow if useful

Use Lark to run against the GitHub-published workspace.

Strict closure rule:

- A case is not `Closed` unless Lark verification passes.

### Phase 6: Groq Story Writer

Use Groq immediately and extensively after evidence exists.

Inputs:

- original Stack Overflow text
- Kiro report
- local red/green logs
- Lark execution logs
- Lark execution IDs
- final code diff

Output:

- creative case story
- technical solution narrative
- evidence summary
- confidence/caveats

### Phase 7: Gallery

Generate a gallery from real solved cases only.

Goal:

- 2-3 real solved cases before final submission.
- No fake seeded entries.

## Immediate Blockers / Inputs Needed

- Groq API key.
- Kiro API key is optional but recommended for Docker/headless judge runs.
- Decision on how the app should authenticate for GitHub pushes.
- Whether the app should use Docker socket mounting or Docker-in-Docker for case runner containers.

Resolved:

- Permanent GitHub repo URL: `https://github.com/egocks/coding-cold-cases-cracker.git`

## Suggested First Implementation Target

Implement phases 1-2 first, then immediately containerize them in phase 3.

Reason:

The TUI + Kiro handoff is the visible heart of the app, but hackathon judges must be able to run it quickly. Once the real case index works, wrap it in Docker before deep feature work.

Recommended adjustment:

Docker-first is now a product requirement. Local host tooling can remain useful for development, but the judge path should be:

```bash
cp .env.example .env
# add keys
docker compose up --build
```

The ideal submission demo should say: "Install Docker, add keys, run one command."
