# Hackathon Project Idea: Coding Cold Cases Cracker

## Introduction

StackOverflow has many unanswered questions that have been sitting for years. This could be due to many reasons - the question might be too complex, too niche, or too outdated. The answer just might not have been available at the time. 

This project aims to identify and solve these "cold cases" by using AI to analyze the questions and provide solutions. This may seem paradoxical: Some AI systems were trained on StackOverflow answers, but would they know how to answer the questions that have puzzled even experienced human developers?

## Process concept

Select a cold case --> Use a Coding AI to reproduce the original setup, with bugs, errors, and all --> Use Lark to provide test coverage (tests are expected to fail due to the bug) --> The Coding AI works to fix the bugs, and make the tests pass --> Use Lark to generate test coverage for the newly fixed system --> Lark and Coding AI summarize their results in logs and documentation (Markdown file) --> A Writer AI weaves all the facts and information into a narrative and interesting cold case story (maybe even with background story of the OP, maybe an epilogue depicting the OP as satisfied and happy [or maybe frustrated in some cases -- depends on the contrived OP personality], maybe an imagined Internet breaking news story, etc)

Ideally, the first Lark test workflow step would provide rich details to the coding AI for it to solve the bug. Wherever/whenever we can, let's find a way to attribute the win to the Lark results.

## Proposed Tech Stack

- Lark - testing workflow
- Groq - inference API for the Writer AI
- Kiro CLI - coding AI. Must utilize as many Kiro CLI features as possible, for high quality results. E.g. Skills, knowledge base, agents/sub-agents, steering, MCP, etc.
- ttyd - web-based access to the Kiro TUI
- Node.js - scripts for supporting functions, intended to be executed in the terminal
- Next.js - optional decorative UI around ttyd. Initial idea: pixel art of a detective in a trench coat looking at a CRT monitor and typing on a mechanical keyboard
- Java 21 (language & VM) - for compiling and running the code, since the initial set of cold cases are Java-based
- Docker and docker-compose - to install and run images, services, and dependencies needed by the stack.

### Node.js Supporting Functions
- Cold Case Menu (TUI)
  - List available cold cases
  - Search for cold case by title or abstract 
  - View cold case details 
    - If a solution is available, provide a "link" to view the solution
    - A "Solve Case" link -> upon selection, transfers over to Kiro CLI by prompting it the selected cold case in interactive mode 
- Case Closed Gallery (TUI)
  - List available solution stories by title
  - Search for solution story by title or sub-heading
  - View solution story details 
    - Open Lark test artifacts
    - Open Code artifacts (as zip file)
    - Open raw logs
    - A "Debrief" link -> upon selection, transfers over to Kiro CLI debriefer sub-agent, with read-only tools only

## Expanded Product Thesis

Coding Cold Cases Cracker should not be "an AI answers Stack Overflow questions." That would be too easy to dismiss, and it would not make Lark central enough for the hackathon.

The sharper product thesis is:

> Old unanswered programming questions are unsolved incident reports. Coding Cold Cases Cracker turns each one into a reproducible lab case, uses Lark to generate and run forensic tests, lets a coding agent attempt a fix, then uses Lark again as the independent verifier that the case is truly closed.

The emotional hook is detective work. The technical hook is reproducibility. The Lark hook is evidence.

This reframes cold Stack Overflow questions as a public backlog of unresolved developer pain. The product does not merely produce prose answers; it produces:

- a reconstructed minimal project
- failing evidence that captures the original complaint
- an investigated root cause
- a fixed implementation or configuration
- passing Lark verification
- a case report that can be read by humans and replayed by machines

## Why This Could Win the Lark Hackathon

This concept is stronger than a generic bot because it uses Lark in a role that is easy to understand and hard to fake:

- Lark is the forensic lab that validates the reproduction.
- Lark creates or runs tests before the fix, proving the case is real.
- Lark creates or runs tests after the fix, proving the solution did not merely sound plausible.
- Lark artifacts become the receipts: logs, screenshots/videos where relevant, generated scripts, and terminal evidence.
- The coding AI gets credit for investigation and repair, but Lark gets credit for turning the story into objective pass/fail evidence.

The differentiator to emphasize in the submission:

