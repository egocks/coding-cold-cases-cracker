# Coding Cold Cases Cracker: Kiro Repair From Lark Evidence

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

## Lark Reproduction Evidence

{
  "phase": "reproduction",
  "passed": false,
  "provisioned": false,
  "transient": false,
  "transient_reason": null,
  "blocked_reason": null,
  "group_id": "wfl_grp_MtuxpVJdco7hwfxMsv9Irrv8",
  "workflow_id": null,
  "execution_ids": [],
  "verdict": "Lark could not be provisioned for this phase.",
  "output_excerpt": "GETLARK_API_KEY is missing. Lark workflows were generated but not provisioned."
}

## Required Repair

1. Read `case.json`, `case-state.json`, `reports/reconstruction-report.md`, and all files under `lark/`.
2. Treat Lark's reproduction evidence as the forensic handoff. Cite the Lark observations that guided each major repair decision.
3. Apply the smallest justified fix in `repaired/` or update the generated project in place with a clear diff.
4. Write the exact verification command to `case.json.commands.verify`.
5. Run verification until it passes, or document why the case remains partial/blocked.
6. Write `reports/technical-report.md` with:
   - Lark observations used
   - reproduced or modeled failure
   - exact commands
   - important logs
   - root cause
   - fix
   - verification result
   - assumptions and caveats

## Closure Rule

Do not claim the case is Closed. Lark verification is the independent forensic gate.
