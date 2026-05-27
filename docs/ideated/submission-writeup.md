# Hackathon Submission Write-Up

## What's Your Project Called

Coding Cold Cases Cracker

## Here's the Elevator Pitch

Coding Cold Cases Cracker revives old unanswered Stack Overflow questions as reproducible support incident investigations. Kiro reconstructs and repairs the case, Lark acts as the independent forensic lab that verifies the evidence, and a focused Kiro writer turns the verified artifacts into a memorable case file.

## Created By

Eliel Goco

## Here's the Whole Story

The web has years of unresolved developer pain sitting in old unanswered programming questions. Many are not simple Q&A gaps; they are miniature incident reports with environment details, logs, and a real person blocked by a problem.

Coding Cold Cases Cracker turns those cold cases into replayable engineering labs. A user opens the Dockerized terminal desk, selects any case from the provided database, and starts an investigation. Kiro first builds the smallest responsible failing reproduction and stops. Lark then acts as the forensic lab, producing reproduction evidence that becomes Kiro's repair handoff. Kiro fixes only what that evidence justifies. Lark returns for final verification and decides whether the case can be closed. A dedicated Kiro writer writes the final story only from the collected evidence.

The central idea is simple: AI can explain a bug, but Lark makes the explanation stand trial.

## It's Built With

- Lark CLI
- Kiro CLI
- Kiro CLI custom agents
- Docker Compose
- ttyd
- Node.js
- Java 21
- Maven
- Gradle
- GitHub publishing

## Image Gallery

Screenshots to capture:

- terminal case picker
- selected case file
- Kiro reconstruction prompt
- Lark reproduction evidence
- Kiro repair prompt from Lark evidence
- Lark verification verdict
- closed case gallery
- final case file

## Try It Out

Repository:

https://github.com/egocks/coding-cold-cases-cracker.git

Local run:

```bash
cp .env.example .env
docker compose up --build
```

## Video Demo

The demo should focus on one strong case while showing that the TUI can select any case from the database.