> AI can confidently explain a bug. Lark can make that explanation stand trial.

## Core User Experience

The app should feel like opening a case board rather than filling out a form.

Primary flow:

1. The user opens the Cold Case Desk.
2. The user selects a Stack Overflow cold case from the provided Java shortlist.
3. The app shows a Case File:
   - original question link
   - posted date, score, views, tags, answer status
   - why this is a cold case
   - suspected reproduction strategy
   - environmental difficulty
   - expected Lark evidence
4. The user starts `Crack Case`.
5. The system creates an isolated case workspace.
6. Kiro reconstructs the reported setup as code, config, tests, fixtures, or Docker services.
7. Lark runs the first forensic workflow against the reconstructed case.
8. The first Lark run should fail or produce diagnostic evidence that matches the original Stack Overflow complaint.
9. Kiro uses the failing evidence to investigate and implement a fix.
10. Lark runs verification workflows against the fixed case.
11. The case is marked:
    - `Closed`: original failure reproduced and fixed with passing Lark verification
    - `Partially Closed`: explanation and partial reproduction exist, but verification is incomplete
    - `Uncracked`: environment, missing proprietary dependency, or ambiguity prevented a responsible answer
12. The gallery shows the final case story, artifacts, raw logs, and replay commands.

Important product choice:

The manual button should not be the story. Buttons may start phases, but the product should present an automated case pipeline with visible stages. The user should feel they are supervising a lab run, not manually stitching together unrelated tools.

## Case Lifecycle

Each case should move through explicit states:

- `indexed`: parsed from the cold-case Markdown source
- `triaged`: scored for feasibility and expected impact
- `selected`: chosen by the user or default demo
- `workspace_created`: isolated directory, metadata, and baseline files exist
- `reconstruction_started`: Kiro has begun creating a runnable project
- `reproduction_ready`: there is enough code/config to run the original scenario
- `lark_repro_running`: Lark is running the reproduction workflow
- `reproduced`: Lark observed the expected failure, error, or behavioral mismatch
- `repair_started`: Kiro is attempting the fix
- `repair_ready`: Kiro has produced a candidate solution
- `lark_verification_running`: Lark is validating the repaired case
- `closed`: Lark verification passed
- `partial`: useful evidence exists but closure is incomplete
- `blocked`: case cannot responsibly be reproduced or solved

This lifecycle should be stored in a machine-readable `case-state.json` file in each case workspace.

## Recommended Demo Case Selection

Not every cold case is equally good for a hackathon demo. The best demo case should:

- be old enough to feel like a true cold case
- be concrete enough to reproduce locally
- avoid needing paid/proprietary services
- avoid Android emulator or hardware if possible
- avoid huge enterprise containers unless Docker makes them painless
- produce a crisp failing test before the fix
- produce a satisfying pass after the fix

Best initial candidates from the shortlist:

1. **Maven generate-sources cannot resolve a dependency**
   - Strong demo fit because Maven multi-module dependency resolution is reproducible.
   - Lark can run terminal-based build workflows.
   - The fix can be demonstrated with `mvn generate-sources` and tests.
   - Low external dependency risk.

2. **Docker image creation exception: "This archives contains unclosed entries"**
   - Strong narrative and visible error.
   - Potentially reproducible with docker-java and tar/archive misuse.
   - Risk: may require Docker daemon access and old library behavior.

3. **JPA with Hibernate 5: programmatically create EntityManagerFactory**
   - Good technical depth.
   - Reproducible with H2 and Maven/Gradle.
   - Risk: more explanation-heavy and less visually dramatic.

4. **JPA 2.1 NamedSubgraph in Hibernate ignoring nested subgraphs**
   - Good "detective" bug because expected query behavior can be asserted.
   - Risk: ORM version details may consume time.

5. **How to Unit Test handling of incoming Jersey MultiPart requests**
   - Good because the answer can be encoded as a test harness.
   - Risk: old Jersey versions and Java compatibility friction.

Suggested first build:

Start with **Maven generate-sources cannot resolve a dependency** because it is likely to produce the cleanest Lark-centered demo: old Stack Overflow issue -> reconstructed multi-module Maven project -> failing lifecycle phase -> Kiro fix -> Lark passes build/test verification.

