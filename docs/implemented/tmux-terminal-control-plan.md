# Tmux Terminal Control Plan

Updated: 2026-05-27

## Summary

Use `tmux` as the control bridge between the web shell bezel buttons and the visible ttyd terminal session.

The core idea:

- `ttyd` displays a single named tmux session.
- The app sends commands to that same tmux session with `tmux send-keys`.
- The visible terminal and the control API act on the same PTY state.

This avoids brittle iframe keystroke injection and avoids opening a second ttyd WebSocket, which would create a separate terminal session.

## Why Tmux

The ttyd WebSocket protocol can accept arbitrary terminal input, but each WebSocket connection owns its own PTY. A second control WebSocket does not drive the iframe's visible session; it starts another terminal process.

With tmux:

- ttyd is only the display surface.
- tmux owns the persistent terminal session.
- app endpoints can control the same session that ttyd displays.
- reconnecting the browser does not lose the TUI state.

## Target Runtime Shape

Current terminal service:

```bash
ttyd -W -p 7681 -t titleFixed='Coding Cold Cases Cracker' bash /workspace/scripts/terminal-menu.sh
```

Target terminal service:

```bash
scripts/tmux-terminal-entrypoint.sh
```

The entrypoint will:

1. Ensure a named session exists, default `coldcase`.
2. Start the TUI inside that session if it is not already running.
3. Run ttyd against `tmux attach-session -t coldcase`.

Example:

```bash
tmux new-session -d -s coldcase -c /workspace 'bash /workspace/scripts/terminal-menu.sh'
exec ttyd -W -p 7681 -t titleFixed='Coding Cold Cases Cracker' tmux attach-session -t coldcase
```

## Docker Changes

Install `tmux` in `docker/kiro/Dockerfile`, since the `terminal` service uses that image.

Add:

```dockerfile
RUN apt-get update \
  && apt-get install -y --no-install-recommends tmux \
  && rm -rf /var/lib/apt/lists/*
```

Create:

- `scripts/tmux-terminal-entrypoint.sh`
- `scripts/tmux-send.sh`

Update `docker-compose.yml` terminal command:

```yaml
command:
  - bash
  - -lc
  - set -a; [ -f .env ] && source .env; set +a; exec scripts/tmux-terminal-entrypoint.sh
```

## App API

Add endpoint:

```http
POST /api/terminal/input
```

Request body:

```json
{
  "action": "up"
}
```

Allowed actions:

- `enter`
- `up`
- `down`
- `back`

Optional later:

- `literal`
- `command`

For v1, avoid arbitrary literal commands in the public browser surface. Keep the endpoint allowlisted to navigation keys unless we explicitly add a supervised command box.

## Key Mapping

Use tmux key names:

| UI Action | tmux command |
| --- | --- |
| Enter | `tmux send-keys -t coldcase Enter` |
| Up | `tmux send-keys -t coldcase Up` |
| Down | `tmux send-keys -t coldcase Down` |
| Back | `tmux send-keys -t coldcase Escape` |

If the TUI expects text aliases in some contexts, fallback mappings can be:

| UI Action | fallback text |
| --- | --- |
| Enter | `Enter` key |
| Up | `Up` key |
| Down | `Down` key |
| Back | `esc` + `Enter` |

Prefer real keys first because the TUI already supports raw keypress navigation.

## Web Shell Changes

Change `triggerBezelKey(name)`:

1. Animate the hardware button immediately.
2. Call:

```js
fetch('/api/terminal/input', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: name })
})
```

3. Keep the current parent-page keyboard listener:
   - ArrowUp -> `triggerBezelKey('up')`
   - ArrowDown -> `triggerBezelKey('down')`
   - Enter -> `triggerBezelKey('enter')`
   - Escape -> `triggerBezelKey('back')`

After this change, outside-area keypresses and mouse bezel buttons should affect the visible terminal session.

## Security Guardrails

- Do not expose arbitrary shell command execution from the browser in v1.
- The API should allow only the four navigation actions.
- Validate request method and JSON body.
- Reject unknown actions with `400`.
- Keep control endpoint local to the app; do not add unauthenticated remote deployment assumptions yet.
- If a future command endpoint is needed, gate it behind an explicit supervised mode and write it into the limitations docs.

## Failure Modes

1. `tmux` not installed.
   - Terminal service should fail fast with a clear log.

2. Session already exists but TUI process died.
   - Entry point can detect with `tmux has-session`.
   - If the session exists, do not blindly restart it; attach to preserve state.
   - Add a future reset endpoint if needed.

3. Browser reconnect creates multiple ttyd clients.
   - They attach to the same tmux session.
   - This is acceptable for local/demo usage.

4. TUI is in text input mode.
   - Up/Down/Enter/Escape will be sent as real terminal keys.
   - This matches normal terminal behavior.

5. Focus ambiguity.
   - If the iframe has focus, direct keyboard input still goes straight to ttyd.
   - If the parent shell has focus, the parent sends the key through the API to tmux.

## Test Plan

### Build/Runtime

```bash
docker compose build terminal
docker compose up -d terminal app
```

Verify:

```bash
docker compose exec terminal tmux has-session -t coldcase
docker compose exec terminal tmux list-sessions
```

### Manual Terminal Test

Open:

```text
http://localhost:3001
```

Then:

1. Go to Desk.
2. Click the lower-left Down button.
3. Confirm the selected TUI row moves down.
4. Click Up.
5. Confirm the selected row moves up.
6. Click Enter.
7. Confirm the highlighted screen opens.
8. Click Back.
9. Confirm the TUI returns.

### API Test

```bash
curl -X POST http://localhost:3001/api/terminal/input \
  -H 'content-type: application/json' \
  -d '{"action":"down"}'
```

Expected:

- HTTP 200
- TUI selection moves down in the visible terminal.

### Regression

```bash
npm run check
npm run smoke
docker compose config
```

## Implementation Order

1. Add tmux to terminal image.
2. Add `scripts/tmux-terminal-entrypoint.sh`.
3. Add `scripts/tmux-send.sh`.
4. Update Docker Compose terminal command.
5. Add `/api/terminal/input`.
6. Wire bezel buttons and parent key handler to the endpoint.
7. Rebuild/restart terminal and app.
8. Verify visible session control.

## Open Questions

- Should there be a visible `Reset terminal session` option under Options?
- Should app startup expose tmux session health in `/api/status`?
- Should multiple browser tabs share the same terminal session, or should later versions create per-user sessions?
