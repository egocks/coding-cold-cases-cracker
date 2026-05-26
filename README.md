# Coding Cold Cases Cracker

Coding Cold Cases Cracker is a Docker-first support incident reproduction lab for old unanswered Stack Overflow questions. Judges choose a cold case, Kiro reconstructs and repairs it, Lark acts as the independent forensic verification lab, and Groq writes an evidence-grounded case file.

Winning thesis:

> AI can explain a bug. Lark makes the explanation stand trial.

## Judge Quickstart

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
- `GROQ_API_KEY`: required for creative case-story generation.
- `GITHUB_REPO_URL`: defaults to `https://github.com/egocks/coding-cold-cases-cracker.git`.
- `GITHUB_TOKEN`: optional until publishing is wired.

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
- The terminal desk lets judges browse/search cases and create runs.
- Each run creates an isolated workspace with case state, Kiro agent config, steering files, prompts, and Lark workflow payloads.
- The pipeline supports Kiro autopilot when `KIRO_API_KEY` is set and supervised Kiro when it is blank.
- Lark CLI workflow provisioning/execution is wired when `GETLARK_API_KEY` is present.
- GitHub publishing is wired when `GITHUB_TOKEN` is present.
- Groq report generation is wired when `GROQ_API_KEY` is present, with deterministic evidence reports as the honest fallback.

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
