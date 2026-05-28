# Lark Forensic Workflows

These workflow payloads are generated for Lark CLI. Lark appears twice in the investigation:

1. Reproduction evidence before repair.
2. Verification after repair.

If the workspace must be reachable remotely, publish it to GitHub before invoking Lark.

Suggested manual commands:

```bash
getlark workflow-groups create --name "Coding Cold Cases - 14456547-how-to-unit-test-handling-of-incoming-jersey-multipart-requests"
getlark workflows create --name "Coding Cold Cases - 14456547-how-to-unit-test-handling-of-incoming-jersey-multipart-requests - Reproduction" --description "$(jq -r .description lark/reproduction-workflow.json)" --mode ai_driven
getlark workflows create --name "Coding Cold Cases - 14456547-how-to-unit-test-handling-of-incoming-jersey-multipart-requests - Verification" --description "$(jq -r .description lark/verification-workflow.json)" --mode deterministic
```
