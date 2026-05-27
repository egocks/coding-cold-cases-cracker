# Blockers and Verification Notes

Last updated: 2026-05-26

## Docker Desktop BuildKit I/O Error

While validating the Docker-first foundation, the `app` and `lark-cli` images built successfully, but the local Docker Desktop daemon began returning containerd/BuildKit input/output errors while building the `runner` and `kiro-agent` images.

Observed errors included:

```text
write /var/lib/docker/buildkit/containerd-overlayfs/metadata_v2.db: input/output error
write /var/lib/desktop-containerd/daemon/io.containerd.metadata.v1.bolt/meta.db: input/output error
```

This appears to be local Docker Desktop storage/metadata corruption or instability, not a syntax error in the Dockerfiles.

Verified before the Docker daemon error:

- `docker compose config` succeeded.
- `app` image built successfully.
- `lark-cli` image built successfully and reported Lark CLI `0.5.0`.
- Node and shell syntax checks passed.
- `scripts/kiro-status.sh` correctly reports `interactive-ready` when no `KIRO_API_KEY` is set but Kiro auth is persisted.

Recommended local recovery before the next Docker verification pass:

- Restart Docker Desktop.
- If errors persist, run Docker Desktop's built-in troubleshooting cleanup for build cache or containerd metadata.
- Re-run:

```bash
docker compose build runner
docker compose build kiro-agent terminal
docker compose up
```

## Docker Daemon Hang After Implementation Pass

Updated: 2026-05-26

After adding the real TUI/API/pipeline implementation, Docker was tested again.

Verified before the hang:

- `npm run check` passed.
- `npm run smoke` passed.
- `docker compose config` passed.
- `docker compose config | rg -n "GETLARK|GROQ|KIRO|GITHUB_TOKEN|sk-"` printed nothing, so the current Compose config did not expose obvious secret values.
- Host server/API verification passed on `APP_PORT=3001` because port 3000 was already in use.

Observed blocker:

- `docker compose build app runner` hung without build-step output.
- `docker info --format ...` hung.
- `docker system df` hung.
- These commands had to be killed from the host process list.

Current assessment:

This is a genuine local Docker Desktop daemon/containerd health blocker, not a confirmed project Dockerfile syntax failure. It is consistent with the earlier BuildKit/containerd metadata I/O errors.

Required user-side recovery before Docker verification can continue:

1. Restart Docker Desktop.
2. If Docker commands still hang, use Docker Desktop Troubleshoot to clean/purge builder cache or reset the corrupted containerd/build metadata.
3. Re-run:

```bash
docker info
docker system df
docker compose build app runner
docker compose build kiro-agent terminal lark-cli
docker compose up
```

Resolution update:

- Docker daemon responsiveness is restored.
- `docker info` returned Docker Server `29.4.3` with `overlayfs`.
- `docker system df` returned normally.
- The previous daemon/containerd hang is resolved.
- A separate runner Dockerfile issue was found and fixed by replacing `amazoncorretto:21-alpine` with `maven:3.9.9-eclipse-temurin-21`.
- A heavyweight global Gradle install was removed from the default runner to keep the judge path faster; Gradle cases should use a wrapper or future optional profile.
- Kiro/terminal image build was fixed by removing the unnecessary Ubuntu `npm` package and keeping only `nodejs`.
- Local port 3000 was already allocated, so Compose now supports `HOST_APP_PORT` and `HOST_TERMINAL_PORT`.

Verified after fixes:

```bash
docker compose build app runner
docker compose build kiro-agent terminal lark-cli
HOST_APP_PORT=3001 docker compose up -d
curl http://localhost:3001/api/status
curl -I http://localhost:7681
```

Result:

- `app`, `terminal`, `kiro-agent`, `lark-cli`, and `runner` all started.
- `/api/status` returned `ok: true`, `148` indexed cases, and `20` shortlist cases.
- Kiro status inside Docker reported `interactive-login-required`, which is expected when `KIRO_API_KEY` is blank and no Docker-volume login exists yet.
- ttyd returned `HTTP/1.1 200 OK`.

## Kiro Docker Auth Pending

Updated: 2026-05-26

This is not a blocker, but it is the current required next action for supervised Docker solving.

Observed:

```bash
docker compose exec -T kiro-agent bash -lc 'cd /workspace/cases/workspaces/<case>/<run> && /workspace/scripts/kiro-solve.sh . prompts/kiro-handoff.md'
```

Result:

```text
Kiro mode: interactive-login-required
KIRO_API_KEY is blank and no persisted Kiro login was detected.
```

Expected resolution:

- Set `KIRO_API_KEY` in `.env` for autopilot mode, or
- Open the terminal desk at `http://localhost:7681`, run `kiro-cli login`, complete the device/browser flow, and rerun the case. Docker volumes will persist the login.

Resolution update:

- Kiro Docker login is complete.
- `kiro-cli whoami` succeeds inside the Docker volume.
- The app now reports `persisted-login-ready`.
- The app pipeline can run headless Kiro when persisted Docker login exists, even when `KIRO_API_KEY` is blank.

## GitHub Token Cannot Write Contents

Updated: 2026-05-26

This is a genuine blocker for remote replay and strict `Closed` status.

Observed:

- `GITHUB_TOKEN` is present in `.env`.
- GitHub API authentication succeeds as `egocks`.
- The account can see `egocks/coding-cold-cases-cracker`.
- GitHub API repository metadata reports account-level push/admin rights.
- Git clone of the empty public repository succeeds.

Failing checks:

```text
git push --dry-run origin main
remote: Permission to egocks/coding-cold-cases-cracker.git denied to egocks.
fatal: unable to access 'https://github.com/egocks/coding-cold-cases-cracker.git/': The requested URL returned error: 403
```

```text
PUT /repos/egocks/coding-cold-cases-cracker/contents/README.md
403 Resource not accessible by personal access token
```

Assessment:

The token authenticates, but it does not have repository `Contents: Read and write` permission for `egocks/coding-cold-cases-cracker`, or the repository was not included in the token's selected repository access. The account has rights; the token does not.

Required user-side fix:

1. Open GitHub fine-grained token settings.
2. Edit or regenerate the token used in `.env`.
3. Set repository access to include `egocks/coding-cold-cases-cracker`.
4. Set repository permission `Contents` to `Read and write`.
5. Save/regenerate and update `GITHUB_TOKEN` in `.env` if a new token value is issued.

Validation after fix:

```bash
docker compose exec -T app bash -lc 'set -a; source .env; set +a; node app/cli.js advance-run cases/workspaces/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z'
```

Resolution update:

- GitHub token write permission is fixed.
- GitHub API contents write preflight passed.
- Git push dry-run passed.
- The Maven cold case artifact branch was published:
  `cold-case/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z`
- Lark could clone the branch and verify the case from remote artifacts.

## Lark Deterministic Verification Found Modern Java Compatibility Issue

Updated: 2026-05-26

This was a real verification finding, not a blocker.

Observed:

- Lark reproduced the original dependency-resolution failure.
- Lark's deterministic verification then found the repaired POM failed under modern Java because Maven compiler defaults fell back to source/target 1.5.

Fix applied:

- Added explicit compiler properties to the repaired parent POM:

```xml
<maven.compiler.source>8</maven.compiler.source>
<maven.compiler.target>8</maven.compiler.target>
```

Resolution:

- Local Docker verification passed after the compatibility fix.
- The artifact branch was updated.
- Lark AI verification retry passed against the updated published workspace.
- The case is now legitimately `Closed`.
