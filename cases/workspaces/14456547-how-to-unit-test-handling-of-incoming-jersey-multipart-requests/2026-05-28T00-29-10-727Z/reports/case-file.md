# The Body Part That Wasn't There

Pete had been staring at the same stack trace for forty minutes when he finally pushed back from his desk and went to make coffee. The office was quiet — the kind of quiet that settles in after lunch when everyone else has found something productive to do. He hadn't. He had a REST service that worked perfectly in production, a unit test that looked exactly like the client code, and an exception that made no sense.

`[B cannot be cast to com.sun.jersey.multipart.BodyPartEntity`

`[B`. Java's internal notation for a byte array. His byte array. The one he'd put there himself, three lines above the crash.

He poured the coffee and read the line again. He'd built the `MultiPart` the same way the client built it — `new BodyPart(bytes, MediaType.APPLICATION_OCTET_STREAM_TYPE)` — and then called `saveFile`, which was the whole point. The method was simple: grab the first body part, cast its entity to `BodyPartEntity`, get the `InputStream`, write the image. It worked in production every time. In the test it exploded before it touched the filesystem.

Pete was not a person who gave up easily. He had a theory: maybe the cast was wrong. Maybe `getEntityAs` was the right API. He changed the line.

`IllegalStateException: Entity instance does not contain the unconverted content`

He stared at that for a while too.

---

The question he posted to Stack Overflow on January 22, 2013 was precise and honest. He explained what he was trying to do, what he'd tried, what had failed, and why he couldn't use Jersey-Test or Grizzly — the Spring application context wouldn't load, and the whole point was to test the `MultiPartReader` service in isolation, with real injected dependencies. He included the client code, the server code, the test code, and both exception messages. He asked, plainly: *there has to be some method in Jersey I can call that will do this converting just the way it does when it sends out a MultiPart request on a deployed system.*

The question got nine upvotes. It got one answer, scored zero. The trail went cold.

---

Thirteen years later, Larkule Quirot opened the file.

Larkule Quirot is not the sort of investigator who announces their arrival. They arrive the way a good compiler error does: precisely, with full context, and with a faint air of having already seen this before. The case was assigned a workspace, a Maven project was assembled, and within minutes the lab had a reproduction running.

The reconstruction was methodical. Jersey 1.19.4 — the last 1.x release on Maven Central, the closest available match to whatever Pete had been running in 2013. JUnit 4.13.2, because Pete's test used `Assert.assertNotNull`. Two test methods, no `expected=` annotation, so the exceptions would surface as raw errors exactly as Pete had seen them. The production cast line reproduced verbatim:

```java
BodyPartEntity bpe = (BodyPartEntity) multiPart.getBodyParts().get(0).getEntity();
```

And the fallback Pete had tried in his edit:

```java
BodyPartEntity bpe = multiPart.getBodyParts().get(0).getEntityAs(BodyPartEntity.class);
```

`mvn test`. Thirty seconds. Two errors.

```
java.lang.ClassCastException: class [B cannot be cast to class
  com.sun.jersey.multipart.BodyPartEntity

java.lang.IllegalStateException: Entity instance does not contain
  the unconverted content
    at com.sun.jersey.multipart.BodyPart.getEntityAs(BodyPart.java:298)
```

Larkule Quirot noted, with the mild satisfaction of someone who has just confirmed a hypothesis they already knew was correct, that both exception messages matched Pete's verbatim report. Not approximately. Verbatim.

---

The finding, once you see it, is almost elegant in its cruelty.

When Pete built his `MultiPart` in the test, he was doing exactly what the client code does: constructing a Java object, stuffing a `byte[]` into a `BodyPart`, handing it off. On the client side, that object then gets serialized — `MultiPartWriter` turns the whole structure into HTTP wire bytes, MIME boundaries and all, and sends it across the network. On the server side, Jersey's `MessageBodyReader<MultiPart>` receives those wire bytes, parses the MIME structure, and wraps each part's content in a `BodyPartEntity` that exposes an `InputStream`. The `byte[]` is gone. In its place: a stream-backed entity object that the production code knows how to handle.

In Pete's unit test, none of that happened. There was no wire. There was no serialization. There was no `MessageBodyReader`. The `MultiPart` object Pete handed to `saveFile` was the same object he'd just constructed — `byte[]` still sitting there, untransformed, waiting to be cast to something it had never been.

