# User Summary — SO #14456547

## What happened

In 2013, Pete posted a Jersey multipart unit-testing question that never got a working answer. His test constructed a `MultiPart` exactly like the client code did — and then crashed with `[B cannot be cast to BodyPartEntity` the moment the production service tried to read it. A fallback attempt with `getEntityAs` threw `IllegalStateException: Entity instance does not contain the unconverted content`. Nine upvotes, one zero-scored answer, thirteen years of silence.

## What the investigation found

The root cause is a client/server object-state mismatch. When you build a `MultiPart` in-process, each `BodyPart` holds the raw Java object you gave it — here a `byte[]`. On a real server, Jersey's `MessageBodyReader` deserialises the HTTP wire bytes and replaces that raw object with a `BodyPartEntity` wrapping an `InputStream`. Pete's unit test bypassed the entire HTTP layer, so the transformation never happened. Both of his access patterns — direct cast and `getEntityAs` — require the post-deserialization object state that only exists after the wire round-trip.

The fix is to simulate that round-trip in the test: serialize the `MultiPart` to bytes via `MultiPartWriter`, then deserialize via `MultiPartReader`, so the entity arrives in the shape the server actually sees.

## Reproduction

The investigation produced a minimal Maven project (`repro/`) with Jersey 1.19.4 and JUnit 4.13.2 that reproduces both exceptions verbatim:

```
cd repro && mvn test
```

Both `ClassCastException` and `IllegalStateException` surface as raw test errors, matching Pete's original report exactly.

## Why Lark mattered — and why the case is Partial

Lark was the independent forensic validator that would have confirmed the reproduction and granted formal closure. All three Lark execution attempts failed with an infrastructure-side invocation-limit error unrelated to the code. The reproduction itself is correct and deterministic. The case is marked **Partial** because Lark verification did not complete — not because the diagnosis is in doubt.
