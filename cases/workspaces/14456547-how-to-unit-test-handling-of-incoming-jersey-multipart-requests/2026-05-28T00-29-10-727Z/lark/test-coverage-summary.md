# Lark Test Coverage Summary

Lark is asked to produce or validate concrete test/replay artifacts whenever responsible. Some old Stack Overflow cases are better represented by command-level forensic replay than by a synthetic unit test.

## Red Reproduction Replay

```bash
cd repro && mvn test
```

Artifact: `tests/lark/red/replay-reproduction.sh`

## Green Verification Replay

```bash
cd repro && mvn test 2>&1 | grep -E '(ClassCastException|IllegalStateException|Tests run|BUILD)'
```

Artifact: `tests/lark/green/replay-verification.sh`

## Closure Rule

The case can be marked Closed only when Lark verification passes after the repair workspace is published or otherwise inspectable.
