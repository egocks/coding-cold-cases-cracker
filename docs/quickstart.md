# Quickstart

## Normal Usage

```bash
cp .env.example .env
# Fill GETLARK_API_KEY, GITHUB_TOKEN, and optionally KIRO_API_KEY.
docker compose up --build
```

Open:

- App shell: `http://localhost:3000`
- Terminal desk: `http://localhost:7681`

## Kiro Auth

If `KIRO_API_KEY` is blank, open the terminal desk and run:

```bash
kiro-cli login
```

The Docker volumes persist Kiro auth across restarts.

## Main Flow

1. Open the terminal desk.
2. Browse or search the Cold Case Menu.
3. Select any case dossier.
4. Create a run.
5. Start the pipeline.
6. Watch the Investigation Console:
   `Kiro reconstruction -> Lark reproduction evidence -> Kiro repair -> Lark verification`.
7. Open the Case Closed Gallery and inspect the story, Lark artifacts, logs, replay commands, GitHub URL, and zip.

## Closure Rule

A case is `Closed` only when Lark verification passes. Kiro can reconstruct, repair, and write the case file, but it cannot close a case by itself.
