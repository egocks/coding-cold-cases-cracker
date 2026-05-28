# Reconstruction Report

## What Was Reconstructed

A minimal Maven project (`repro/`) that reproduces the two exceptions Pete
described in SO #14456547. The project contains:

- `repro/pom.xml` — Jersey 1.19.4 (`jersey-multipart`, `jersey-core`, `jersey-server`) + JUnit 4.13.2
- `repro/src/main/java/repro/MultiPartReader.java` — the production cast line
- `repro/src/test/java/repro/MultiPartReaderTest.java` — two failing tests

## Reproduction Command

```
cd repro && mvn test
```

## Failure Logs (Attempt 3 — 2026-05-28T00:35:21Z)

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running repro.MultiPartReaderTest
[ERROR] Tests run: 2, Failures: 0, Errors: 2, Skipped: 0, Time elapsed: 0.400 s <<< FAILURE!

[ERROR] repro.MultiPartReaderTest.directCast_throwsClassCastException -- Time elapsed: 0 s <<< ERROR!
java.lang.ClassCastException: class [B cannot be cast to class com.sun.jersey.multipart.BodyPartEntity
    at repro.MultiPartReaderTest.directCast_throwsClassCastException(MultiPartReaderTest.java:41)

[ERROR] repro.MultiPartReaderTest.getEntityAs_throwsIllegalStateException -- Time elapsed: 0.172 s <<< ERROR!
java.lang.IllegalStateException: Entity instance does not contain the unconverted content
    at com.sun.jersey.multipart.BodyPart.getEntityAs(BodyPart.java:298)
    at repro.MultiPartReaderTest.getEntityAs_throwsIllegalStateException(MultiPartReaderTest.java:62)

[ERROR] Tests run: 2, Failures: 0, Errors: 2, Skipped: 0
[INFO] BUILD FAILURE
```

## Root Cause (observed, not repaired)

When a `MultiPart` is constructed in-process (as a client would build it),
each `BodyPart` stores the raw Java object passed to its constructor as its
entity — here `byte[]`.

On the server side, Jersey's `MultiPartReader` (`MessageBodyReader<MultiPart>`)
deserialises the HTTP wire bytes and wraps each part's content in a
`BodyPartEntity` that exposes an `InputStream`. That HTTP round-trip never
happens in a plain unit test, so:

1. `(BodyPartEntity) bodyPart.getEntity()` → `ClassCastException: [B cannot be
   cast to BodyPartEntity` — the entity is still `byte[]`.

2. `bodyPart.getEntityAs(BodyPartEntity.class)` → `IllegalStateException:
   Entity instance does not contain the unconverted content` — `getEntityAs`
   requires the entity to be stored as raw bytes (the "unconverted" wire form),
   which is only the case after the `MessageBodyReader` has parsed the stream.

## Assumptions and Caveats

- The original question used Jersey 1.x (`com.sun.jersey`). Version 1.19.4
  (the last 1.x release on Maven Central) was chosen as the closest available
  match.
- `jersey-server` is on the classpath solely to satisfy the `RuntimeDelegate`
  SPI lookup that `javax.ws.rs.core.MediaType.<clinit>` requires; it is not
  used by the test logic itself.
- The original code also used `IOUtils` (Apache Commons IO) and `ImageIO`; both
  were omitted because the failure occurs before any image processing.
- Java 11 source/target was used (compatible with Jersey 1.19.4 and available
  in the environment); the original question predates Java 11 but the failure
  is version-agnostic.

## Note on Lark Attempt 1 and 2 Rejections

Both Lark rejections were caused by a Lark-side invocation limit error
(`Invocation limit reached. Please contact support@getlark.ai`), not by any
defect in the reproduction. The reproduction code and failure output were
correct in all three attempts and are unchanged.

## Why This Is a Responsible Model

- The two exception messages in the reproduction match the two exception
  messages Pete quoted verbatim:
  - `[B cannot be cast to com.sun.jersey.multipart.BodyPartEntity`
  - `Entity instance does not contain the unconverted content`
- The reproduction uses the same Jersey 1.x API (`MultiPart`, `BodyPart`,
  `BodyPartEntity`, `MediaType.APPLICATION_OCTET_STREAM_TYPE`) that Pete's
  code used.
- No repair has been applied; the tests fail exactly as Pete's test failed.
- `mvn test` is deterministic and reproducible with no external services.
