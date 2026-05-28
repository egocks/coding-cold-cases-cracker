# Technical Report — SO #14456547
## How to Unit Test handling of incoming Jersey MultiPart requests

**Status:** Partial — reproduction confirmed locally; Lark forensic validation blocked by external invocation-limit error (not a code defect).

---

## Root Cause

When a `MultiPart` is constructed in-process (as a client would build it for sending), each `BodyPart` stores the raw Java object passed to its constructor directly as its entity. Here that object is `byte[]`.

On the server side, Jersey's `com.sun.jersey.multipart.impl.MultiPartReader` (a `MessageBodyReader<MultiPart>`) deserialises the HTTP wire bytes and wraps each part's content in a `BodyPartEntity` that exposes an `InputStream`. That HTTP serialise-then-parse round-trip never occurs in a plain unit test. The test constructs the `MultiPart` the same way the client does, so the entity is still `byte[]` when the production cast runs.

Two failure modes result:

| Attempt | Code | Exception |
|---|---|---|
| Direct cast | `(BodyPartEntity) bodyPart.getEntity()` | `ClassCastException: class [B cannot be cast to class com.sun.jersey.multipart.BodyPartEntity` |
| `getEntityAs` fallback | `bodyPart.getEntityAs(BodyPartEntity.class)` | `IllegalStateException: Entity instance does not contain the unconverted content` |

`getEntityAs` requires the entity to be stored as raw bytes (the "unconverted" wire form), which is only true after `MessageBodyReader` has parsed the stream. Neither path works when the entity was set as a typed Java object.

---

## Reproduction

**Command:**
```
cd repro && mvn test
```

**Stack:** Jersey 1.19.4 (`jersey-multipart`, `jersey-core`, `jersey-server`), JUnit 4.13.2, Java 11, Maven.

**Key files:**
- `repro/pom.xml`
- `repro/src/main/java/repro/MultiPartReader.java`
- `repro/src/test/java/repro/MultiPartReaderTest.java`

**Observed output (attempt 3, 2026-05-28T00:35:21Z):**
```
[ERROR] Tests run: 2, Failures: 0, Errors: 2, Skipped: 0, Time elapsed: 0.400 s <<< FAILURE!

[ERROR] directCast_throwsClassCastException
java.lang.ClassCastException: class [B cannot be cast to class
  com.sun.jersey.multipart.BodyPartEntity

[ERROR] getEntityAs_throwsIllegalStateException
java.lang.IllegalStateException: Entity instance does not contain
  the unconverted content
    at com.sun.jersey.multipart.BodyPart.getEntityAs(BodyPart.java:298)

[INFO] BUILD FAILURE
```

Both exception messages match Pete's verbatim report.

---

## Fix / Resolution

No repair was applied. The case reached the reproduction stage only. The correct fix (not implemented here) is to perform the HTTP round-trip in the test — serialize the `MultiPart` to bytes via `MultiPartWriter`, then deserialize via `MultiPartReader` — so the entity arrives as a `BodyPartEntity` wrapping an `InputStream`, exactly as it would on the server.

---

## Lark Evidence

Lark forensic validation was attempted three times. All three executions failed with:

```
Invocation limit reached. Please contact support@getlark.ai to increase your limit.
```

This is a Lark-side infrastructure error, not a defect in the reproduction. The reproduction code and failure output are correct and unchanged across all three attempts.

- Lark workflow group: `wfl_grp_MtuxpVJdco7hwfxMsv9Irrv8`
- Final execution ID: `wflw_exec_0DhelB7LxYizOvXsFmS1pNwZ`
- Evidence file: `lark/reproduction-evidence.json`

---

## Caveats

- Jersey 1.19.4 is the last 1.x release on Maven Central; the original question predates it but the failure is version-agnostic.
- `jersey-server` is on the classpath solely to satisfy the `RuntimeDelegate` SPI lookup that `javax.ws.rs.core.MediaType.<clinit>` requires; it is not exercised by the test logic.
- `IOUtils` (Apache Commons IO) and `ImageIO` from the original code were omitted; the failure occurs before any image processing.
- Lark verification did not run; the case cannot be marked Closed.
