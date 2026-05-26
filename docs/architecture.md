# Architecture

Coding Cold Cases Cracker is a Docker-first incident reproduction lab.

## Runtime Shape

- `app` serves the thin browser shell, secret-safe status API, case index API, run API, gallery API, and artifact zip endpoint.
- `terminal` runs `ttyd` and starts the real cold-case TUI with Kiro, Java 21, and Maven available in the same browser terminal.
- `kiro-agent` keeps Kiro CLI, Java 21/Maven, and persisted auth/config in Docker volumes.
- `lark-cli` provides the Lark CLI runtime used to create workflow groups, create workflows, invoke workflows, and fetch evidence.
- `runner` provides Java 21 and Maven for normal Java cold cases. Gradle cases should use a project-provided wrapper or an optional Gradle profile.

## Data Flow

1. The app parses `coding-cold-cases-java-stackoverflow.md` into `cases/index/cases.json`.
2. A judge selects any case in the TUI.
3. The app creates `cases/workspaces/<case-id>/<run-id>/`.
4. The workspace receives case metadata, Kiro agent config, steering files, Kiro handoff prompt, and Lark workflow payloads.
5. Kiro investigates in autopilot or supervised mode.
6. The workspace can be published to GitHub for remote Lark access.
7. Lark runs reproduction and verification workflows.
8. Groq writes reports from collected evidence.
9. The gallery lists real solved or partial runs.

## Closure Rule

Only Lark can close a case. Kiro may investigate and repair, and Groq may narrate, but the state becomes `closed` only when Lark verification passes.
