# Coding Cold Cases Cracker: Kiro Handoff

You are inside an isolated case workspace.

## Cold Case

Title: Maven generate-sources cannot resolve a dependency
URL: https://stackoverflow.com/questions/15276976/maven-generate-sources-cannot-resolve-a-dependency
Posted: 2013-03-07
Score: 10
Views: 2573
Answers: 0
Cold signal: No answers
Tags: java, maven, jaxb2

## Preserved Excerpt

I have a multi-module project in maven which uses JAXB generated sources: [code block] Without JAXB everything compiles fine. When I add the JAXB plugin to module B, maven complains: [code block] As far as I can tell, this is because the jaxb maven plugins...

## Required Investigation

1. Read `case.json`, `case-state.json`, and `original/original-question.md`.
2. Browse or fetch the original Stack Overflow page if more detail is needed beyond the preserved source text.
3. Create the smallest runnable reproduction in `repro/`.
4. Prefer Java 21, Maven, or Gradle where the case suggests Java build tooling. Use another minimal runtime only if the case demands it.
5. Write exact reproduction and verification commands back into `case.json` if you discover them.
6. Run the reproduction command and capture the original failure or a responsible modeled equivalent.
7. Apply the smallest justified fix in `repaired/` or update the generated project in place with a clear diff.
8. Rerun verification until it passes, or document why the case is partial/blocked.
9. Write `reports/technical-report.md` with:
   - reproduced or modeled failure
   - exact commands
   - important logs
   - root cause
   - fix
   - verification result
   - assumptions and caveats

## Closure Rule

Do not claim the case is Closed. Lark verification is the independent forensic gate.
