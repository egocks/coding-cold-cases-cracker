# Maven generate-sources cannot resolve a dependency

## Judge Summary
The case involves a multi-module Maven project that uses JAXB generated sources. The issue arises when the JAXB plugin is added to module B, causing Maven to complain about unable to resolve dependencies.

## Original Clue
The original clue is that the jaxb2-maven-plugin requires all dependencies to be resolved during the generate-sources phase, before module A has been compiled.

## Root Cause
The root cause of the issue is the jaxb2-maven-plugin version 1.3, which bypasses Maven's reactor and tries to resolve dependencies directly from the repository system.

## The Fix
The fix is to upgrade the jaxb2-maven-plugin to version 3.1.0.

## Lark Verification
Lark verification passed, confirming that the original bug is reproduced and the fix is successful.

## Confidence And Caveats
This report is generated from currently available artifacts only. There are no unusual risk hints detected from tags/title.

## Case Status
The case is closed, as Lark verification has passed.
