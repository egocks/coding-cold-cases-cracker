# Hackathon Judge Experience

## Priority

Judge setup friction is a first-order product requirement.

The project should feel impressive before the first case is solved:

```bash
cp .env.example .env
docker compose up --build
```

The fewer host dependencies judges need, the stronger the submission feels.

## Target Host Requirements

Required:

- Docker Engine / Docker Desktop
- Docker Compose
- API keys in `.env`

Avoid requiring:

- Homebrew
- local Node.js
- local Java
- local Maven or Gradle
- local Kiro install
- local Lark CLI install
- local `ttyd` install

## Containerized Services

Implemented Compose services:

- `app`: main controller, TUI launcher, API, static shell
- `terminal`: browser terminal using `ttyd` or Node pseudo-terminal
- `kiro-agent`: Kiro CLI installed inside container, using `KIRO_API_KEY` when available or persisted device login otherwise
- `lark-cli`: Lark CLI installed inside container, using `GETLARK_API_KEY`
- `runner`: language/build runtime for case reproduction
- `writer`: Groq story generation, either separate or part of `app`

## Kiro Container Strategy

Official Kiro docs support installing the CLI on Linux and running headless with `KIRO_API_KEY`.

This means the judge path should prefer:

```bash
kiro-cli chat --no-interactive --trust-tools=read,write,shell,grep,glob ...
```

If `KIRO_API_KEY` is blank, the terminal falls back to:

```bash
kiro-cli login
kiro-cli chat --tui --agent case-investigator "<case prompt>"
```

Kiro authentication is persisted in Docker volumes so the device/browser login is a one-time setup per Docker volume.

## Lark Container Strategy

Install `@getlark/cli` inside the app or Lark service container and pass `GETLARK_API_KEY`.

Use Lark for:

- workflow validation
- workflow group creation
- reproduction/verification workflow creation
- execution against GitHub-published case workspaces
- execution evidence storage

## Case Runtime Strategy

Use Docker for language/tool runtimes.

For the first real implementation:

- Java 21 container for Java cases
- later add other runners as needed

For Lark reachability:

- publish case workspace to GitHub
- Lark workflows should clone or inspect the published workspace
- judges can also run the same case workspace locally through Docker

## Risk

Dockerizing Kiro's fully interactive TUI may be harder than Dockerizing headless Kiro.

Mitigation:

- Headless Kiro is the core automation path.
- The web terminal is the experience layer.
- If interactive Kiro inside Docker works cleanly, use it.
- If not, stream headless Kiro logs through the serious pixel-art terminal UI.

## Submission Framing

The demo should emphasize:

> Install Docker, add keys, run one command. The system pulls up a cold-case desk, lets judges pick an unanswered Stack Overflow incident, sends Kiro to reconstruct and repair it, then uses Lark as the verification lab before Groq writes the case file.
