# Maven generate-sources cannot resolve a dependency

## Case Summary
This case involves a multi-module Maven project that uses JAXB generated sources. The issue arises when the JAXB plugin is added to module B, causing Maven to complain about unable to resolve dependencies.

## Original Clue
The original clue is that the jaxb2-maven-plugin requires all dependencies to be resolved during the generate-sources phase, before module A has been compiled.

## Reproduction Lab
The reproduction lab involves running the command "cd repro && mvn generate-sources" to reproduce the issue.

## Lark's First Finding
Lark's first finding is that the issue is caused by the jaxb2-maven-plugin version 1.3, which bypasses Maven's reactor and tries to resolve dependencies directly from the repository system.

## Root Cause
The root cause of the issue is the jaxb2-maven-plugin version 1.3.

## The Fix
The fix is to upgrade the jaxb2-maven-plugin to version 3.1.0.

## Lark Verification
Lark verification passed, confirming that the original bug is reproduced and the fix is successful.

## Confidence And Caveats
This report is generated from currently available artifacts only. There are no unusual risk hints detected from tags/title.

## Replay Commands
- Reproduce: cd repro && mvn generate-sources
- Verify: cd repaired && mvn package

## Artifact Links
- Workspace: cases/workspaces/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z
- Remote: https://github.com/egocks/coding-cold-cases-cracker/tree/cold-case/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z/cases/workspaces/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z