## Lark Integration Strategy

Lark should be integrated at three levels.

### 1. Case Reproduction Workflow

Generated or provisioned per case:

```text
Open the case workspace. Run the reproduction command. Confirm that the observed failure matches the Stack Overflow cold case. Capture the exact failing command, relevant logs, and the smallest explanation of the mismatch between expected and actual behavior.
```

For terminal/build cases, the workflow can focus on CLI output instead of browser behavior.

### 2. Repair Verification Workflow

Generated or provisioned after Kiro produces a candidate fix:

```text
Open the repaired case workspace. Run the verification commands. Confirm that the original failure no longer occurs, regression tests pass, and the final project still demonstrates the intended technical lesson.
```

### 3. Evidence Summary Workflow

Optional but valuable:

```text
Read the reproduction logs, fix diff, and verification output. Produce a structured finding: original failure, root cause, fix, why the fix works, and residual risk.
```

This keeps Lark visible as more than a test runner: it becomes an evidence summarizer and quality gate.

## Deterministic vs AI-Driven Lark Use

Use Lark modes deliberately:

- `deterministic` for stable command-based verifications once commands are known, such as `mvn test`, `gradle test`, or a specific Java main class.
- `ai_driven` for early forensic investigation when the case is ambiguous and Lark should inspect logs or choose sensible commands from context.

Recommended lifecycle:

1. First pass: AI-driven forensic workflow to inspect the reconstructed case and describe the failure.
2. After commands stabilize: deterministic verification workflow for repeatable case closure.
3. Final pass: AI-driven evidence narrative workflow that summarizes the result.

## Kiro Integration Strategy

Kiro should be treated as the investigator and repair engineer.

Suggested Kiro roles:

- `case-reconstructor`: builds the smallest runnable project matching the Stack Overflow report.
- `failure-analyst`: reads Lark failure evidence and identifies likely root cause.
- `repair-agent`: edits code/config to fix the reproduced failure.
- `debriefer`: read-only reviewer that writes a final technical explanation and flags weak evidence.

Kiro artifacts should be kept per case:

```text
cases/<case-id>/
  case.json
  original/
  reproduced/
  repaired/
  lark/
    reproduction-workflow.json
    verification-workflow.json
    reproduction-output.log
    verification-output.log
  notes/
    kiro-investigation.md
    lark-findings.md
    final-case-report.md
```

## Architecture

Recommended system layout:

```text
coding-cold-cases-cracker/
  app/ or src/
    case-indexer/
    case-workspace/
    lark/
    kiro/
    writer/
    tui/
  cases/
    <case-id>/
  artifacts/
    gallery/
    zips/
    logs/
  docker/
  docs/
```

Core modules:

- `case-indexer`: parses `coding-cold-cases-java-stackoverflow.md` into structured case metadata.
- `case-scorer`: ranks cases by feasibility, impact, reproducibility, external dependency risk, and expected demo value.
- `workspace-manager`: creates isolated per-case directories and metadata.
- `kiro-bridge`: launches Kiro with a case-specific prompt and workspace.
- `lark-bridge`: validates/provisions/invokes Lark workflows and records results.
- `artifact-registry`: tracks generated code, Lark logs, screenshots/videos, and report files.
- `gallery`: browses solved and partially solved cases.
- `writer`: turns evidence into a narrative without inventing technical facts.

## Data Model

### Case Metadata

```json
{
  "id": "maven-generate-sources-cannot-resolve-dependency",
  "title": "Maven generate-sources cannot resolve a dependency",
  "url": "https://stackoverflow.com/questions/15276976/...",
  "posted": "2013-03-07",
  "score": 10,
  "views": 2573,
  "answers": 0,
  "tags": ["java", "maven", "jaxb2"],
  "cold_signal": "No answers",
  "why_interesting": "...",
  "status": "indexed"
}
```

### Case Run

```json
{
  "case_id": "maven-generate-sources-cannot-resolve-dependency",
  "run_id": "2026-05-26T...",
  "status": "closed",
  "lark_group_id": "wfl_grp_...",
  "lark_workflow_ids": ["wflw_..."],
  "lark_execution_ids": ["wflw_exec_..."],
  "commands": {
    "reproduce": "mvn -pl module-b generate-sources",
    "verify": "mvn test"
  },
  "artifacts": {
    "raw_logs": [],
    "case_report": "notes/final-case-report.md",
    "code_archive": "artifacts/zips/<case-id>.zip"
  }
}
```

