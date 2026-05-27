# Coding Cold Cases Cracker

Coding Cold Cases Cracker is a Docker-first support incident reproduction lab for old unanswered Stack Overflow questions. Users choose a cold case, Kiro reconstructs the failure, Lark produces forensic reproduction evidence, Kiro repairs from that evidence, Lark grants or denies closure, and a focused Kiro writer turns the verified artifacts into an evidence-grounded cold case story.

Winning thesis:

> AI can explain a bug. Lark makes the explanation stand trial.

## Quickstart

```bash
cp .env.example .env
# Fill in keys as available.
docker compose up --build
```

Open:

- App shell: `http://localhost:3000`
- Terminal desk: `http://localhost:7681`

If a port is already in use, change `HOST_APP_PORT` or `HOST_TERMINAL_PORT` in `.env`.

## Environment

- `KIRO_API_KEY`: optional but recommended. When present, Kiro runs in headless autopilot mode.
- `GETLARK_API_KEY`: required for Lark workflow validation/provisioning/execution.
- `GITHUB_REPO_URL`: defaults to `https://github.com/egocks/coding-cold-cases-cracker.git`.
- `GITHUB_TOKEN`: required for publishing generated case workspaces to GitHub for Lark and user review.

If `KIRO_API_KEY` is blank, open the terminal desk and run:

```bash
kiro-cli login
```

Complete the device/browser login. The Docker volumes `kiro-data` and `kiro-config` persist Kiro auth across restarts.

## Current Docker Services

- `app`: lightweight shell and status endpoint.
- `terminal`: `ttyd` browser terminal with the real cold-case TUI, Kiro CLI, Java 21, and Maven available.
- `kiro-agent`: standby Kiro CLI container with Java 21/Maven that reports auth mode.
- `lark-cli`: Lark CLI runtime.
- `runner`: Java 21 and Maven runtime for normal case execution. Gradle cases should use a project-provided Gradle wrapper or a future optional Gradle runner profile.

## What Works Now

- The cold-case Markdown is parsed into a structured index.
- The terminal desk lets users browse/search cases, open dossiers, run investigations, inspect Lark evidence, and browse the gallery.
- Each run creates an isolated workspace with case state, phase-specific Kiro agents, steering files, prompts, Lark workflow payloads, replay artifacts, and reports.
- The pipeline supports Kiro autopilot when `KIRO_API_KEY` is set and supervised Kiro when it is blank.
- Lark CLI workflow provisioning/execution is wired twice: reproduction evidence before repair, verification after repair.
- GitHub publishing is wired when `GITHUB_TOKEN` is present.
- Creative case-story generation uses a dedicated Kiro CLI `case-writer` agent with narrow report-writing permissions, quality gates, and deterministic evidence reports as the honest fallback.

## Useful Commands

```bash
npm run check
npm run smoke
npm run tui
node app/cli.js gallery
```

API examples:

```bash
curl http://localhost:3000/api/status
curl http://localhost:3000/api/cases
```
