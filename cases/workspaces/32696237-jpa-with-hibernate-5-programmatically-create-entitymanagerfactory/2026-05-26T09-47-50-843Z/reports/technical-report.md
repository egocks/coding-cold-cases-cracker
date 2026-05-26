# JPA with Hibernate 5: programmatically create EntityManagerFactory

## Technical Evidence

This run investigated https://stackoverflow.com/questions/32696237/jpa-with-hibernate-5-programmatically-create-entitymanagerfactory as a support incident reproduction case.

Status: partial

## Original Clue

This question is specifically about programmatically creating a JPA [code] backed by Hibernate 5, meaning without configuration xml files and without using Spring . Also, this question is specifically about creating an [code] with a Hibernate Interceptor .

## Reconstruction

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
  `hibernate-entitymanager:5.0.0.Final`, and H2 for an in-memory 

[...truncated for token budget...]

he SO question is precisely about the Hibernate 4.3 hack (`new EntityManagerFactoryImpl(...)`)
breaking in Hibernate 5 due to a constructor signature change. The reproduction:

1. Uses the exact Hibernate 5.0.0.Final artifact that introduced the break.
2. Calls the exact constructor signature that worked in Hibernate 4.3.
3. Produces the exact compiler error that a developer upgrading from Hibernate 4.3 to 5 would
   encounter.
4. Requires no external services, no XML configuration, and no Spring — matching the
   constraints stated in the question.
5. Does not repair the issue; it stops at the failing `mvn compile` step.


## Lark Reproduction Evidence

{
  "phase": "reproduction",
  "passed": false,
  "provisioned": true,
  "group_id": "wfl_grp_eaptHVTBg2oHNwsHagaD0EFp",
  "workflow_id": "wflw_GoFbcl4SQPVgSNrPz9olCJ3l",
  "execution_ids": [
    "wflw_exec_Qe4YtpbALv1KMi9LAKGIoykW"
  ],
  "verdict": "Reproduction evidence not confirmed by Lark.",
  "output_excerpt": "{\n  \"id\": \"wfl_grp_eaptHVTBg2oHNwsHagaD0EFp\",\n  \"name\": \"Coding Cold Cases - Hackathon - 32696237-jpa-with-hibernate-5-programmatically-create-entitymanagerfactory - 2026-05-26T09-47-50-843Z\",\n  \"workflow_count\": 0,\n  \"created_at\": \"2026-05-26T09:50:12.777156+00:00\",\n  \"updated_at\": \"2026-05-26T09:50:12.777156+00:00\"\n}\n\n{\n  \"id\": \"wflw_GoFbcl4SQPVgSNrPz9olCJ3l\",\n  \"name\": \"Coding Cold Cases - Hackathon - JPA with Hibernate 5: programmatically create EntityManagerFactory - Reproduction Evidence\",\n  \"status\": \"active\",\n  \"display_status\": \"never_run\",\n  \"description\": \"You are Lark acting as the forensic reproduction lab for Coding Cold Cases Cracker.\\nRemote wor

[...truncated for token budget...]

mplementor, MetadataImplementor, SettingsImpl, Map<?,?>` |\n\n**Repair Options:**\n1. Use `HibernatePersistenceProvider` + `PersistenceUnitInfo` API\n2. Use Hibernate 5's `EntityManagerFactoryBuilder` bootstrap API\n3. Use `Persistence.createEntityManagerFactory()` with programmatic properties\n\n**Artifacts Created:**\n- `lark/reproduction-output.md` - Full forensic report\n- `lark/reproduction-evidence.json` - Structured evidence for Kiro\nWorkflow wflw_GoFbcl4SQPVgSNrPz9olCJ3l executed successfully. Execution ID: wflw_exec_Qe4YtpbALv1KMi9LAKGIoykW"
}


## Repair

Repair report is pending.

## Lark Verification

Lark verification has not passed.

## Replay Commands

- Reproduce: cd repro && mvn compile 2>&1
- Verify: TO_BE_DISCOVERED_BY_KIRO