## Local Execution Design

The project can be fully local while still using Lark meaningfully:

- The app runs locally.
- Case workspaces are local directories.
- Kiro edits and runs local code.
- Lark is invoked via the CLI for workflow lifecycle and execution evidence.

Important constraint:

If Lark remote execution cannot access local files directly, then terminal/build verification should be represented through one of these approaches:

1. Provide Lark with commands and public repository/archive URLs after packaging the case.
2. Use a public temporary GitHub repository or gist-like artifact for the generated case workspace.
3. Use Lark to validate browser-accessible or hosted case demos where applicable.
4. Use Lark for evidence review over uploaded/pasted logs if direct local execution is unavailable.

The strongest hackathon path is to let Lark execute against a reachable artifact. If remote file access becomes a blocker, the fallback must be honestly documented and the demo should show Lark validating the generated workflow payloads, readiness, and evidence summaries while local commands provide the raw run output.

## UI and Design Direction

The design should avoid a decorative landing page. The first screen should be the working Case Desk.

Suggested layout:

- Left rail: cold case list with filters by tag, age, score, and feasibility.
- Main pane: selected case file with original Stack Overflow facts and reproduction hypothesis.
- Right pane: Case Lab timeline with Kiro and Lark stages.
- Bottom drawer: raw evidence console.
- Gallery tab: closed cases with case reports and artifacts.

Visual style:

- Detective/cold-case theme, but restrained enough to feel like developer tooling.
- Pixel art can be used as an accent, not as the main product surface.
- Use status chips such as `Indexed`, `Reproduced`, `Lark Failed As Expected`, `Kiro Fixing`, `Lark Verified`, `Closed`.
- Avoid making Lark a sidebar afterthought. Lark evidence should be visible in the main timeline.

## Narrative and Writer AI Rules

The writer layer can make the project memorable, but it must not fabricate technical evidence.

Rules:

- It may dramatize section headings and narrative transitions.
- It may not invent OP biography, emotions, or statements unless clearly labeled as fictionalized flavor.
- It must distinguish:
  - original Stack Overflow facts
  - reconstructed assumptions
  - Lark-observed behavior
  - Kiro-generated fix
  - human/operator notes
- It should cite the original Stack Overflow URL.
- It should include exact commands and outcome summaries.
- It should include a "Confidence and Caveats" section.

Recommended report sections:

- Case Summary
- Original Clue
- Reproduction Lab
- Lark's First Finding
- Root Cause
- The Fix
- Lark Verification
- Answer Draft for Stack Overflow
- Confidence and Caveats

## Answer Quality and Ethics

The project should respect Stack Overflow norms.

- Do not auto-post answers.
- Produce an answer draft that a human can review.
- Avoid necroposting weak answers.
- If a question is outdated because the library changed, say so clearly.
- If the modern solution differs from the original-era solution, include both when possible.
- Do not scrape or copy long Stack Overflow content into generated artifacts beyond what is needed for analysis and attribution.
- Include original URLs and metadata.
- Prefer reproducible minimal examples over speculative prose.

## Submission Positioning

Project pitch:

> Coding Cold Cases Cracker revives old unanswered Stack Overflow questions as reproducible engineering investigations. Kiro reconstructs and repairs the case, while Lark acts as the independent forensic lab: creating test workflows, capturing failures, verifying fixes, and preserving the evidence needed to responsibly close the case.

Why it is timely:

- AI coding agents can now investigate old technical questions that were too niche or tedious for humans to revisit.
- The web contains years of unresolved developer pain that can become a benchmark for agentic coding quality.
- The project shows that AI answers need executable evidence, not just confidence.

Why Lark matters:

- Lark provides the verification spine.
- Lark turns "the AI says it works" into "the workflow ran and produced evidence."
- Lark's deterministic workflows make solved cases replayable.
- Lark's AI-driven workflows help inspect ambiguous, legacy, or messy case reconstructions.

