# Coding Cold Cases Cracker Concept Remediation Plan

## Purpose

This plan brings the current implementation back into alignment with the original concept in `concept.md`, especially lines 1-41. The target is at least 90% concept fidelity before hackathon submission, with a stretch goal of 100%.

The current app has a working Docker-first execution spine, real case parsing, one closed case, GitHub publishing, Kiro execution, Lark verification, and Groq report generation. That is useful infrastructure, but it does not yet deliver the full product idea:

> unanswered Stack Overflow cold cases are reopened in an investigative console, Lark acts as the forensic testing lab, Kiro acts as the coding investigator, and Groq turns verified evidence into a highly creative case story.

## Important Correction: Lark Workflow Timing

The current implementation does generate `lark/reproduction-workflow.json` and `lark/verification-workflow.json` during run preparation, before Kiro executes.

However, the current implementation does **not** execute Lark before Kiro. The reproduction workflow is also regenerated after GitHub publishing, because the remote workspace URL is not available at initial preparation time.

So the discrepancy is not simply "the reproduction workflow is produced after the fix." The real discrepancy is:

- Lark reproduction evidence is not executed before Kiro repairs the case.
- Kiro does not receive a Lark-generated failing evidence dossier before starting repair.
- The first Lark workflow does not yet function as the forensic lab handoff described in the concept.
- Lark's output is currently used mostly as post-investigation verification, not as an early source of rich failure details.

## Winning Remediation Thesis

The project should make this claim obvious:

> Kiro can investigate and repair a cold case, but Lark makes the evidence admissible.

The user-facing flow should become:

1. Judge opens the Cold Case Desk.
2. Judge selects any cold case from the real Stack Overflow corpus.
3. The system creates a sealed case workspace.
4. Kiro reconstructs a first reproduction attempt.
5. Lark runs the first forensic workflow and produces failing evidence.
6. Kiro receives the Lark evidence and repairs the case.
7. Lark runs verification on the repaired system.
8. Groq writes a creative, evidence-grounded cold case story.
9. The case appears in the Case Closed Gallery with artifacts, logs, replay commands, and Lark verdict.

## Remediation Tracks

### Track 1: Rebuild The Pipeline Around Lark-First Evidence

#### Current Gap

The current pipeline runs Kiro first, then publishes, then invokes both Lark workflows. This makes Lark look like a post-hoc verifier.

#### Target

Use Lark twice in visibly different roles:

- **Lark Forensic Reproduction Lab**: independently confirms or critiques the reproduced failure before repair.
- **Lark Closure Court**: independently verifies the fixed system after repair.

#### Required Changes

- Split the current Kiro step into two phases:
  - `kiro_reconstruction`: build or refine the failing reproduction only.
  - `kiro_repair`: repair after Lark evidence exists.
- Publish the run workspace immediately after initial reproduction artifacts exist.
- Execute `reproduction-workflow.json` before repair.
- Save the first Lark output as:
  - `lark/reproduction-output.md`
  - `lark/reproduction-evidence.json`
  - `logs/lark-reproduction.log`
- Generate a second Kiro prompt from the Lark reproduction evidence:
  - `prompts/kiro-repair-from-lark.md`
- Require Kiro repair to explicitly cite which Lark observations guided the fix.
- Keep the final Lark verification as the only path to `Closed`.

#### Acceptance Criteria

- A run timeline visibly shows:
  `Indexed -> Kiro Reconstruction -> Lark Reproduction Evidence -> Kiro Repair -> Lark Verification -> Case File -> Closed/Partial/Blocked`.
- Kiro repair prompts include Lark reproduction evidence.
- The final case file has a meaningful section called `Lark's First Finding` based on real Lark output, not a placeholder.

### Track 2: Turn Lark "Workflow Logs" Into Real Test Artifacts

#### Current Gap

The concept says Lark provides test coverage expected to fail, then coverage for the fixed system. Current artifacts are workflow payloads and logs, but not clearly saved test files or reusable test harnesses.

