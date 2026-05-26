# Reconstruction Report

## Case
SO #32696237 — JPA with Hibernate 5: programmatically create EntityManagerFactory

## What Was Reconstructed

The question describes a pattern used since Hibernate 4.3 to programmatically build a JPA
`EntityManagerFactory` (with a Hibernate `Interceptor`, no `persistence.xml`, no Spring) by
directly instantiating the internal class `org.hibernate.jpa.internal.EntityManagerFactoryImpl`.

In Hibernate 4.3 the constructor accepted:

```
EntityManagerFactoryImpl(
    PersistenceUnitTransactionType transactionType,
    boolean discardOnClose,
    Class<? extends Interceptor> sessionInterceptorClass,
    Configuration cfg,
    ServiceRegistry serviceRegistry,
    String persistenceUnitName)
```

In Hibernate 5.0 that constructor was replaced with:

```
EntityManagerFactoryImpl(
    String persistenceUnitName,
    SessionFactoryImplementor underlyingFactory,
    MetadataImplementor metadata,
    SettingsImpl settings,
    Map<?, ?> configurationValues)
```

The reproduction (`repro/`) contains:
- `pom.xml` — Maven project pulling in `hibernate-core:5.0.0.Final`,
  `hibernate-entitymanager:5.0.0.Final`, and H2 for an in-memory database.
- `src/main/java/com/example/Item.java` — minimal `@Entity` class.
- `src/main/java/com/example/ReproMain.java` — calls the Hibernate 4.3 constructor
  against Hibernate 5, triggering the compile-time failure.

## Reproduction Command

```
cd repro && mvn compile 2>&1
```

## Failure Log

```
[ERROR] COMPILATION ERROR :
[ERROR] /…/ReproMain.java:[38,36] constructor EntityManagerFactoryImpl in class
  org.hibernate.jpa.internal.EntityManagerFactoryImpl cannot be applied to given types;
  required: java.lang.String,org.hibernate.engine.spi.SessionFactoryImplementor,
            org.hibernate.boot.spi.MetadataImplementor,
            org.hibernate.jpa.boot.internal.SettingsImpl,java.util.Map<?,?>
  found:    javax.persistence.spi.PersistenceUnitTransactionType,boolean,<nulltype>,
            org.hibernate.cfg.Configuration,org.hibernate.service.ServiceRegistry,<nulltype>
  reason: actual and formal argument lists differ in length
[INFO] BUILD FAILURE
```

## Assumptions and Caveats

- **Hibernate 5.0.0.Final** is the earliest Hibernate 5 release; it faithfully represents the
  breaking change described in the question (the constructor was changed between 4.3 and 5.0).
- **Java 11** is used. Java 21 is incompatible with Hibernate 5.0.x (requires newer bytecode
  and API changes); Java 11 is the highest LTS that compiles cleanly against this Hibernate
  version.
- **H2 in-memory database** is used so no external database server is required.
- The failure is a **compile-time error**, not a runtime error. This is the correct failure
  mode: the old constructor simply does not exist in Hibernate 5, so the code cannot compile.
- The `Interceptor` aspect of the question (passing an interceptor) is represented by the
  `null` argument for `sessionInterceptorClass` in the Hibernate 4.3 call signature. The
  deeper problem — that there is no clean public API to attach an interceptor when building
  an `EntityManagerFactory` programmatically — is the open question the SO post asks about.

## Why This Is a Responsible Model of the SO Case

The SO question is precisely about the Hibernate 4.3 hack (`new EntityManagerFactoryImpl(...)`)
breaking in Hibernate 5 due to a constructor signature change. The reproduction:

1. Uses the exact Hibernate 5.0.0.Final artifact that introduced the break.
2. Calls the exact constructor signature that worked in Hibernate 4.3.
3. Produces the exact compiler error that a developer upgrading from Hibernate 4.3 to 5 would
   encounter.
4. Requires no external services, no XML configuration, and no Spring — matching the
   constraints stated in the question.
5. Does not repair the issue; it stops at the failing `mvn compile` step.