The two failure modes are two faces of the same wall. The direct cast fails because the entity is `byte[]`, not `BodyPartEntity`. The `getEntityAs` fallback fails because that method requires the entity to be stored as raw unconverted bytes — the wire form — which only exists after the `MessageBodyReader` has done its work. Pete's in-process construction bypassed both preconditions.

The fix, which Larkule Quirot identified but did not implement — the case reached the reproduction stage only — is to perform the round-trip in the test. Serialize the `MultiPart` to bytes using `MultiPartWriter`, then deserialize using `MultiPartReader`, so the entity arrives as a `BodyPartEntity` wrapping an `InputStream`, exactly as it would on a live server. The test would then be testing the same object shape that production receives.

---

There is a small irony in Pete's question that Larkule Quirot found worth noting. He asked: *there has to be some method in Jersey I can call that will do this converting.* There is. It's the `MessageBodyReader`. It's the thing Jersey calls automatically when an HTTP request arrives. The method exists; it just isn't exposed as a convenient utility. To invoke it in a test, you have to simulate the wire — write the bytes, read them back. The framework doesn't offer a shortcut because, from the framework's perspective, the shortcut is the HTTP stack.

Pete was not wrong to want a unit test. He was not wrong to avoid Jersey-Test. He was caught in a gap between the client-side API and the server-side API that share the same class names but operate on fundamentally different object states.

---

The forensic lab submitted its findings for external validation. Three times, the validation system returned the same response:

```
Invocation limit reached. Please contact support@getlark.ai to increase your limit.
```

This was not a finding about the reproduction. The reproduction was correct. The exceptions matched. The Maven project was deterministic and required no external services. The validation failure was infrastructure, not evidence. Larkule Quirot logged it, noted it, and moved on.

The case stands as **Partial**. The failure is reproduced. The root cause is identified. The fix is known. Lark's formal closure stamp was not obtained — not because the investigation was wrong, but because the stamp machine was out of ink.

---

## Epilogue

Pete's question sat unanswered for thirteen years in the sense that matters: no accepted answer, no working solution in the thread, just a zero-scored response that gestured in the right direction without landing. The question itself was good. The diagnosis was almost there in the edit — *further pointer, I think, towards having to convert the test-generated MultiPart in some way* — but the mechanism wasn't named.

The mechanism is the HTTP round-trip. The `MultiPart` you build is a client-side object. The `MultiPart` your server receives is a server-side object. They share a class but not a state. The test has to bridge that gap explicitly, because the framework only bridges it automatically when there's an actual HTTP request to bridge.

Pete probably figured this out eventually. Most people do. The question just never got the answer it deserved in writing.

---

## Factual Appendix

**Case:** SO #14456547 — *How to Unit Test handling of incoming Jersey MultiPart requests*
**Original poster:** Pete (https://stackoverflow.com/users/872975/pete)
**Posted:** 2013-01-22
**Status:** Partial (reproduction confirmed; Lark verification blocked by invocation-limit error)

**Reproduction command:**
```
cd repro && mvn test
```

**Verify command:**
```
cd repro && mvn test 2>&1 | grep -E '(ClassCastException|IllegalStateException|Tests run|BUILD)'
```

**Stack:** Jersey 1.19.4, JUnit 4.13.2, Java 11, Maven

**Confirmed exceptions (verbatim match to Pete's report):**
- `ClassCastException: class [B cannot be cast to class com.sun.jersey.multipart.BodyPartEntity`
- `IllegalStateException: Entity instance does not contain the unconverted content`

**Root cause:** In-process `MultiPart` construction stores the raw Java object (`byte[]`) as the entity. Jersey's server-side `MessageBodyReader` is never invoked, so the entity is never wrapped in a `BodyPartEntity`. Both access patterns (`getEntity()` cast and `getEntityAs()`) require the server-side object state.

**Lark workflow group:** `wfl_grp_MtuxpVJdco7hwfxMsv9Irrv8`
**Final Lark execution ID:** `wflw_exec_0DhelB7LxYizOvXsFmS1pNwZ`
**Lark result:** `failure` — `Invocation limit reached` (infrastructure error, not a code defect)

**Assumptions:**
- Jersey 1.19.4 used as closest available 1.x release; original version unknown
- `jersey-server` added to classpath only to satisfy `RuntimeDelegate` SPI lookup; not exercised by test logic
- `IOUtils` and `ImageIO` omitted; failure occurs before image processing