#### Target

Lark should generate or validate concrete test assets when possible.

#### Required Changes

- Add a `tests/lark/` artifact folder inside each run workspace.
- Ask Lark reproduction workflow to produce one or more of:
  - failing shell replay script,
  - generated unit/integration test,
  - minimal fixture project,
  - deterministic assertions,
  - failure classifier.
- Store these as files when Lark returns usable content.
- Ask Lark verification workflow to either:
  - run the generated tests against the repaired system, or
  - produce a clear reason why the case is better represented by command-level verification.
- Add artifact paths:
  - `tests/lark/red/`
  - `tests/lark/green/`
  - `lark/test-coverage-summary.md`

#### Acceptance Criteria

- For supported cases, the workspace includes a red test artifact and a green verification artifact.
- If test files cannot be responsibly generated, the case file explains why command replay is the responsible model.
- The TUI can open or print the Lark test artifacts.

### Track 3: Make The Cold Case Desk A Real TUI Product

#### Current Gap

The TUI is functional but plain. It lists/searches cases and can start runs, but it does not yet feel like an investigative desk.

#### Target

The TUI should be the primary product surface, with the web shell acting as a thin theatrical frame around it.

#### Required Changes

- Rework the TUI into three major modes:
  - `Cold Case Menu`
  - `Investigation Console`
  - `Case Closed Gallery`
- Cold Case Menu must support:
  - list all real cases,
  - search by title,
  - search by abstract/excerpt,
  - search by tags,
  - view detail dossier,
  - show previous runs,
  - start reconstruction.
- Case detail dossier must show:
  - title,
  - original URL,
  - tags,
  - posted date if available,
  - score,
  - views,
  - answer count,
  - cold signal,
  - excerpt,
  - risk hints,
  - existing artifacts,
  - available solution story if present.
- Investigation Console must show:
  - live timeline,
  - current status,
  - latest Kiro action,
  - latest Lark finding,
  - artifact paths,
  - replay commands.
- Case Closed Gallery must support:
  - list solution stories by title,
  - search by solution title/subheading,
  - view story,
  - open Lark test artifacts,
  - open code zip,
  - open raw logs,
  - open GitHub artifact link,
  - launch read-only debrief.

#### Acceptance Criteria

- A judge can understand and operate the core product entirely inside the TUI.
- The TUI never appears to hard-code a flagship case.
- Existing solved cases appear as polished gallery entries.

### Track 4: Add Kiro Interactive Handoff And Debriefer Sub-Agent

#### Current Gap

The concept calls for a "Solve Case" transfer into Kiro CLI interactive mode and a read-only Debrief transfer into a Kiro sub-agent. Current behavior is not yet seamless.

#### Target

The browser terminal should feel like an investigative console where Kiro can take over at the right moments.

#### Required Changes

- Add generated Kiro agents:
  - `case-reconstructor`
  - `case-repairer`
  - `case-debriefer`
- Keep `case-debriefer` read-only.
- Add generated steering files for:
  - cold case ethics,
  - evidence discipline,
  - Lark-first verification,
  - no premature closure,
  - narrative artifact boundaries.
- Add TUI actions:
  - `Solve with Kiro`
  - `Repair from Lark Evidence`
  - `Debrief Closed Case`
- Make each action launch the appropriate Kiro command inside the terminal instead of merely printing instructions where possible.
- Continue supporting headless mode for demos and interactive/device-login mode for judges.

#### Acceptance Criteria

- A judge can select a case and enter a primed Kiro session without copying a long command manually.
- Debrief mode cannot edit case artifacts.
- Kiro artifacts demonstrate agents, steering, and tool permissions.

### Track 5: Replace The Groq Report With A Real Creative Case Story

#### Current Gap

