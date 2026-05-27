# Documentation Map

Updated: 2026-05-27

This map records the current documentation reorganization.

## Implemented

These documents describe features or plans that have been implemented at least partially, even where the current code has drifted from the original technical direction.

- `../implemented/architecture.md`
- `../implemented/concept.md`
- `../implemented/concept-remediation-plan.md`
- `../implemented/hackathon-judge-experience.md`
- `../implemented/lark-integration.md`
- `../implemented/next-implementation-step.md`
- `../implemented/tmux-terminal-control-plan.md`
- `../implemented/ui-flow.md`
- `../implemented/ui-flow-implementation-notes.md`

## Ideated

These documents are planned, proposed, pending, or decision-oriented work that is not implemented as a complete feature in the current app.

- `../ideated/demo-script.md`
- `../ideated/next-plans.md`
- `../ideated/submission-writeup.md`
- `../ideated/ui-flow-open-questions.md`

## Info

These documents primarily record facts, usage guidance, examples, progress logs, limitations, research, or source archives.

- `blockers.md`
- `case-closed-example.md`
- `kiro-agent-research-notes.md`
- `known-limitations.md`
- `narrative-teaser-progress.md`
- `planning-decisions-and-questions.md`
- `quickstart.md`
- `archive/coding-cold-cases-java-stackoverflow.original-2026-05-27.md`

## Root Files Left In Place

- `../../README.md`: informational, but kept at the repository root as the GitHub/project entrypoint.
- `../../coding-cold-cases-java-stackoverflow.md`: informational source data, but kept at the repository root because the app parser reads this exact file.

## Generated Markdown Not Reorganized

Generated Markdown under `../../cases/index/` and `../../cases/workspaces/` was not reorganized. Those files are run/index artifacts and are ignored by Git.

## Gray Areas

- `../implemented/concept.md`: originally an ideation document, but it is now partially implemented enough to live under `implemented`.
- `../implemented/concept-remediation-plan.md`: still contains acceptance criteria and future-looking language, but several remediation tracks have landed, so it is classified as implemented.
- `../implemented/ui-flow.md`: contains both settled UX decisions and aspirational design notes; the implemented pieces are substantial enough to classify it as implemented.
- `../implemented/hackathon-judge-experience.md`: partly implementation strategy, partly submission framing; Docker-first runtime work has landed, so it is classified as implemented.
- `../ideated/submission-writeup.md`: contains concrete submission content, but screenshots/video/demo packaging are still pending, so it stays ideated.
