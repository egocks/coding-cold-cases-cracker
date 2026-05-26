# Planning Decisions and Open Questions

Last updated: 2026-05-26

## Confirmed Decisions

### 1. No Hard-Coded Flagship Case

The app must not force judges into a hand-picked "flagship" case. For development and testing, any case may be chosen pragmatically, but the judge-facing app must let users choose from the cold-case index.

Reason: a forced case would make the app look brittle, hard-coded, or tuned only for one example.

### 2. Broad Case Support Is the Product Goal

The app itself should aim to support all provided cold cases deeply, not merely demo one. The demo video may focus on one case, but it must visibly show that the system can attempt any case from the dataset.

### 3. Permanent GitHub Repository Is Planned

The user created a permanent GitHub repository. The project may create resources or gists there as needed.

Repository:

`https://github.com/egocks/coding-cold-cases-cracker.git`

This is also saved in `.env` as `GITHUB_REPO_URL`.

Recommended repo structure:

```text
coding-cold-cases-cracker/
  README.md
  package.json
  docker-compose.yml
  .env.example
  app/
    tui/
    shell/
    api/
    lib/
      case-indexer/
      case-scorer/
      case-workspace/
      kiro-bridge/
      lark-bridge/
      artifact-registry/
      writer/
  cases/
    index/
      coding-cold-cases-java-stackoverflow.md
      cases.json
    workspaces/
      <case-id>/
        case.json
        original/
        reproduced/
        repaired/
        lark/
        logs/
        reports/
  artifacts/
    gallery/
    zips/
    screenshots/
  docs/
    architecture.md
    demo-script.md
    lark-integration.md
    planning-decisions-and-questions.md
  docker/
    java/
    ttyd/
    runner/
```

If Lark needs remote access to generated workspaces, the app should be able to push a case workspace into this repository under `cases/workspaces/<case-id>/` or create a branch per investigation run.

### 4. Plan for Remote Publishing

The project should be designed to publish generated case workspaces remotely so Lark can run or inspect them from a reachable source.

### 5. Use Maximum Lark Power

The project should take advantage of Lark as much as possible, including running actual code/builds if that is the strongest integration path.

Likely requirements from the user:

- Create the permanent GitHub repo.
- Provide permission for generated case branches, commits, or gists.
- Keep `GETLARK_API_KEY` available.
- Possibly provide any extra Lark/GitHub credentials needed for automated pushes if not already available.

Current expected path:

- Local app creates a case workspace.
- Kiro reconstructs and repairs the case locally.
- The app publishes the workspace to GitHub.
- Lark workflows run against the published workspace using build/test commands.
- Lark execution IDs and logs are stored back in the local artifact registry.

### 6. Primary Experience Is TUI

The primary interface should be a TUI. The web UI should be only a thin aesthetic shell around the TUI, with minimal controls such as zoom, margins, and font size.

### 7. MVP Standard

The MVP requirement is not "smallest technically possible." It is: win the hackathon.

The browser-embedded Kiro terminal via `ttyd` remains a favored direction unless there is strong tangible evidence that it blocks winning and a much more compelling alternative exists.

Hackathon judge experience requirement:

- The app should be fast to install and try.
- Judges should ideally need only Docker Engine / Docker Compose.
- The project should avoid requiring Homebrew, local Java, local Maven, local Kiro, local Node, or manual dependency setup.
- A one-command Docker Compose flow is a major part of making the project feel polished and prize-worthy.

### 8. Design Tone

The visual style should be serious pixel art, not goofy or overly decorative.

### 9. Project Name

The project name stays exactly:

**Coding Cold Cases Cracker**

### 10. Final Story Style

The final story should include fictionalized narrative flavor, while still carrying enough technical detail to make sense as a real solution.

### 11. No Stack Overflow Answer Draft for Now

Do not include a Stack Overflow answer draft as a core deliverable in the first version.

### 12. No Auto-Posting

The project must not auto-post answers to Stack Overflow.

At most, it may optionally provide a bookmarklet to help answer the original Stack Overflow question.

### 13. Use Groq Immediately and Extensively

The writer layer should use Groq immediately, not as a later add-on. The user will provide the Groq API key.

Goal:

- Produce highly creative output.
- Make the final case reports memorable enough for the hackathon.
- Use Groq extensively where it strengthens narrative, synthesis, and presentation.

Constraint:

- Creative output should still preserve technical coherence and case evidence.

### 14. Not Java-Only

The system must not be deliberately pinned to Java.

The current cold-case database happens to contain Java questions, but the architecture should be demonstrably capable of handling other problem types in minimal ways.

Implementation implication:

- Keep language/runtime support pluggable.
- Avoid hard-coded Java assumptions in case metadata, TUI labels, Lark workflow generation, Kiro prompts, and report generation.
- Java can be the first tested path, but not the only modeled path.

### 15. Java 21 Via Docker, With Escape Hatches

Preferred plan: provide Java 21 via Docker.

However, keep alternatives open if Docker-based Java 21 creates friction during implementation. Possible fallback options include SDKMAN, a local JDK install, or case-specific container images.

### 16. Docker If It Satisfies Run Requirements

Cases need to be runnable by:

- Lark, to the extent Lark needs to execute or inspect them
- hackathon judges
- us during development and testing

If Docker satisfies those requirements, Docker is the right default. The implementation should treat Docker as the main reproducibility strategy unless a case demands a different approach.

Updated priority:

Docker is not merely a case-runner convenience. It should become the primary judge-facing distribution path.

Target judge path:

```bash
cp .env.example .env
docker compose up --build
```

Dependencies should live in Docker services/containers wherever possible.

### 17. Minimize Manual Steps; Prefer Primed Interactive Kiro via ttyd