The current `case-file.md` is effectively a templated technical report. That does not satisfy the concept. The concept asks for a highly creative narrative: fictionalized detective flavor, possible OP background, epilogue, and story energy, while still grounded in evidence.

The reference standard is `../info/case-closed-example.md`: the story should read like literary technical fiction about a real debugging cold case, not like a generated incident report. It may invent scene texture, character names, mood, and dramatic framing, but the technical sequence must remain faithful to the evidence.

#### Target

Groq should produce a memorable cold case story, not just formatted facts.

#### Required Changes

- Split report generation into distinct outputs:
  - `reports/technical-report.md`: dry technical evidence.
  - `reports/case-file.md`: creative narrative story.
  - `reports/judge-summary.md`: short hackathon-facing summary.
  - `reports/evidence-map.json`: source-to-claim map.
- Rewrite Groq prompts so `case-file.md` is explicitly not allowed to be a templated technical report.
- Require the creative narrative to contain identifiable narrative parts, but not as stiff report headings. The required parts are:
  - opening scene,
  - the original clue,
  - the cold trail,
  - the reconstruction,
  - Lark's first finding,
  - Kiro's intervention,
  - Lark's final verdict,
  - epilogue,
  - confidence and caveats,
  - replay appendix.
- Permit section dividers or named parts where they help readability, but reject outputs that simply fill in report headings with bland paragraphs.
- Require the story to put the reader inside the original developer's problem before the tooling appears.
- Require the technical explanation to emerge through the investigation instead of being dumped as a summary.
- Require Lark and Kiro to appear as forces in the investigation:
  - Kiro as the coding investigator that reconstructs and intervenes,
  - Lark as the forensic lab whose evidence and verdict determine closure.
- Require a brief factual appendix after the story for replay commands and artifact links, so the narrative can stay narrative.
- Require every technical claim in the story to be backed by artifacts listed in `evidence-map.json`.
- Add quality gates:
  - reject reports with only generic headings and no narrative prose,
  - reject reports that read like a templated technical report,
  - reject reports that begin with `Case Summary` or equivalent report language,
  - reject reports that do not establish a scene, character, conflict, and technical mystery within the first several paragraphs,
  - reject reports that fail to mention Lark's first finding,
  - reject reports that blur fiction with technical facts.

#### Acceptance Criteria

- `case-file.md` reads like a compelling cold case story in the spirit of `../info/case-closed-example.md`.
- `technical-report.md` remains sober and replayable.
- `judge-summary.md` is short, persuasive, and directly tied to Lark's value.

### Track 6: Make Lark's Value Impossible To Miss

#### Current Gap

Lark has produced real value, including catching a compatibility issue, but the product does not spotlight this enough.

#### Target

The UI, reports, and demo should repeatedly show that Lark is the forensic authority.

#### Required Changes

- Add a prominent `Lark Finding` panel in the TUI investigation console.
- Add `Lark Verdict` badges:
  - `No Evidence Yet`
  - `Failure Confirmed`
  - `Repair Rejected`
  - `Repair Verified`
  - `Closure Granted`
- Add a `Why Lark mattered` section to each judge summary.
- Preserve failed Lark runs as first-class story events.
- Record exact Lark workflow IDs and execution IDs in visible artifact views.

#### Acceptance Criteria

- A judge can explain Lark's contribution after watching the demo for 30 seconds.
- A case cannot appear as `Closed` unless the TUI shows a Lark verification pass.

### Track 7: Improve The Web Shell And Serious Pixel-Art Identity

#### Current Gap

The web shell is minimal and does not yet embody the serious pixel-art detective aesthetic.

#### Target

The first viewport should signal "Coding Cold Cases Cracker" immediately and frame the terminal as the main experience.

#### Required Changes

- Keep the terminal as the dominant interface.
- Add serious pixel-art visual identity:
  - cold case desk,
  - CRT glow,
  - evidence board,
  - muted forensic palette,
  - no goofy or toy-like styling.
