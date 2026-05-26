# Lark Verification

These workflow payloads are generated for Lark CLI. Lark is the closure gate for this case.

If the workspace must be reachable remotely, publish it to GitHub before invoking Lark.

Suggested manual commands:

```bash
getlark workflow-groups create --name "Coding Cold Cases - Hackathon - 15276976-maven-generate-sources-cannot-resolve-a-dependency"
getlark workflows create --name "Coding Cold Cases - Hackathon - 15276976-maven-generate-sources-cannot-resolve-a-dependency - Reproduction" --description "$(jq -r .description lark/reproduction-workflow.json)" --mode ai_driven
getlark workflows create --name "Coding Cold Cases - Hackathon - 15276976-maven-generate-sources-cannot-resolve-a-dependency - Verification" --description "$(jq -r .description lark/verification-workflow.json)" --mode deterministic
```
