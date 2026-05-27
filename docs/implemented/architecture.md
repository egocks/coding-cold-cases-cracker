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
2. A user selects any case in the TUI.
3. The app creates `cases/workspaces/<case-id>/<run-id>/`.
4. The workspace receives case metadata, phase-specific Kiro agents, steering files, Kiro prompts, Lark workflow payloads, and red/green replay artifact paths.
5. Kiro reconstruction creates the smallest responsible failing reproduction and stops before repair.
6. The reproduction workspace is published to GitHub for remote Lark access when credentials are available.
7. Lark runs the reproduction workflow and writes forensic evidence for Kiro.
8. Kiro repair reads the Lark reproduction evidence and creates the candidate fix.
9. The repaired workspace is published again.
10. Lark runs verification and grants or denies closure.
11. A focused Kiro writer agent writes a technical report, creative case file, user summary, and evidence map.
12. The gallery lists real solved or partial runs.

## State Machine

```text
prepared
-> kiro_reconstruction_started
-> reproduction_ready
-> publishing_reproduction
-> lark_reproduction_running
-> lark_reproduction_ready
-> kiro_repair_started
-> repair_ready
-> publishing_repair
-> lark_verification_running
-> closed | partial | blocked
-> reports_ready
```

## Closure Rule

Only Lark can close a case. Kiro may investigate, repair, and narrate, but the state becomes `closed` only when Lark verification passes.