Manual steps should be minimized.

Kiro invocation should include enough parameters and generated configuration to prime it for the selected case:

- `--agent`
- generated agent JSON config
- declared tools
- relevant skills
- knowledge base references
- MCP servers
- case-specific prompt

Preferred UX:

- Kiro runs in interactive mode.
- The interactive Kiro session is accessed through a `ttyd` web page.
- The user supervises, but the handoff should already know the case and task.

Implementation note:

Dockerized `ttyd` should be revisited as the preferred judge-facing path. The earlier host-first concern is still relevant for local development, but hackathon usability matters more.

Revised plan:

- Use Dockerized `ttyd` or a Dockerized Node pseudo-terminal for the judge path.
- Use Kiro headless mode with `KIRO_API_KEY` for reliable container execution.
- Keep interactive Kiro terminal supervision as an experience layer where feasible.
- Do not require judges to install Kiro locally.

### 18. Aggressive Kiro Feature Use, Without Rube Goldberg Complexity

Use Kiro-specific features aggressively enough to help win the hackathon:

- agents
- steering
- skills
- knowledge base
- MCP where useful
- rich prompts and references

But avoid over-engineering the system into a roundabout Rube Goldberg machine. Every Kiro feature should visibly improve investigation quality, automation, demo clarity, or artifact quality.

### 19. Agent Framing Deferred

Whether to visibly frame Kiro and Lark as separate roles, such as investigator and forensics lab, is deferred to a later refinement phase.

### 20. Deterministic Lark Timing Deferred

When exactly to create deterministic Lark workflows is deferred.

Minimum principle:

Implement whatever helps solve the case and demonstrate Lark's usefulness.

### 21. Red-Green Test Philosophy

The important idea is not that Lark itself must fail first. The important idea is the TDD-like loop:

```text
Red -> Green -> Refactor
```

The initial tests should encode the correct expected behavior, not blindly assume the broken starting code is truth. A reproduced failure is valuable when it demonstrates that the reconstructed case violates the correct expectation.

### 22. Strict Closure Rule

The definition of `Closed` should be strict.

To mark a case `Closed`, the system should demonstrate Lark's usefulness and pass Lark verification. This keeps Lark central and prevents weak "AI says it works" outcomes from being treated as solved cases.

### 23. Partial Outcomes Deferred

How to present `Partial` outcomes is deferred to refinement.

Temporary working principle:

- Define functioning/working loosely enough to keep progress moving.
- But the result should at least appear capable of winning the hackathon.

### 24. Include Stack Overflow Text As Is

The user will handle any content or copyright scrubbing manually.

Do not overreach into this responsibility. Do not censor source content as though the assistant has that authority.

Implementation rule:

- Include original Stack Overflow text as-is when available.
- Preserve full context for technical solving.

### 25. Kiro May Browse Original Stack Overflow Pages

The Kiro CLI agent should be given fetch and search tools. It may browse the original Stack Overflow page as it deems necessary.

Implementation implication:

- Kiro agent configs should include web fetch/search capabilities where available.
- Case prompts should include the original Stack Overflow URL.
- Browsing is not a separate manual research chore; it is part of the agent's investigative toolkit.

### 26. Freshness Check Deferred

Whether to check if a question has since been answered is deferred.

Current assumption:

The provided test data has already been selected primarily because the questions are truly unanswered.

### 27. Historical vs Modern Answers Deferred

Whether solved cases should include both original-era and modern-solution sections is deferred.

Minimum principle:

The solution must demonstrably solve the problem at hand, with flexibility on how it is solved.

### 28. No Pre-Solve Case Scorer Needed for Selection

The cases have already been selected and scored as fitting the cold-case description in `coding-cold-cases-java-stackoverflow.md`.

Therefore, the app does not need a case scorer whose purpose is to justify picking a flagship case.

The user/judge should choose the next cold case from the TUI menu.

Possible reduced role for scoring:

- sorting
- filtering
- estimating difficulty
- warning about expected environment complexity

But it should not undermine the premise that the provided cases are already valid cold cases.

### 29. Lark Output Should Be Visible, Beautified Only When Useful

The power of Lark should be apparent without hiding or over-polishing its output.

Default:

- show raw Lark output prominently

If raw output is not helpful enough for a hackathon-winning experience:

- beautify it with user-friendly logs
- keep expandable raw output available
- do not cover up Lark's actual behavior

### 30. Zip Artifacts On Demand

Generated code artifacts should be zipped on demand for now, not automatically every time.

### 31. Gallery Should Contain 2-3 Real Solved Cases

The gallery should include 2-3 solved cases.

Do not use fake seed entries. With more than 100 cases provided, solve real cases and populate the gallery from real outputs.

### 32. Keep Launch Radar As Is

Do not delete or archive the previous Launch Radar project right now.

The new project will live under:

`coding-cold-cases-cracker/`

### 33. Submission Positioning: Support Incident Reproduction

The hackathon submission should emphasize:

**support incident reproduction**

This frames old unanswered Stack Overflow questions as unresolved support incidents that can be reconstructed, tested, repaired, verified, and documented.

### 34. Documentation Discipline

Preserve all planning, blockers, and next steps in Markdown files under:

`coding-cold-cases-cracker/docs/`

### 35. Real Lark Resource Creation Approved

The project may create real Lark resources.

Recommended naming prefix:

`Coding Cold Cases - Hackathon - ...`

## Open Questions Queue

All initial planning questions have been answered or explicitly deferred.

Deferred items:

- Q19 agent-role framing
- Q20 deterministic Lark timing
- Q23 partial outcome presentation
- Q26 freshness checks
- Q27 historical vs modern solution sections
