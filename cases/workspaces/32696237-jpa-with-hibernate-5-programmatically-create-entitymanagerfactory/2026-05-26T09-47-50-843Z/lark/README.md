# Lark Forensic Workflows

These workflow payloads are generated for Lark CLI. Lark appears twice in the investigation:

1. Reproduction evidence before repair.
2. Verification after repair.

If the workspace must be reachable remotely, publish it to GitHub before invoking Lark.

Suggested manual commands:

```bash
getlark workflow-groups create --name "Coding Cold Cases - Hackathon - 32696237-jpa-with-hibernate-5-programmatically-create-entitymanagerfactory"
getlark workflows create --name "Coding Cold Cases - Hackathon - 32696237-jpa-with-hibernate-5-programmatically-create-entitymanagerfactory - Reproduction" --description "$(jq -r .description lark/reproduction-workflow.json)" --mode ai_driven
getlark workflows create --name "Coding Cold Cases - Hackathon - 32696237-jpa-with-hibernate-5-programmatically-create-entitymanagerfactory - Verification" --description "$(jq -r .description lark/verification-workflow.json)" --mode deterministic
```
