# Coding Cold Cases Cracker: Kiro Reconstruction

You are inside an isolated case workspace.

## Cold Case

Title: How to Unit Test handling of incoming Jersey MultiPart requests
URL: https://stackoverflow.com/questions/14456547/how-to-unit-test-handling-of-incoming-jersey-multipart-requests
Original poster exact handle/display name: Pete (https://stackoverflow.com/users/872975/pete)
Posted: 2013-01-22
Score: 9
Views: 5859
Answers: 1
Cold signal: Answers exist; top score 0
Tags: java, rest, testing, jersey, multipart

Preserved excerpt:
We have a REST service that accepts [code] POST requests containing [code] that hold [code] s. Inside the REST service a file might be created based on the provided data.

## Required Reconstruction

1. Read `case.json`, `case-state.json`, and `original/original-question.md`.
2. Browse or fetch the original Stack Overflow page if more detail is needed.
3. Create the smallest runnable failing reproduction in `repro/`.
4. Prefer Java 21, Maven, or Gradle where the case suggests Java build tooling. Use another minimal runtime only if the case demands it.
5. Write the exact reproduction command to `case.json.commands.reproduce`.
6. Run the reproduction command and capture the original failure or a responsible modeled equivalent.
7. Write `reports/reconstruction-report.md` with:
   - what was reconstructed
   - exact reproduction command
   - important failure logs
   - assumptions and caveats
   - why this is a responsible model of the Stack Overflow case

## Hard Stop

Do not repair the case. Lark must inspect the failing reproduction before repair begins.


## Retry Guidance

Lark did not validate the reconstruction package. Reconstruct the failure again using the Lark reproduction evidence and logs as feedback.