## Technical Risks

- Some Stack Overflow cases may depend on old services, deprecated APIs, Android devices, proprietary app servers, or historical library behavior.
- Java 21 is desired, but the local PATH currently reports Java 11. Docker or SDKMAN can provide Java 21 without disturbing the host.
- Lark remote execution may not be able to access arbitrary local workspaces unless they are packaged or exposed.
- Old Maven/Gradle builds may require HTTP repositories that no longer exist.
- Some "cold cases" may actually have good modern answers elsewhere.
- Kiro may solve a simplified version unless the reproduction criteria are strict.
- The writer AI could overdramatize and reduce technical trust if not constrained.

## Mitigations

- Score cases before attempting them.
- Keep the first demo case Maven-based and local-build friendly.
- Use Docker images for Java/Maven/Gradle version control.
- Store every assumption in `case.json`.
- Require a failing reproduction before accepting a fix.
- Require Lark verification before marking a case closed.
- Keep `Partial` and `Blocked` as honest outcomes.
- Generate answer drafts, not automatic posts.

## Minimum Lovable Demo

The smallest demo that feels real:

1. Parse the cold-case Markdown into a searchable case index.
2. Pick one recommended case.
3. Create a per-case workspace.
4. Generate a reconstruction prompt for Kiro.
5. Produce a minimal reproducible Java/Maven project.
6. Create a Lark workflow for the failing reproduction.
7. Run Lark and capture the failure evidence.
8. Let Kiro fix the code/config.
9. Run Lark verification and capture success evidence.
10. Generate a final case report and answer draft.
11. Show the case in a gallery with logs and artifacts.

## Stretch Goals

- Automated Stack Overflow URL freshness check before solving.
- Case difficulty classifier.
- Lark workflow repair loop when deterministic workflows drift.
- GitHub repository export for each solved case.
- Zip download of case artifacts.
- "Cold Case Replay" button that reruns the deterministic Lark verification.
- Multi-agent debate between Kiro investigator and skeptic before final answer.
- Public leaderboard of cases closed, partially closed, and responsibly blocked.

## Open Planning Questions

- Which cold case should be the flagship demo?
- Should we prioritize Java-only cases for the hackathon, or allow other language cases later?
- Should the final answer draft be written in Stack Overflow style, narrative magazine style, or both?
- Should the app create public GitHub repositories for solved case workspaces so Lark can access them?
- Should the first version include ttyd, or is a local TUI plus web gallery enough?
- Should the writer AI use Groq from day one, or should the first pass use deterministic templates and add Groq later?

## Writer AI Provider Update - 2026-05-26

The current implementation uses Kiro CLI headless as the Writer AI instead of Groq.

Reason:

- Groq rate limits made the external writer path unreliable for repeated local regeneration.
- The project already depends on Kiro as a first-class participant, so a focused Kiro writer agent keeps the experience Docker-first and operationally simpler.
- A Kiro writer agent better reinforces the product flow: Kiro reconstructs, Lark verifies, Kiro narrates only from verified evidence.

Implementation direction:

- Generate `.kiro/agents/case-writer.json` for every run.
- Use `kiro-cli chat --no-interactive --agent case-writer --trust-tools=read,write,grep,glob "$(cat prompts/kiro-writer.md)"`.
- Keep the writer agent narrowly scoped:
  - read original, Kiro, Lark, log, and report artifacts;
  - write only `reports/technical-report.md`, `reports/case-file.md`, `reports/user-summary.md`, `reports/evidence-map.json`, and `reports/writer-note.md`;
  - do not modify case source, Lark artifacts, tests, prompts, or case state.
- The case-file narrative should treat the combined Kiro/Lark system as **Larkule Quirot**, a single black-box investigator from the user's point of view.
- When the Stack Exchange API provides the original poster's handle/display name, preserve it in the run metadata and use it in the story instead of inventing a replacement name.
- Validate generated Kiro agents with `kiro-cli agent validate --path <agent-file>` when Kiro CLI is available.
- Preserve the deterministic fallback when Kiro writer output fails quality gates.

This supersedes the earlier open question about Groq for the active implementation. Groq or a local model can still be revisited later as optional alternate writer providers, but they are no longer required for normal usage.
