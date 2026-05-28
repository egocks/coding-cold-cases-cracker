# Lark Forensic Workflows

These workflow payloads are generated for Lark CLI. Lark appears twice in the investigation:

1. Reproduction evidence before repair.
2. Verification after repair.

If the workspace must be reachable remotely, publish it to GitHub before invoking Lark.

Suggested manual commands:

```bash
getlark workflow-groups create --name "Coding Cold Cases - 31007597-how-to-use-spark-java-api-to-read-binary-file-stream-from-hdfs"
getlark workflows create --name "Coding Cold Cases - 31007597-how-to-use-spark-java-api-to-read-binary-file-stream-from-hdfs - Reproduction" --description "$(jq -r .description lark/reproduction-workflow.json)" --mode ai_driven
getlark workflows create --name "Coding Cold Cases - 31007597-how-to-use-spark-java-api-to-read-binary-file-stream-from-hdfs - Verification" --description "$(jq -r .description lark/verification-workflow.json)" --mode deterministic
```