- Add only minimal controls:
  - zoom terminal,
  - increase/decrease margins,
  - font size,
  - open fullscreen terminal.
- Avoid turning the web shell into a separate button-heavy app.

#### Acceptance Criteria

- The web shell looks memorable in screenshots.
- The TUI remains the real app.
- The visual design supports the hackathon story rather than distracting from it.

### Track 8: Expand Solved Case Gallery To 2-3 Real Cases

#### Current Gap

Only one real case is currently closed.

#### Target

The gallery should include 2-3 real solved cases from the provided corpus.

#### Required Changes

- Select two additional cases from the corpus with high likelihood of local reproduction.
- Run the full remediated pipeline on each.
- Publish each case workspace to GitHub.
- Ensure each has:
  - Kiro reconstruction,
  - Lark reproduction evidence,
  - Kiro repair,
  - Lark verification,
  - technical report,
  - creative case file,
  - judge summary,
  - zip artifact.

#### Acceptance Criteria

- Gallery contains at least three real cases.
- No fake seed data appears in the gallery.
- Each closed case has replay commands and remote artifacts.

### Track 9: Submission Package

#### Current Gap

The hackathon-facing package is not yet complete.

#### Target

The project should be ready for a judge to run, inspect, and understand quickly.

#### Required Changes

- Finalize docs:
  - `README.md`
  - `../info/quickstart.md`
  - `architecture.md`
  - `lark-integration.md`
  - `../ideated/demo-script.md`
  - `../info/known-limitations.md`
  - `../ideated/next-plans.md`
  - `../ideated/submission-writeup.md`
- Capture screenshots:
  - Cold Case Menu,
  - case detail dossier,
  - Kiro reconstruction running,
  - Lark reproduction evidence,
  - Lark verification verdict,
  - Case Closed Gallery,
  - creative case file.
- Prepare demo video script around one strong case while showing the menu supports all cases.
- Ensure Docker-first judge path works:
  - copy `.env.example`,
  - fill keys,
  - `docker compose up --build`,
  - open app,
  - choose case,
  - inspect gallery.

#### Acceptance Criteria

- A judge with Docker can start the project without host Java, Maven, Node, Kiro, Lark, Groq tooling, Homebrew, or ttyd.
- The submission write-up directly answers the hackathon fields.
- The demo clearly shows Lark-integrated value, not a separate Lark side demo.

## Priority Order

1. Rebuild the pipeline around Lark-first evidence.
2. Replace the Groq case file with a genuinely creative narrative writer.
3. Upgrade the TUI into the Cold Case Desk and Case Closed Gallery.
4. Add Kiro interactive handoff and read-only debriefer.
5. Make Lark test artifacts first-class.
6. Improve the web shell/pixel-art identity.
7. Close two more real cases.
8. Finish submission docs, screenshots, and demo script.

## Immediate Next Implementation Step

Implement the remediated state machine:

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

This is the highest-leverage change because it restores the intended Lark/Kiro relationship and gives the rest of the product real evidence to display.

## Open Risks

- Lark may not always return extractable test files; the system must gracefully store command-level forensic evidence when full test generation is not responsible.
- Kiro interactive terminal handoff may need a small terminal control bridge if ttyd cannot receive commands cleanly from the TUI.
- Creative Groq output must be aggressively grounded to avoid invented technical facts.
- Running 2-3 cases may expose language/runtime gaps beyond Java/Maven/Gradle.
- The web identity work must stay subordinate to the TUI, not become a separate glossy app.

## Definition Of Done

The remediation is complete when:

- Lark executes before Kiro repair and after Kiro repair.
- Kiro repair uses Lark reproduction evidence.
- Lark artifacts are visible and understandable in the TUI.
- The gallery contains at least 2-3 real closed cases.
- `case-file.md` is a creative cold case narrative, not a technical report template.
- A judge can run the project through Docker Compose and understand the Lark-integrated value quickly.
- The final submission package is complete.
