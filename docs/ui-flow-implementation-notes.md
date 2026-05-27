# UI Flow Implementation Notes

Updated: 2026-05-27

## Implemented

- Replaced the dashboard-first web shell with a title page and thin CRT-style terminal frame.
- Added the settled tagline: `Vet > Vibe > Validate` and `Reconstruct the failure, work the fix, prove the close.`
- Added a shared status/action presenter for API and TUI consistency.
- Changed successful Lark verification to produce `Resolution Validated`, not `Case Closed`.
- Added user approval as the only path from `Resolution Validated` to `Case Closed`.
- Changed the Solved Cases Gallery to include only `Case Closed` runs.
- Added the Cold Cases Cabinet, status filters, Case Dossier, Evidence Board, Bulletins, Options, and About surfaces in the TUI.
- Added keyboard Up/Down navigation for the Case Desk, Cold Cases Cabinet, Solved Cases Gallery, and status filter screen.
- Moved runtime readiness from Case Desk to Options.
- Replaced viewport-only clearing with terminal scrollback clearing for screen transitions.
- Fixed the web terminal frame so the iframe sizes after the desk becomes visible.
- Added API fields and endpoints for public status, available actions, evidence, bulletins, and approval.
- Preserved narrative teasers inside new run artifacts.

## Known Limitations

- The web shell's Enter, Up, Down, and Back icon controls are visually present but do not yet send keystrokes into the ttyd iframe. The real terminal now supports keyboard Up/Down navigation once focused.
- `Confer` currently prints or launches the appropriate Kiro command pattern rather than providing a richer embedded conversation manager.

## Verification

- `npm run check`
- `npm run smoke`
- `docker compose config`
- Local API check for `/api/status`, `/api/cases`, `/api/gallery`, and `/api/runs/:runId/approve`
- Browser check in Microsoft Edge at `http://localhost:3100`

## Next Step

Implement a same-origin terminal input bridge or replace ttyd with the Node pseudo-terminal path if iframe keystroke controls become important for the final visual demo.
