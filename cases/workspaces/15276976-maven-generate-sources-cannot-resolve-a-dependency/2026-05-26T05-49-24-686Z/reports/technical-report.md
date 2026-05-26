# Maven generate-sources cannot resolve a dependency

## Case Summary
This run investigated https://stackoverflow.com/questions/15276976/maven-generate-sources-cannot-resolve-a-dependency as a support incident reproduction case.

## Original Clue
I have a multi-module project in maven which uses JAXB generated sources. Without JAXB everything compiles fine. When I add the JAXB plugin to module B, maven complains: Failed to execute goal on project moduleB: Could not resolve dependencies for project groupId:A:jar:1.7.0: Could not find artifact groupId:A:jar:1.7.0 in thirdparty.

## Reproduction Lab
Status: closed

## Lark's First Finding
Lark found that the issue is caused by the jaxb2-maven-plugin trying to resolve dependencies during the generate-sources phase, before module A has been compiled.

## Root Cause
The root cause of the issue is the jaxb2-maven-plugin version 1.3, which bypasses Maven's reactor and tries to resolve dependencies directly from the repository system.

## The Fix
The fix is to upgrade the jaxb2-maven-plugin to version 3.1.0, which uses the standard Maven artifact resolver and correctly handles in-progress reactor artifacts.

## Lark Verification
Lark verification passed. The verification confirmed that the original bug is reproduced and the fix is successful.

## Confidence And Caveats
This report is generated from currently available artifacts only. There are no unusual risk hints detected from tags/title.

## Replay Commands
- Reproduce: cd repro && mvn generate-sources
- Verify: cd repaired && mvn package

## Artifact Links
- Workspace: cases/workspaces/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z
- Remote: https://github.com/egocks/coding-cold-cases-cracker/tree/cold-case/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z/cases/workspaces/15276976-maven-generate-sources-cannot-resolve-a-dependency/2026-05-26T05-49-24-686Z
