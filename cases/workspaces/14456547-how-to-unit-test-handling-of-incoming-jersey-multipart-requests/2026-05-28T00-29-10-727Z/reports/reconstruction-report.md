# Reconstruction Report

## What Was Reconstructed

A minimal Maven project (`repro/`) that reproduces the two exceptions Pete
described in SO #14456547.  The project contains:

- `repro/pom.xml` — Jersey 1.19.4 (`jersey-multipart`, `jersey-server`) + JUnit 4
- `repro/src/main/java/repro/MultiPartReader.java` — the production cast line
- `repro/src/test/java/repro/MultiPartReaderTest.java` — two failing tests

## Reproduction Command

```
cd repro && mvn test
```

Run from the workspace root:

```
cd /workspace/cases/workspaces/14456547-how-to-unit-test-handling-of-incoming-jersey-multipart-requests/2026-05-28T00-29-10-727Z/repro && mvn test
```

## Failure Logs

```
[ERROR] Tests run: 2, Failures: 0, Errors: 2, Skipped: 0

[ERROR] MultiPartReaderTest.directCast_throwsClassCastException:41
  ClassCastException: class [B cannot be cast to class
  com.sun.jersey.multipart.BodyPartEntity

[ERROR] MultiPartReaderTest.getEntityAs_throwsIllegalStateException:62
  IllegalStateException: Entity instance does not contain the unconverted content
```

Full stack traces are in `logs/repro-run.log`.

## Root Cause (observed, not repaired)

When a `MultiPart` is constructed in-process (as a client would build it),
each `BodyPart` stores the raw Java object passed to its constructor as its
entity.  Here that object is `byte[]`.

On the server side, Jersey's `MultiPartReader` (`MessageBodyReader<MultiPart>`)
deserialises the HTTP wire bytes and wraps each part's content in a
`BodyPartEntity` that exposes an `InputStream`.  That HTTP round-trip never
happens in a plain unit test, so:

1. `(BodyPartEntity) bodyPart.getEntity()` → `ClassCastException: [B cannot be
   cast to BodyPartEntity` — the entity is still `byte[]`.

2. `bodyPart.getEntityAs(BodyPartEntity.class)` → `IllegalStateException:
   Entity instance does not contain the unconverted content` — `getEntityAs`
   requires the entity to be stored as raw bytes (the "unconverted" wire form),
   which is only the case after the `MessageBodyReader` has parsed the stream.

## Assumptions and Caveats

- The original question used Jersey 1.x (`com.sun.jersey`).  Version 1.19.4
  (the last 1.x release on Maven Central) was chosen as the closest available
  match.
- `jersey-server` was added to the classpath solely to satisfy the
  `RuntimeDelegate` SPI lookup that `javax.ws.rs.core.MediaType.<clinit>`
  requires; it is not used by the test logic itself.
- The original code also used `IOUtils` (Apache Commons IO) and `ImageIO`; both
  were omitted because the failure occurs before any image processing.
- Java 11 source/target was used (compatible with Jersey 1.19.4 and available
  in the environment); the original question predates Java 11 but the failure
  is version-agnostic.

## Why This Is a Responsible Model

- The two exception messages in the reproduction match the two exception
  messages Pete quoted verbatim (`[B cannot be cast to BodyPartEntity` and
  `Entity instance does not contain the unconverted content`).
- The reproduction uses the same Jersey 1.x API (`MultiPart`, `BodyPart`,
  `BodyPartEntity`, `MediaType.APPLICATION_OCTET_STREAM_TYPE`) that Pete's
  code used.
- No repair has been applied; the tests fail as Pete's test failed.
