# Coding Cold Cases: Java Stack Overflow Questions

Generated: 2026-05-23T16:00:20.694Z

Scope: Stack Overflow questions tagged `java`, posted from 2008-10-01 through 2015-12-31, excluding closed/locked/migrated questions where that metadata was available. The core source was Stack Exchange API v2.3's `unanswered` and `no-answers` endpoints; after the API began returning rate-limit/bot responses, I supplemented eight entries from Stack Overflow's own Java unanswered listing and web-indexed Stack Overflow question pages.

Selection notes: this is a research dump, not proof that every issue remains unsolved today. I prioritized objective, detailed questions with visible setup/context and cold-case signals: zero answers, or answers present but no accepted or positively scored answer in the captured API data. For the shortlist, I also checked StackPrinter comment threads and excluded posts that appeared to be answered or closed out in comments.

## Shortlist: 20 Top Cold Case Picks

### 1. [How can I parse an inbound message with MTOM attachments under Metro without pulling in all the attachment data?](https://stackoverflow.com/questions/10700340/how-can-i-parse-an-inbound-message-with-mtom-attachments-under-metro-without-pul)

- Posted: 2012-05-22 | Score: 6 | Views: 4,908 | Answers: 0 | No answers
- Tags: `java` `jax-ws` `mtom` `xop`
- Why it is interesting: Using JAX-WS-RI or Metro I can write a WebService using the com. I can choose to get the whole message including the SOAP headers [code block] I can then write something which parses the message and processes accordingly [code block] However part of the...

### 2. [Gradle compile dependency is not added to classpath](https://stackoverflow.com/questions/30529578/gradle-compile-dependency-is-not-added-to-classpath)

- Posted: 2015-05-29 | Score: 25 | Views: 21,505 | Answers: 2 | Answers exist; top score 0
- Tags: `java` `android` `gradle` `android-gradle-plugin`
- Why it is interesting: I've added the reflections framework to my android project. However it wasn't added to the classpath.

### 3. [How to add context.xml file to embedded tomcat server](https://stackoverflow.com/questions/33871335/how-to-add-context-xml-file-to-embedded-tomcat-server)

- Posted: 2015-11-23 | Score: 23 | Views: 15,044 | Answers: 4 | Answers exist; top score 0
- Tags: `java` `spring` `tomcat` `spring-boot` `embedded-tomcat-8`
- Why it is interesting: I'm trying to run my application in an embedded tomcat server using Spring-boot. I'm having my JNDI Resources and Environments configured in an XML file, placed under src/main/webapp/META-INF/context.

### 4. [Excluding .class files from Gradle dependency](https://stackoverflow.com/questions/23677459/excluding-class-files-from-gradle-dependency)

- Posted: 2014-05-15 | Score: 21 | Views: 6,400 | Answers: 1 | Answers exist; top score -1, lowest -1
- Tags: `java` `android` `jar` `gradle` `dependencies`
- Why it is interesting: I'm trying to import https://github. com/Kickflip/kickflip-android-sdk using gradle into my android build and I'm getting : UNEXPECTED TOP-LEVEL EXCEPTION: com.

### 5. [JPA with Hibernate 5: programmatically create EntityManagerFactory](https://stackoverflow.com/questions/32696237/jpa-with-hibernate-5-programmatically-create-entitymanagerfactory)

- Posted: 2015-09-21 | Score: 10 | Views: 7,631 | Answers: 2 | Answers exist; top score 0
- Tags: `java` `hibernate` `jpa` `hibernate-entitymanager` `hibernate-5.x`
- Why it is interesting: This question is specifically about programmatically creating a JPA [code] backed by Hibernate 5, meaning without configuration xml files and without using Spring . Also, this question is specifically about creating an [code] with a Hibernate Interceptor .

### 6. [Avoid duplicates when eager loading from hibernate with shared objects?](https://stackoverflow.com/questions/26919612/avoid-duplicates-when-eager-loading-from-hibernate-with-shared-objects)

- Posted: 2014-11-13 | Score: 0 | Views: 305 | Answers: 0 | No answers
- Tags: `java` `hibernate` `design-patterns` `orm`
- Why it is interesting: A Java command-line app reloads two Hibernate inheritance trees that reference the same shared entity, but eager loading through separate queries produces distinct in-memory object instances.

### 7. [Is it possible to clone a git repository using ssh/git protocol from KIE Drools Workbench](https://stackoverflow.com/questions/26927833/is-it-possible-to-clone-a-git-repository-using-ssh-git-protocol-from-kie-drools)

- Posted: 2014-11-14 | Score: 2 | Views: 896 | Answers: 0 | No answers
- Tags: `java` `git` `drools` `drools-guvnor` `kie`
- Why it is interesting: KIE Drools Workbench can clone a Maven rules module over HTTPS, but git/SSH URLs fail with JGit URI-not-supported errors, raising a concrete protocol-support question.

### 8. [connect android device via MQTT with ssl](https://stackoverflow.com/questions/33696378/connect-android-device-via-mqtt-with-ssl)

- Posted: 2015-11-13 | Score: 9 | Views: 5,460 | Answers: 0 | No answers
- Tags: `java` `android` `ssl` `mqtt` `paho`
- Why it is interesting: I have created an MQTT Broker and a client in java. With a broker server and a client both written in java using paho libs, enabling SSL is easy.

### 9. [Maven generate-sources cannot resolve a dependency](https://stackoverflow.com/questions/15276976/maven-generate-sources-cannot-resolve-a-dependency)

- Posted: 2013-03-07 | Score: 10 | Views: 2,573 | Answers: 0 | No answers
- Tags: `java` `maven` `jaxb2`
- Why it is interesting: I have a multi-module project in maven which uses JAXB generated sources: [code block] Without JAXB everything compiles fine. When I add the JAXB plugin to module B, maven complains: [code block] As far as I can tell, this is because the jaxb maven plugins...

### 10. [Docker image creation exception: "This archives contains unclosed entries"](https://stackoverflow.com/questions/26850266/docker-image-creation-exception-this-archives-contains-unclosed-entries)

- Posted: 2014-11-10 | Score: 13 | Views: 3,575 | Answers: 0 | No answers
- Tags: `java` `docker`
- Why it is interesting: I'm working with Docker and I'm trying to build an image from a dockerfile, using the docker-java API. Here you can find how to do it and I did the same: [code block] But i got this exception: [code block] I thought that the problem was the Dockerfile, but...

### 11. [How to Unit Test handling of incoming Jersey MultiPart requests](https://stackoverflow.com/questions/14456547/how-to-unit-test-handling-of-incoming-jersey-multipart-requests)

- Posted: 2013-01-22 | Score: 9 | Views: 5,859 | Answers: 1 | Answers exist; top score 0
- Tags: `java` `rest` `testing` `jersey` `multipart`
- Why it is interesting: We have a REST service that accepts [code] POST requests containing [code] that hold [code] s. Inside the REST service a file might be created based on the provided data.

### 12. [How to make my Jersey HTTPS client connection persistent?](https://stackoverflow.com/questions/33470297/how-to-make-my-jersey-https-client-connection-persistent)

- Posted: 2015-11-02 | Score: 5 | Views: 1,366 | Answers: 0 | No answers
- Tags: `java` `jersey`
- Why it is interesting: ] Is there a way in Jersey to make an HTTPS client connection persistent? (I am reading that HTTPS connections are persistent, but that is not the behavior I'm seeing with my client.

### 13. [Diagnosing issues with Spring WebSocket user destinations](https://stackoverflow.com/questions/28065489/diagnosing-issues-with-spring-websocket-user-destinations)

- Posted: 2015-01-21 | Score: 7 | Views: 2,153 | Answers: 0 | No answers
- Tags: `java` `spring` `spring-boot` `stomp` `spring-websocket`
- Why it is interesting: I'm having trouble getting user destinations to work with Spring STOMP websockets. I seem to have the general configuration working.

### 14. [Cannot connect to localhost using service:jmx/rmi//..... When Using Visual VM with Tomcat within Vagrant](https://stackoverflow.com/questions/31885618/cannot-connect-to-localhost-using-servicejmx-rmi-when-using-visual-vm-wi)

- Posted: 2015-08-07 | Score: 8 | Views: 9,019 | Answers: 0 | No answers
- Tags: `java` `tomcat` `vagrant` `port` `visualvm`
- Why it is interesting: I've got a vagrant VM which is running tomcat and I wanted to connect VisualVM to monitor the performance of the VM during some tests. I followed this guide to setup this configuration which recommended creating a setenv.

### 15. [Mockito - mock for Context and getApplicationContext()](https://stackoverflow.com/questions/31724445/mockito-mock-for-context-and-getapplicationcontext)

- Posted: 2015-07-30 | Score: 8 | Views: 8,259 | Answers: 0 | No answers
- Tags: `java` `android` `unit-testing` `mockito` `powermock`
- Why it is interesting: Just started creating UTs for my app and using PowerMock, Mockito and Junit4. Im having a very fundamental problem of mocking Context and getApplicationContext().

### 16. [Malformed reply from SOCKS server whereas I use a HTTP proxy (with Apache HTTP library)](https://stackoverflow.com/questions/28881943/malformed-reply-from-socks-server-whereas-i-use-a-http-proxy-with-apache-http-l)

- Posted: 2015-03-05 | Score: 9 | Views: 2,929 | Answers: 0 | No answers
- Tags: `java` `proxy` `apache-httpclient-4.x` `http-proxy`
- Why it is interesting: I know that there are a lot of questions regarding the error [code] which mostly point to a wrong configuration for the proxy. However, in my case, I'm using the system HTTP(!

### 17. [Using Optaplanner to solve VRPTWPD](https://stackoverflow.com/questions/27051034/using-optaplanner-to-solve-vrptwpd)

- Posted: 2014-11-20 | Score: 24 | Views: 2,234 | Answers: 1 | Answers exist; top score 0
- Tags: `java` `drools` `optaplanner`
- Why it is interesting: I'm new to optaplanner, and am hoping to use it to solve the VRPTW problem with pickups and deliveries (VRPTWPD). I started by taking the VRPTW code from the examples repo.

### 18. [Spring SAML signature validation issue](https://stackoverflow.com/questions/31947118/spring-saml-signature-validation-issue)

- Posted: 2015-08-11 | Score: 8 | Views: 4,436 | Answers: 0 | No answers
- Tags: `java` `spring` `spring-security` `saml` `xml-signature`
- Why it is interesting: I'm trying to use the Spring SAML sample app to connect to a Shibboleth IdP but have run into a signature validation issue that I haven't been able to resolve. When the sample app gets the response from the IdP, an exception is thrown with the following:...

### 19. [Java VM fails with heap size increase](https://stackoverflow.com/questions/33365237/java-vm-fails-with-heap-size-increase)

- Posted: 2015-10-27 | Score: 6 | Views: 30,880 | Answers: 0 | No answers
- Tags: `java` `jvm`
- Why it is interesting: S0 the command I am trying to run is; [code block] The machine I am running it on has access to 500G RAM so shouldnt be an issue, however I keep getting this error message; [code block] Has anyone else experienced this issue and if so did you resolve it? Oh...

### 20. [JPA 2.1 NamedSubgraph in Hibernate ignoring nested subgraphs](https://stackoverflow.com/questions/29645613/jpa-2-1-namedsubgraph-in-hibernate-ignoring-nested-subgraphs)

- Posted: 2015-04-15 | Score: 11 | Views: 2,498 | Answers: 0 | No answers
- Tags: `java` `spring` `hibernate` `jpa` `jpa-2.1`
- Why it is interesting: FINAL and have the following model where a Department has many Employees, and an Employee can be a Manager. Manager has a set of Foo which can be either Foo or Bar.

## Dump: 150 Candidate Questions

| # | Question | Posted | Score | Views | Answers | Cold signal | Tags |
|---:|---|---:|---:|---:|---:|---|---|
| 1 | [Using Optaplanner to solve VRPTWPD](https://stackoverflow.com/questions/27051034/using-optaplanner-to-solve-vrptwpd) | 2014-11-20 | 24 | 2234 | 1 | Answers exist; top score 0 | `java` `drools` `optaplanner` |
| 2 | [How can I parse an inbound message with MTOM attachments under Metro without pulling in all the attachment data?](https://stackoverflow.com/questions/10700340/how-can-i-parse-an-inbound-message-with-mtom-attachments-under-metro-without-pul) | 2012-05-22 | 6 | 4908 | 0 | No answers | `java` `jax-ws` `mtom` `xop` |
| 3 | [AEM performance issues (slow memory leak) org.slf4j.helpers.BasicMarker and org.slf4j.helpers.BasicMarkerFactory](https://stackoverflow.com/questions/31524084/aem-performance-issues-slow-memory-leak-org-slf4j-helpers-basicmarker-and-org) | 2015-07-20 | 17 | 2861 | 1 | Answers exist; top score 0 | `java` `performance` `memory-leaks` `slf4j` `aem` |
| 4 | [How to add context.xml file to embedded tomcat server](https://stackoverflow.com/questions/33871335/how-to-add-context-xml-file-to-embedded-tomcat-server) | 2015-11-23 | 23 | 15044 | 4 | Answers exist; top score 0 | `java` `spring` `tomcat` `spring-boot` `embedded-tomcat-8` |
| 5 | [Encoding a pound sign in a java URI](https://stackoverflow.com/questions/12380229/encoding-a-pound-sign-in-a-java-uri) | 2012-09-12 | 8 | 5935 | 1 | Answers exist; top score 0 | `java` `uri` `urlencode` |
| 6 | [Post form via ajax and get a form object in play framework java](https://stackoverflow.com/questions/32044257/post-form-via-ajax-and-get-a-form-object-in-play-framework-java) | 2015-08-17 | 24 | 2616 | 2 | Answers exist; top score 0 | `java` `jquery` `ajax` `forms` `playframework` |
| 7 | [Gradle compile dependency is not added to classpath](https://stackoverflow.com/questions/30529578/gradle-compile-dependency-is-not-added-to-classpath) | 2015-05-29 | 25 | 21505 | 2 | Answers exist; top score 0 | `java` `android` `gradle` `android-gradle-plugin` |
| 8 | [Unexpected results implementing simple motion blur in Libgdx](https://stackoverflow.com/questions/10859567/unexpected-results-implementing-simple-motion-blur-in-libgdx) | 2012-06-02 | 23 | 3166 | 2 | Answers exist; top score 0 | `java` `android` `opengl-es` `libgdx` |
| 9 | [How to use spark Java API to read binary file stream from HDFS?](https://stackoverflow.com/questions/31007597/how-to-use-spark-java-api-to-read-binary-file-stream-from-hdfs) | 2015-06-23 | 19 | 3627 | 2 | Answers exist; top score 0 | `java` `hadoop` `apache-spark` `streaming` |
| 10 | [WebSocket Error during Handshake Unexpected code 200](https://stackoverflow.com/questions/29500133/websocket-error-during-handshake-unexpected-code-200) | 2015-04-07 | 17 | 6791 | 1 | Answers exist; top score 0 | `java` `http` `jakarta-ee` `websocket` `glassfish` |
| 11 | [Maven generate-sources cannot resolve a dependency](https://stackoverflow.com/questions/15276976/maven-generate-sources-cannot-resolve-a-dependency) | 2013-03-07 | 10 | 2573 | 0 | No answers | `java` `maven` `jaxb2` |
| 12 | [connect android device via MQTT with ssl](https://stackoverflow.com/questions/33696378/connect-android-device-via-mqtt-with-ssl) | 2015-11-13 | 9 | 5460 | 0 | No answers | `java` `android` `ssl` `mqtt` `paho` |
| 13 | [Apk Expansion Files - Application Licensing - Developer account - NOT_LICENSED response](https://stackoverflow.com/questions/11930142/apk-expansion-files-application-licensing-developer-account-not-licensed-r) | 2012-08-13 | 17 | 2317 | 1 | Answers exist; top score 0 | `java` `android` |
| 14 | [Jackson @JsonPropertyOrder is ignored](https://stackoverflow.com/questions/33186004/jackson-jsonpropertyorder-is-ignored) | 2015-10-17 | 14 | 25391 | 3 | Answers exist; top score 0 | `java` `json` `jackson` |
| 15 | [Making Android BLE (Bluetooth LE) apprently stable](https://stackoverflow.com/questions/32676758/making-android-ble-bluetooth-le-apprently-stable) | 2015-09-20 | 7 | 829 | 0 | No answers | `java` `android` `bluetooth` `connection` `stability` |
| 16 | [LinearLayout minHeight not working with weigth="1"](https://stackoverflow.com/questions/12763746/linearlayout-minheight-not-working-with-weigth-1) | 2012-10-06 | 20 | 3835 | 3 | Answers exist; top score 0 | `java` `android` `xml` `layout` |
| 17 | [Java Multithreading for IVRS with GSM Modem rxtx (playing voice file making event listener stop working)](https://stackoverflow.com/questions/32338134/java-multithreading-for-ivrs-with-gsm-modem-rxtx-playing-voice-file-making-even) | 2015-09-01 | 15 | 798 | 1 | Answers exist; top score 0 | `java` `multithreading` `audio` `rxtx` |
| 18 | [JPA with Hibernate 5: programmatically create EntityManagerFactory](https://stackoverflow.com/questions/32696237/jpa-with-hibernate-5-programmatically-create-entitymanagerfactory) | 2015-09-21 | 10 | 7631 | 2 | Answers exist; top score 0 | `java` `hibernate` `jpa` `hibernate-entitymanager` `hibernate-5.x` |
| 19 | [GWT Editor Framework for polymorphic types](https://stackoverflow.com/questions/26656370/gwt-editor-framework-for-polymorphic-types) | 2014-10-30 | 11 | 568 | 0 | No answers | `java` `gwt` `gwt-editors` |
| 20 | [Android App Crashed by using texureview](https://stackoverflow.com/questions/27647167/android-app-crashed-by-using-texureview) | 2014-12-25 | 6 | 1185 | 0 | No answers | `java` `android` `opengl-es` |
| 21 | [Is there a documentation on Hibernate's event types?](https://stackoverflow.com/questions/30487257/is-there-a-documentation-on-hibernates-event-types) | 2015-05-27 | 8 | 1009 | 0 | No answers | `java` `hibernate` |
| 22 | [Deserializing Nested objects using RestTemplate](https://stackoverflow.com/questions/14491309/deserializing-nested-objects-using-resttemplate) | 2013-01-23 | 12 | 12074 | 1 | Answers exist; top score 0 | `java` `web-services` `spring` `jackson` `resttemplate` |
| 23 | [Quartz-scheduler DB Lock Exception](https://stackoverflow.com/questions/14953356/quartz-scheduler-db-lock-exception) | 2013-02-19 | 9 | 10564 | 0 | No answers | `java` `quartz-scheduler` `spring-roo` |
| 24 | [Hibernate entity filters with Spring data repositories](https://stackoverflow.com/questions/32205657/hibernate-entity-filters-with-spring-data-repositories) | 2015-08-25 | 12 | 4170 | 0 | No answers | `java` `spring` `hibernate` `jpa` `spring-data` |
| 25 | [Java GC - Understanding TargetSurivorRatio](https://stackoverflow.com/questions/31279000/java-gc-understanding-targetsurivorratio) | 2015-07-07 | 9 | 8602 | 0 | No answers | `java` `garbage-collection` |
| 26 | [Docker image creation exception: "This archives contains unclosed entries"](https://stackoverflow.com/questions/26850266/docker-image-creation-exception-this-archives-contains-unclosed-entries) | 2014-11-10 | 13 | 3575 | 0 | No answers | `java` `docker` |
| 27 | [NoMessageBodyWriterFoundFailure: Could not find MessageBodyWriter for response object](https://stackoverflow.com/questions/34476223/nomessagebodywriterfoundfailure-could-not-find-messagebodywriter-for-response-o) | 2015-12-26 | 11 | 7680 | 0 | No answers | `java` `rest` `jakarta-ee` `jax-rs` `resteasy` |
| 28 | [RabbitMQ Java client - How to sensibly handle exceptions and shutdowns?](https://stackoverflow.com/questions/25262449/rabbitmq-java-client-how-to-sensibly-handle-exceptions-and-shutdowns) | 2014-08-12 | 10 | 7652 | 0 | No answers | `java` `rabbitmq` `amqp` |
| 29 | [Excluding .class files from Gradle dependency](https://stackoverflow.com/questions/23677459/excluding-class-files-from-gradle-dependency) | 2014-05-15 | 21 | 6400 | 1 | Answers exist; top score -1, lowest -1 | `java` `android` `jar` `gradle` `dependencies` |
| 30 | [Android AnalogClock : setting drawables programmatically](https://stackoverflow.com/questions/13897050/android-analogclock-setting-drawables-programmatically) | 2012-12-15 | 23 | 1349 | 1 | Answers exist; top score 0 | `java` `android` `xml` `widget` `clock` |
| 31 | [How to Unit Test handling of incoming Jersey MultiPart requests](https://stackoverflow.com/questions/14456547/how-to-unit-test-handling-of-incoming-jersey-multipart-requests) | 2013-01-22 | 9 | 5859 | 1 | Answers exist; top score 0 | `java` `rest` `testing` `jersey` `multipart` |
| 32 | [New Google Play Services API, Holding connection through activities](https://stackoverflow.com/questions/22715285/new-google-play-services-api-holding-connection-through-activities) | 2014-03-28 | 29 | 479 | 0 | No answers | `java` `android` `google-play-services` |
| 33 | [How to use the Qt Jni class "QAndroidJniObject"](https://stackoverflow.com/questions/22029815/how-to-use-the-qt-jni-class-qandroidjniobject) | 2014-02-26 | 8 | 4751 | 0 | No answers | `java` `android` `c++` `qt` `qandroidjniobject` |
| 34 | [BeanCreationException: Cannot determine embedded database driver class for database type NONE](https://stackoverflow.com/questions/33709849/beancreationexception-cannot-determine-embedded-database-driver-class-for-datab) | 2015-11-14 | 12 | 21128 | 3 | Answers exist; top score 0 | `java` `mysql` `gradle` `spring-data-jpa` |
| 35 | [Java 8 + Maven Javadoc plugin: Error fetching URL](https://stackoverflow.com/questions/29706208/java-8-maven-javadoc-plugin-error-fetching-url) | 2015-04-17 | 7 | 4118 | 0 | No answers | `java` `maven` `java-8` `javadoc` `maven-javadoc-plugin` |
| 36 | [Empty response from server running inside Docker container](https://stackoverflow.com/questions/33655627/empty-response-from-server-running-inside-docker-container) | 2015-11-11 | 10 | 7115 | 0 | No answers | `java` `macos` `docker` |
| 37 | [How to make my Jersey HTTPS client connection persistent?](https://stackoverflow.com/questions/33470297/how-to-make-my-jersey-https-client-connection-persistent) | 2015-11-02 | 5 | 1366 | 0 | No answers | `java` `jersey` |
| 38 | [Disabling JPA Hibernate schema validation for a single entity](https://stackoverflow.com/questions/11669722/disabling-jpa-hibernate-schema-validation-for-a-single-entity) | 2012-07-26 | 10 | 5590 | 3 | Answers exist; top score 0 | `java` `hibernate` `jpa` `hibernate-mapping` |
| 39 | [Setting annotation attribute from properties file](https://stackoverflow.com/questions/9927542/setting-annotation-attribute-from-properties-file) | 2012-03-29 | 9 | 2517 | 0 | No answers | `java` `properties` `annotations` |
| 40 | [JPA 2.1 NamedSubgraph in Hibernate ignoring nested subgraphs](https://stackoverflow.com/questions/29645613/jpa-2-1-namedsubgraph-in-hibernate-ignoring-nested-subgraphs) | 2015-04-15 | 11 | 2498 | 0 | No answers | `java` `spring` `hibernate` `jpa` `jpa-2.1` |
| 41 | [Android Content Provider and Gradle productFlavours](https://stackoverflow.com/questions/27358851/android-content-provider-and-gradle-productflavours) | 2014-12-08 | 12 | 2298 | 0 | No answers | `java` `android` `gradle` `android-contentprovider` `android-productflavors` |
| 42 | [Spring AspectJ fails when double-proxying interface: Could not generate CGLIB subclass of class](https://stackoverflow.com/questions/10377704/spring-aspectj-fails-when-double-proxying-interface-could-not-generate-cglib-su) | 2012-04-30 | 8 | 4806 | 1 | Answers exist; top score 0 | `java` `spring` `aspectj` |
| 43 | [How do I terminate a process normally when created by ProcessBuilder?](https://stackoverflow.com/questions/27942679/how-do-i-terminate-a-process-normally-when-created-by-processbuilder) | 2015-01-14 | 9 | 11809 | 2 | Answers exist; top score 0 | `java` `windows` `processbuilder` `kill-process` |
| 44 | [XML validation against xsd's in Java](https://stackoverflow.com/questions/11687174/xml-validation-against-xsds-in-java) | 2012-07-27 | 8 | 12067 | 1 | Answers exist; top score 0 | `java` `xml` `xsd` |
| 45 | [How to acknowledge websocket (spring websocket + stomp + sockjs) message delivery](https://stackoverflow.com/questions/29230841/how-to-acknowledge-websocket-spring-websocket-stomp-sockjs-message-deliver) | 2015-03-24 | 12 | 2068 | 1 | Answers exist; top score 0 | `java` `spring` `stomp` `sockjs` `spring-websocket` |
| 46 | [Cannot connect to localhost using service:jmx/rmi//..... When Using Visual VM with Tomcat within Vagrant](https://stackoverflow.com/questions/31885618/cannot-connect-to-localhost-using-servicejmx-rmi-when-using-visual-vm-wi) | 2015-08-07 | 8 | 9019 | 0 | No answers | `java` `tomcat` `vagrant` `port` `visualvm` |
| 47 | [Thread BLOCKED on org.apache.log4j.Category.callAppenders, but not waiting for any lock](https://stackoverflow.com/questions/27763111/thread-blocked-on-org-apache-log4j-category-callappenders-but-not-waiting-for-a) | 2015-01-04 | 10 | 8514 | 2 | Answers exist; top score 0 | `java` `multithreading` `log4j` |
| 48 | [BIRT report with two or three-deep nested tables from POJO datasource](https://stackoverflow.com/questions/21698128/birt-report-with-two-or-three-deep-nested-tables-from-pojo-datasource) | 2014-02-11 | 11 | 1811 | 0 | No answers | `java` `eclipse` `nested` `reporting` `birt` |
| 49 | [Mockito - mock for Context and getApplicationContext()](https://stackoverflow.com/questions/31724445/mockito-mock-for-context-and-getapplicationcontext) | 2015-07-30 | 8 | 8259 | 0 | No answers | `java` `android` `unit-testing` `mockito` `powermock` |
| 50 | [H2 database> How to compact / vacuum while running?](https://stackoverflow.com/questions/7544979/h2-database-how-to-compact-vacuum-while-running) | 2011-09-25 | 11 | 7079 | 0 | No answers | `java` `h2` |
| 51 | [JDBC getUpdateCount is returning 0, but 1 row is updated, in SQL Server](https://stackoverflow.com/questions/21757191/jdbc-getupdatecount-is-returning-0-but-1-row-is-updated-in-sql-server) | 2014-02-13 | 16 | 6967 | 2 | Answers exist; top score 0 | `java` `sql-server` `sql-server-2008` `jdbc` `jooq` |
| 52 | [Running JUnit tests with Hadoop 2.2 on Windows 7](https://stackoverflow.com/questions/19999746/running-junit-tests-with-hadoop-2-2-on-windows-7) | 2013-11-15 | 12 | 2981 | 1 | Answers exist; top score 0 | `java` `windows` `hadoop` `junit` |
| 53 | [Malformed reply from SOCKS server whereas I use a HTTP proxy (with Apache HTTP library)](https://stackoverflow.com/questions/28881943/malformed-reply-from-socks-server-whereas-i-use-a-http-proxy-with-apache-http-l) | 2015-03-05 | 9 | 2929 | 0 | No answers | `java` `proxy` `apache-httpclient-4.x` `http-proxy` |
| 54 | [WebDriver getText throws exceptions](https://stackoverflow.com/questions/8817813/webdriver-gettext-throws-exceptions) | 2012-01-11 | 9 | 2704 | 2 | Answers exist; top score 0 | `java` `exception` `selenium` `webdriver` `gettext` |
| 55 | [Adding Spring Security JspTagLib to a Freemarker template - issues with controller unit tests](https://stackoverflow.com/questions/20100276/adding-spring-security-jsptaglib-to-a-freemarker-template-issues-with-controll) | 2013-11-20 | 7 | 2660 | 0 | No answers | `java` `spring` `spring-security` `jsp-tags` `freemarker` |
| 56 | [Spring Security: requires-channel="https" causes redirect loop](https://stackoverflow.com/questions/24022125/spring-security-requires-channel-https-causes-redirect-loop) | 2014-06-03 | 10 | 2656 | 1 | Answers exist; top score 0 | `java` `spring` `ssl` `spring-security` `websphere` |
| 57 | [When to use @Singleton in a Jersey resource](https://stackoverflow.com/questions/2749378/when-to-use-singleton-in-a-jersey-resource) | 2010-05-01 | 10 | 5597 | 2 | Answers exist; top score 0 | `java` `database` `web-services` `jersey` |
| 58 | [How can I set up connection with DVR and decode the data?](https://stackoverflow.com/questions/13037422/how-can-i-set-up-connection-with-dvr-and-decode-the-data) | 2012-10-23 | 9 | 5241 | 0 | No answers | `java` `android` |
| 59 | [Manage Connection Pooling in multi tenant app using Hibernate](https://stackoverflow.com/questions/26968721/manage-connection-pooling-in-multi-tenant-app-using-hibernate) | 2014-11-17 | 6 | 2224 | 0 | No answers | `java` `hibernate` `multi-tenant` `c3p0` |
| 60 | [EJB 3.1 Binding does not work on Websphere Application Server](https://stackoverflow.com/questions/21934427/ejb-3-1-binding-does-not-work-on-websphere-application-server) | 2014-02-21 | 8 | 20161 | 1 | Answers exist; top score 0 | `java` `jakarta-ee` `ejb-3.1` `websphere-8` |
| 61 | [JavaFx USE_COMPUTED_SIZE for Stage without using FXML](https://stackoverflow.com/questions/28573700/javafx-use-computed-size-for-stage-without-using-fxml) | 2015-02-18 | 8 | 16424 | 2 | Answers exist; top score 0 | `java` `user-interface` `javafx` `height` `width` |
| 62 | [javac ignoring @SuppressWarnings("all")](https://stackoverflow.com/questions/13729840/javac-ignoring-suppresswarningsall) | 2012-12-05 | 8 | 11195 | 1 | Answers exist; top score -2, lowest -2 | `java` `annotations` `compiler-warnings` |
| 63 | [SQLite connection pool](https://stackoverflow.com/questions/7444157/sqlite-connection-pool) | 2011-09-16 | 7 | 17961 | 0 | No answers | `java` `android` `sqlite` |
| 64 | [I'm getting javax.crypto.AEADBadTagException: Tag mismatch! when decrypting large files using AES/GCM/NoPadding](https://stackoverflow.com/questions/34163634/im-getting-javax-crypto-aeadbadtagexception-tag-mismatch-when-decrypting-larg) | 2015-12-08 | 7 | 10083 | 0 | No answers | `java` `encryption` |
| 65 | [JsonMappingException: Root name does not match expected](https://stackoverflow.com/questions/28345538/jsonmappingexception-root-name-does-not-match-expected) | 2015-02-05 | 6 | 10282 | 0 | No answers | `java` `json` `jersey` `jackson` `jersey-client` |
| 66 | [Diagnosing issues with Spring WebSocket user destinations](https://stackoverflow.com/questions/28065489/diagnosing-issues-with-spring-websocket-user-destinations) | 2015-01-21 | 7 | 2153 | 0 | No answers | `java` `spring` `spring-boot` `stomp` `spring-websocket` |
| 67 | [Spring SAML signature validation issue](https://stackoverflow.com/questions/31947118/spring-saml-signature-validation-issue) | 2015-08-11 | 8 | 4436 | 0 | No answers | `java` `spring` `spring-security` `saml` `xml-signature` |
| 68 | [Detect boundaries of a document in an image using opencv java](https://stackoverflow.com/questions/27035858/detect-boundaries-of-a-document-in-an-image-using-opencv-java) | 2014-11-20 | 9 | 9398 | 0 | No answers | `java` `android` `opencv` `image-processing` `feature-detection` |
| 69 | [Set line width and file type in output XML](https://stackoverflow.com/questions/6752548/set-line-width-and-file-type-in-output-xml) | 2011-07-19 | 8 | 2020 | 0 | No answers | `java` `xml` |
| 70 | [Setting up a file for download on a tomcat server.](https://stackoverflow.com/questions/6887165/setting-up-a-file-for-download-on-a-tomcat-server) | 2011-07-31 | 6 | 9354 | 0 | No answers | `java` `tomcat` `download` `docx` |
| 71 | [How to specify Git remote's URL for Maven Release plugin using standard SSH syntax?](https://stackoverflow.com/questions/28167740/how-to-specify-git-remotes-url-for-maven-release-plugin-using-standard-ssh-synt) | 2015-01-27 | 8 | 4105 | 0 | No answers | `java` `git` `maven` `ssh` |
| 72 | [Change Spring WS Fault status code from 500 to 400](https://stackoverflow.com/questions/34213003/change-spring-ws-fault-status-code-from-500-to-400) | 2015-12-10 | 8 | 4030 | 0 | No answers | `java` `spring` `web-services` `soap` `spring-ws` |
| 73 | [Using Static Nested Class in JSP Tag](https://stackoverflow.com/questions/28231312/using-static-nested-class-in-jsp-tag) | 2015-01-30 | 7 | 1856 | 0 | No answers | `java` `jsp` `jsp-tags` |
| 74 | [Java Spring Boot: SimpMessagingTemplate send messages are not received by Stomp Endpoints](https://stackoverflow.com/questions/32275898/java-spring-boot-simpmessagingtemplate-send-messages-are-not-received-by-stomp) | 2015-08-28 | 9 | 3935 | 0 | No answers | `java` `spring` `websocket` `stomp` |
| 75 | [set of objects in avro schema](https://stackoverflow.com/questions/26170281/set-of-objects-in-avro-schema) | 2014-10-02 | 11 | 1717 | 0 | No answers | `java` `avro` |
| 76 | [Java print multiple copies but only one ends up at the printer](https://stackoverflow.com/questions/19376195/java-print-multiple-copies-but-only-one-ends-up-at-the-printer) | 2013-10-15 | 6 | 3523 | 0 | No answers | `java` `pdf` `printing` |
| 77 | [MongoDB ACKNOWLEDGED write concern faster than UNACKNOWLEDGED?](https://stackoverflow.com/questions/29044711/mongodb-acknowledged-write-concern-faster-than-unacknowledged) | 2015-03-14 | 6 | 3371 | 0 | No answers | `java` `mongodb` `bulkinsert` `database-performance` |
| 78 | [Java thread dump prio value doesn't correspond with real thread priority on linux?](https://stackoverflow.com/questions/10430925/java-thread-dump-prio-value-doesnt-correspond-with-real-thread-priority-on-linu) | 2012-05-03 | 8 | 1505 | 2 | Answers exist; top score 0 | `java` `linux` `multithreading` `pthreads` `jstack` |
| 79 | [Android Bluetooth LE connection issue](https://stackoverflow.com/questions/28928793/android-bluetooth-le-connection-issue) | 2015-03-08 | 8 | 3186 | 0 | No answers | `java` `android` `bluetooth` `wear-os` |
| 80 | [Android camera2 API error in call to createCaptureSession](https://stackoverflow.com/questions/33820732/android-camera2-api-error-in-call-to-createcapturesession) | 2015-11-20 | 5 | 1471 | 0 | No answers | `java` `android` `android-camera` |
| 81 | [Handling Range content requests of a file with Java Servlet](https://stackoverflow.com/questions/12798265/handling-range-content-requests-of-a-file-with-java-servlet) | 2012-10-09 | 9 | 6788 | 0 | No answers | `java` `file` `servlets` `range` |
| 82 | [Tomcat class loading order when serving modules without publishing](https://stackoverflow.com/questions/19675931/tomcat-class-loading-order-when-serving-modules-without-publishing) | 2013-10-30 | 8 | 3087 | 2 | Answers exist; top score 0 | `java` `eclipse` `tomcat` |
| 83 | [Different form actions based on select change events](https://stackoverflow.com/questions/498943/different-form-actions-based-on-select-change-events) | 2009-01-31 | 8 | 2997 | 1 | Answers exist; top score 0 | `java` `beehive` `netui` |
| 84 | [How to set system properties through a file with Oracle's JVM](https://stackoverflow.com/questions/7366852/how-to-set-system-properties-through-a-file-with-oracles-jvm) | 2011-09-09 | 7 | 2906 | 0 | No answers | `java` `command-line` `virtual-machine` |
| 85 | [What's the correct and working way to broadcast an UDP packet in Java?](https://stackoverflow.com/questions/8253938/whats-the-correct-and-working-way-to-broadcast-an-udp-packet-in-java) | 2011-11-24 | 8 | 2849 | 1 | Answers exist; top score 0 | `java` `sockets` `network-programming` `udp` `broadcast` |
| 86 | [OAuth2 and email authorization for REST API backend](https://stackoverflow.com/questions/32877081/oauth2-and-email-authorization-for-rest-api-backend) | 2015-09-30 | 5 | 613 | 0 | No answers | `java` `spring` `security` `oauth` `mobile-application` |
| 87 | [camel-mongodb save java.util.Date as ISODate instead of NumberLong](https://stackoverflow.com/questions/24644990/camel-mongodb-save-java-util-date-as-isodate-instead-of-numberlong) | 2014-07-09 | 12 | 1309 | 0 | No answers | `java` `mongodb` `date` `apache-camel` `isodate` |
| 88 | [HttpURLConnection performs always a GET request instead of a POST request in spite of setDoOutput(true) and setRequestMethod("POST")](https://stackoverflow.com/questions/10374289/httpurlconnection-performs-always-a-get-request-instead-of-a-post-request-in-spi) | 2012-04-29 | 9 | 5925 | 2 | Answers exist; top score 0 | `java` `android` `http` `android-4.0-ice-cream-sandwich` |
| 89 | [How does IntelliJ know if a directory is a 'source' or a 'test source'?](https://stackoverflow.com/questions/21686930/how-does-intellij-know-if-a-directory-is-a-source-or-a-test-source) | 2014-02-10 | 10 | 5884 | 2 | Answers exist; top score 0 | `java` `intellij-idea` `gradle` |
| 90 | [Setting Android proxy settings programmatically using System.Global method](https://stackoverflow.com/questions/25487092/setting-android-proxy-settings-programmatically-using-system-global-method) | 2014-08-25 | 8 | 2706 | 0 | No answers | `java` `android` `proxy` `settings` `android-4.4-kitkat` |
| 91 | [How do I add an ICC to an existing PDF document](https://stackoverflow.com/questions/34138201/how-do-i-add-an-icc-to-an-existing-pdf-document) | 2015-12-07 | 5 | 2239 | 0 | No answers | `java` `pdf` `pdfbox` |
| 92 | [Posting a file and JSON data to Spring rest service](https://stackoverflow.com/questions/33729591/posting-a-file-and-json-data-to-spring-rest-service) | 2015-11-16 | 10 | 13194 | 4 | Answers exist; top score 0 | `java` `json` `spring` `rest` `multipartform-data` |
| 93 | [How do I design a generic Response builder / RESTful Web Service using Spring MVC?](https://stackoverflow.com/questions/14484657/how-do-i-design-a-generic-response-builder-restful-web-service-using-spring-mv) | 2013-01-23 | 9 | 17571 | 3 | Answers exist; top score 0 | `java` `rest` `spring-mvc` |
| 94 | [jersey rest web Service with Activemq middleware integration](https://stackoverflow.com/questions/19706788/jersey-rest-web-service-with-activemq-middleware-integration) | 2013-10-31 | 9 | 10374 | 1 | Answers exist; top score 0 | `java` `rest` `jms` `jax-rs` `activemq-classic` |
| 95 | [Unexpected wrapper element when using CXF generated client](https://stackoverflow.com/questions/16700900/unexpected-wrapper-element-when-using-cxf-generated-client) | 2013-05-22 | 9 | 10344 | 1 | Answers exist; top score 0 | `java` `soap` `wsdl` `cxf` |
| 96 | [How to load a yaml directly into a Map<String, Car> with SnakeYAML?](https://stackoverflow.com/questions/28348513/how-to-load-a-yaml-directly-into-a-mapstring-car-with-snakeyaml) | 2015-02-05 | 8 | 19223 | 0 | No answers | `java` `yaml` `snakeyaml` |
| 97 | [Java MODBUS RTU master example code](https://stackoverflow.com/questions/26621299/java-modbus-rtu-master-example-code) | 2014-10-29 | 8 | 17561 | 0 | No answers | `java` `serial-port` `rxtx` `modbus` |
| 98 | [Configuration failures resulting into Test skip in TestNG with no information in XMLs](https://stackoverflow.com/questions/18680360/configuration-failures-resulting-into-test-skip-in-testng-with-no-information-in) | 2013-09-08 | 8 | 10148 | 1 | Answers exist; top score 0 | `java` `junit` `testng` |
| 99 | [Spring 3 exception handling using JSON](https://stackoverflow.com/questions/5641091/spring-3-exception-handling-using-json) | 2011-04-12 | 6 | 25839 | 0 | No answers | `java` `jquery` `json` `spring-mvc` |
| 100 | [What is the structure/pattern for android/java to organise http web service calls in the project?](https://stackoverflow.com/questions/13292186/what-is-the-structure-pattern-for-android-java-to-organise-http-web-service-call) | 2012-11-08 | 8 | 2107 | 2 | Answers exist; top score 0 | `java` `android` `design-patterns` |
| 101 | [Gson ignore null when deserializing object](https://stackoverflow.com/questions/33301036/gson-ignore-null-when-deserializing-object) | 2015-10-23 | 10 | 9211 | 3 | Answers exist; top score 0 | `java` `json` `gson` `deserialization` |
| 102 | [Why are all jar files not compressed in the JRE installer?](https://stackoverflow.com/questions/13012031/why-are-all-jar-files-not-compressed-in-the-jre-installer) | 2012-10-22 | 8 | 909 | 0 | No answers | `installation` `compression` `java` |
| 103 | [Android OkHttp library: GET Request - Exception EOFException: \n not found: size=0 content=](https://stackoverflow.com/questions/34072774/android-okhttp-library-get-request-exception-eofexception-n-not-found-size) | 2015-12-03 | 9 | 8923 | 2 | Answers exist; top score 0 | `java` `android` `http` `get` `okhttp` |
| 104 | [Getting an EL in a Javascript file, loaded by @ResourceDependency](https://stackoverflow.com/questions/7220160/getting-an-el-in-a-javascript-file-loaded-by-resourcedependency) | 2011-08-28 | 8 | 884 | 1 | Answers exist; top score 0 | `java` `javascript` `jsf-2` `el` |
| 105 | [How to avoid code duplication using JAXB with container-like elements with a similar structure](https://stackoverflow.com/questions/11444609/how-to-avoid-code-duplication-using-jaxb-with-container-like-elements-with-a-sim) | 2012-07-12 | 8 | 871 | 1 | Answers exist; top score 0 | `java` `xml` `jaxb` |
| 106 | [How to set PDF file size using PdfDocument on Android](https://stackoverflow.com/questions/27941522/how-to-set-pdf-file-size-using-pdfdocument-on-android) | 2015-01-14 | 10 | 8395 | 1 | Answers exist; top score 0 | `java` `android` `pdf` |
| 107 | [Android SearchView empty string](https://stackoverflow.com/questions/15992882/android-searchview-empty-string) | 2013-04-13 | 8 | 7761 | 2 | Answers exist; top score 0 | `java` `android` `searchview` |
| 108 | [Effectively get line numbers in java source code at compile time](https://stackoverflow.com/questions/31011354/effectively-get-line-numbers-in-java-source-code-at-compile-time) | 2015-06-23 | 11 | 1622 | 1 | Answers exist; top score 0 | `java` `eclipse` `gradle` |
| 109 | [What causes the JSessionID changing with every request?](https://stackoverflow.com/questions/11960961/what-causes-the-jsessionid-changing-with-every-request) | 2012-08-14 | 6 | 7453 | 0 | No answers | `java` `jsf` `jakarta-ee` `glassfish` `ejb` |
| 110 | [Make sure photos are saved with the same orientation they were taken?](https://stackoverflow.com/questions/14556569/make-sure-photos-are-saved-with-the-same-orientation-they-were-taken) | 2013-01-28 | 14 | 1574 | 3 | Answers exist; top score 0 | `java` `android` `camera` `arrays` `photo` |
| 111 | [Eclipse setting to leave Java static imports alone?](https://stackoverflow.com/questions/21339686/eclipse-setting-to-leave-java-static-imports-alone) | 2014-01-24 | 7 | 1551 | 0 | No answers | `java` `eclipse` |
| 112 | [IabHelper Android bug (NullPointerException) launchPurchaseFlow?](https://stackoverflow.com/questions/21986976/iabhelper-android-bug-nullpointerexception-launchpurchaseflow) | 2014-02-24 | 8 | 1509 | 0 | No answers | `java` `android` `nullpointerexception` `in-app-billing` `android-billing` |
| 113 | [EC2 Storm cluster Netty problems](https://stackoverflow.com/questions/31059947/ec2-storm-cluster-netty-problems) | 2015-06-25 | 8 | 1474 | 0 | No answers | `java` `amazon-ec2` `netty` `apache-storm` |
| 114 | [Better way to match list of strings using JsonPath and Hamcrest Matchers](https://stackoverflow.com/questions/34427522/better-way-to-match-list-of-strings-using-jsonpath-and-hamcrest-matchers) | 2015-12-23 | 5 | 6803 | 0 | No answers | `java` `hamcrest` `jsonpath` |
| 115 | [Passing a custom java security policy file to surefire maven test fails, results in access control error for everything](https://stackoverflow.com/questions/32448791/passing-a-custom-java-security-policy-file-to-surefire-maven-test-fails-results) | 2015-09-08 | 7 | 1380 | 0 | No answers | `java` `maven` `security` `surefire` |
| 116 | [Searching a grid of points, visting each point once only](https://stackoverflow.com/questions/32195856/searching-a-grid-of-points-visting-each-point-once-only) | 2015-08-25 | 7 | 1353 | 3 | Answers exist; top score 0 | `java` `search` `grid` |
| 117 | [Gradle transitive dependency to JAR inside of a library module](https://stackoverflow.com/questions/27319423/gradle-transitive-dependency-to-jar-inside-of-a-library-module) | 2014-12-05 | 7 | 1299 | 0 | No answers | `java` `android` `jar` `gradle` |
| 118 | [Eclipse - Find Java references of a library without attached sources](https://stackoverflow.com/questions/21235807/eclipse-find-java-references-of-a-library-without-attached-sources) | 2014-01-20 | 11 | 5975 | 1 | Answers exist; top score 0 | `java` `eclipse` `eclipse-jdt` |
| 119 | [Cannot Delete an alias from the KeyStore - keyStore.store throws UnsupportedOperationException](https://stackoverflow.com/questions/33770972/cannot-delete-an-alias-from-the-keystore-keystore-store-throws-unsupportedoper) | 2015-11-18 | 11 | 1278 | 0 | No answers | `java` `android` |
| 120 | [Cannot recover from org.omg.CORBA.TRANSIENT (becomes permanent)](https://stackoverflow.com/questions/21437450/cannot-recover-from-org-omg-corba-transient-becomes-permanent) | 2014-01-29 | 9 | 5928 | 2 | Answers exist; top score 0 | `java` `corba` |
| 121 | [Launch4j jre required error](https://stackoverflow.com/questions/10570702/launch4j-jre-required-error) | 2012-05-13 | 6 | 5793 | 0 | No answers | `java` `launch4j` |
| 122 | [The connection pool for database has been unable to grant a connection to thread 602 (Binder_2) with flags 0x1](https://stackoverflow.com/questions/30121485/the-connection-pool-for-database-has-been-unable-to-grant-a-connection-to-thread) | 2015-05-08 | 8 | 2648 | 0 | No answers | `java` `android` `sqlite` |
| 123 | [spring-boot camel case nested property as environment variable](https://stackoverflow.com/questions/31729516/spring-boot-camel-case-nested-property-as-environment-variable) | 2015-07-30 | 8 | 5569 | 1 | Answers exist; top score 0 | `java` `spring-boot` `environment-variables` |
| 124 | [How should a custom Guice scope be integrated with TestNG?](https://stackoverflow.com/questions/27322150/how-should-a-custom-guice-scope-be-integrated-with-testng) | 2014-12-05 | 12 | 540 | 1 | Answers exist; top score 0 | `java` `junit` `testng` `guice` |
| 125 | [Annotation @RolesAllowed does not work on Web Service deployed in Tomcat 7.0.32](https://stackoverflow.com/questions/13372337/annotation-rolesallowed-does-not-work-on-web-service-deployed-in-tomcat-7-0-32) | 2012-11-14 | 6 | 1150 | 0 | No answers | `java` `web-services` `annotations` `jax-ws` `tomcat7` |
| 126 | [Can't get OpenCV to work with Java+Maven+IntelliJ](https://stackoverflow.com/questions/23553053/cant-get-opencv-to-work-with-javamavenintellij) | 2014-05-08 | 6 | 2467 | 0 | No answers | `java` `maven` `opencv` `intellij-idea` `maven-3` |
| 127 | [Samza/Kafka Failed to Update Metadata](https://stackoverflow.com/questions/30653213/samza-kafka-failed-to-update-metadata) | 2015-06-04 | 9 | 5181 | 1 | Answers exist; top score 0 | `java` `metadata` `apache-kafka` `apache-samza` |
| 128 | [Android BigInteger ArithmeticException](https://stackoverflow.com/questions/26489195/android-biginteger-arithmeticexception) | 2014-10-21 | 13 | 1110 | 1 | Answers exist; top score 0 | `java` `android` `rsa` `biginteger` `arithmeticexception` |
| 129 | [Hibernate unsaved-value annotation](https://stackoverflow.com/questions/21587844/hibernate-unsaved-value-annotation) | 2014-02-05 | 6 | 5103 | 0 | No answers | `java` `hibernate` `annotations` |
| 130 | [Different benchmarking results between forks in JMH](https://stackoverflow.com/questions/32047440/different-benchmarking-results-between-forks-in-jmh) | 2015-08-17 | 6 | 1096 | 0 | No answers | `java` `performance` `benchmarking` `jmh` |
| 131 | [JNI - SetByteArrayRegion does not work](https://stackoverflow.com/questions/30173709/jni-setbytearrayregion-does-not-work) | 2015-05-11 | 7 | 2353 | 0 | No answers | `java` `c` `java-native-interface` `jniwrapper` |
| 132 | [Tomcat 6.0.28 Unresponsive Because of Blocked Threads During Soak Test](https://stackoverflow.com/questions/18054059/tomcat-6-0-28-unresponsive-because-of-blocked-threads-during-soak-test) | 2013-08-05 | 8 | 2323 | 1 | Answers exist; top score 0 | `java` `multithreading` `tomcat` `garbage-collection` `deadlock` |
| 133 | [Eclipse uses old PATH variable to execute command line process in Gradle Task?](https://stackoverflow.com/questions/30880478/eclipse-uses-old-path-variable-to-execute-command-line-process-in-gradle-task) | 2015-06-17 | 9 | 1069 | 2 | Answers exist; top score 0 | `java` `android` `eclipse` `groovy` `gradle` |
| 134 | [JavaPoet + Android Studio "addModifiers(Modifier) cannot be applied to Modifier"](https://stackoverflow.com/questions/32801536/javapoet-android-studio-addmodifiersmodifier-cannot-be-applied-to-modifier) | 2015-09-26 | 11 | 1033 | 1 | Answers exist; top score 0 | `java` `android` `intellij-idea` `javapoet` |
| 135 | [CameraDevice failing to create session [Camera2]](https://stackoverflow.com/questions/33987245/cameradevice-failing-to-create-session-camera2) | 2015-11-29 | 10 | 4790 | 2 | Answers exist; top score 0 | `java` `android` `camera` `camera2` |
| 136 | [Spring Data JPA - Custom Sort in JpaRepository](https://stackoverflow.com/questions/33318257/spring-data-jpa-custom-sort-in-jparepository) | 2015-10-24 | 9 | 15353 | 2 | Answers exist; top score 0 | `java` `spring` `jpa` `spring-data` `spring-data-jpa` |
| 137 | [How can I loop through all RGB combinations in rainbow order in Java?](https://stackoverflow.com/questions/31784658/how-can-i-loop-through-all-rgb-combinations-in-rainbow-order-in-java) | 2015-08-03 | 9 | 12501 | 3 | Answers exist; top score 0 | `java` `loops` `colors` `rgb` |
| 138 | [Is there any characters/bytes limit in the Android clipboard? [Android development]](https://stackoverflow.com/questions/28100218/is-there-any-characters-bytes-limit-in-the-android-clipboard-android-developme) | 2015-01-22 | 9 | 10716 | 0 | No answers | `java` `android` `eclipse` `string` `clipboard` |
| 139 | [How can I add shadow to ImageButton?](https://stackoverflow.com/questions/25347892/how-can-i-add-shadow-to-imagebutton) | 2014-08-17 | 8 | 10867 | 1 | Answers exist; top score 0 | `java` `android` `html` `css` `button` |
| 140 | [java.lang.NoClassDefFoundError: Could not initialize class com.sun.xml.internal.ws.fault.SOAPFaultBuilder](https://stackoverflow.com/questions/12785052/java-lang-noclassdeffounderror-could-not-initialize-class-com-sun-xml-internal) | 2012-10-08 | 7 | 11338 | 0 | No answers | `java` `soap` `jboss` `jax-ws` |
| 141 | [Java VM fails with heap size increase](https://stackoverflow.com/questions/33365237/java-vm-fails-with-heap-size-increase) | 2015-10-27 | 6 | 30880 | 0 | No answers | `java` `jvm` |
| 142 | [OptimisticLockException in pessimistic locking](https://stackoverflow.com/questions/27356794/optimisticlockexception-in-pessimistic-locking) | 2014-12-08 | 9 | 2132 | 2 | Answers exist; top score 0 | `java` `spring` `hibernate` `jakarta-ee` |
| 143 | [Usable lock-files in Java](https://stackoverflow.com/questions/26933928/usable-lock-files-in-java) | 2014-11-14 | 1 | 407 | 0 | No answers | `java` `file` `locking` `file-locking` |
| 144 | [LinkageError using lucene with spring redeploying on tomcat or weblogic](https://stackoverflow.com/questions/26933374/linkageerror-using-lucene-with-spring-redeploying-on-tomcat-or-weblogic) | 2014-11-14 | 0 | 697 | 0 | No answers | `java` `spring` `spring-mvc` `tomcat` `lucene` |
| 145 | [memory & disk cache with JCS 1.3](https://stackoverflow.com/questions/26921457/memory-disk-cache-with-jcs-1-3) | 2014-11-14 | 3 | 994 | 0 | No answers | `java` `caching` `offline-caching` `jcs` |
| 146 | [Background thread factory pattern](https://stackoverflow.com/questions/26929298/background-thread-factory-pattern) | 2014-11-14 | 0 | 224 | 0 | No answers | `java` `android` `multithreading` `factory` |
| 147 | [Is it possible to clone a git repository using ssh/git protocol from KIE Drools Workbench](https://stackoverflow.com/questions/26927833/is-it-possible-to-clone-a-git-repository-using-ssh-git-protocol-from-kie-drools) | 2014-11-14 | 2 | 896 | 0 | No answers | `java` `git` `drools` `drools-guvnor` `kie` |
| 148 | [Avoid duplicates when eager loading from hibernate with shared objects?](https://stackoverflow.com/questions/26919612/avoid-duplicates-when-eager-loading-from-hibernate-with-shared-objects) | 2014-11-13 | 0 | 305 | 0 | No answers | `java` `hibernate` `design-patterns` `orm` |
| 149 | [java.lang.NoSuchFieldError: com/ibm/ws/ssl/core/Constants.ALL_PROTOCOLS](https://stackoverflow.com/questions/26922710/java-lang-nosuchfielderror-com-ibm-ws-ssl-core-constants-all-protocols) | 2014-11-14 | 0 | 892 | 0 | No answers | `java` `jakarta-ee` `jms` `websphere-8` |
| 150 | [Heroku app crashes on boot timeout (60 seconds) but app started in 30 seconds](https://stackoverflow.com/questions/26923554/heroku-app-crashes-on-boot-timeout-60-seconds-but-app-started-in-30-seconds) | 2014-11-14 | 2 | 450 | 0 | No answers | `java` `spring` `heroku` `timeout` |

## Reproducibility

- Date range used as UTC epoch seconds for API calls: `1222819200` through `1451606399`.
- API sources queried before throttling: `/questions/unanswered`, `/questions/no-answers`, `/search/advanced`, and sampled `/questions/{ids}/answers` on Stack Exchange API v2.3.
- Fallback sources used after throttling: Stack Overflow Java unanswered listing pages and exact-title web searches that resolved to Stack Overflow question pages.
- Heuristic filters: Java tag required, not closed/locked/migrated when metadata was present, enough body/context to skim, and a cold signal of zero answers or no accepted/positive-scored answer in captured data.
- Shortlist exclusions after comment/body inspection: `Usable lock-files in Java`, `WebSocket Error during Handshake Unexpected code 200`, `H2 database> How to compact / vacuum while running?`, `Quartz-scheduler DB Lock Exception`, `Java GC - Understanding TargetSurivorRatio`, plus other candidates where comments or post updates showed a working fix, OP acknowledgement, or a linked working answer.

## Narrative Teasers

These pre-generated teasers are opening notes for unresolved case dossiers. They are atmospheric entry points, not findings: they must not be treated as reproduced failures, root-cause claims, fixes, or validated closure.

### 27051034 - Using Optaplanner to solve VRPTWPD
- URL: https://stackoverflow.com/questions/27051034/using-optaplanner-to-solve-vrptwpd
- Teaser: August Flanagan brought Larkule Quirot a routing problem with too many passengers and not enough alibis: pickups had to precede deliveries, paired parcels had to ride the same vehicle, and OptaPlanner kept returning routes that looked lawful only until the score ledger was opened. The file is unusually rich with clues: shadow variables, Drools hard constraints, `FULL_ASSERT` corruption, a 380-customer scale-up, and selection filters that made the solver worse before they made it interesting. By the last update, the small sample could behave, but the larger case still sat under a yellow lamp with a hard question on the cover: can this model be made fast enough without losing the constraints that make it true?

### 10700340 - How can I parse an inbound message with MTOM attachments under Metro without pulling in all the attachment data?
- URL: https://stackoverflow.com/questions/10700340/how-can-i-parse-an-inbound-message-with-mtom-attachments-under-metro-without-pul
- Teaser: JFK had a SOAP envelope on the table and a bulk XML attachment in the other room, but Metro kept dragging the whole thing into the light before anyone could question it properly. The trail runs through `AsyncProvider<Message>`, MTOM policy, `StreamingAttachment`, `MtomXMLStreamReaderEx`, and an attempted temporary-file switch that ends with a ReadOnce warning instead of relief. Larkule Quirot does not yet know whether the door is locked by API design, configuration, or an overlooked extension point; the first job is to recreate the moment where `xop:Include` stops being a reference and becomes a memory bill.

### 31524084 - AEM performance issues (slow memory leak) org.slf4j.helpers.BasicMarker and org.slf4j.helpers.BasicMarkerFactory
- URL: https://stackoverflow.com/questions/31524084/aem-performance-issues-slow-memory-leak-org-slf4j-helpers-basicmarker-and-org
- Teaser: Nabello's AEM site did not die dramatically; it aged badly over seven to ten days, then arrived at 400% CPU with 16 GB of memory and no clean OutOfMemory confession. The heap dump points a bright desk lamp at `BasicMarkerFactory`, `BasicMarker`, a 7.2 GB retained `ConcurrentHashMap`, and millions of markers tangled through Felix, Oak, Sling, Rhino, and logback machinery. Larkule Quirot has comments, a zero-score answer, and a trail toward OAK-3476, but the case file stays open until the leak can be reconstructed without mistaking the largest shadow for the hand that cast it.

### 33871335 - How to add context.xml file to embedded tomcat server
- URL: https://stackoverflow.com/questions/33871335/how-to-add-context-xml-file-to-embedded-tomcat-server
- Teaser: SanjaySSN's `context.xml` worked in the old servlet house, but vanished the moment Spring Boot invited Tomcat inside the application. The file sits under `src/main/webapp/META-INF/context.xml` with more than fifty JNDI resources behind it, while `StandardContext[null]` throws a startup exception from Tomcat 8.0.28 and a proposed `@ImportResource` detour collapses into Spring trying to read a Tomcat document as its own. Larkule Quirot has a path, a stack trace, and several zero-score answers; what he does not yet have is proof that embedded Tomcat can be made to honor the scene without rebuilding every clue by hand.

### 12380229 - Encoding a pound sign in a java URI
- URL: https://stackoverflow.com/questions/12380229/encoding-a-pound-sign-in-a-java-uri
- Teaser: User1664369's case looks like a one-character misdemeanor until the whole file share refuses to open: a `#` inside `/Documents/#2012/...` behaves one way when typed at a command line, another when fed through `URI`, and another again when Java turns a backslash into a forward slash. The clues include `%23`, `\\%23`, `file://serverIPaddress`, `URLConnection.getInputStream()`, and a coworker's report that normal encoding works when the program is called from the production process. Larkule Quirot has to separate the URL crime scene from the shell's fingerprints before he can say whether the bug lives in Java, Windows path habits, IIS, or the way the evidence was handed over.

### 32044257 - Post form via ajax and get a form object in play framework java
- URL: https://stackoverflow.com/questions/32044257/post-form-via-ajax-and-get-a-form-object-in-play-framework-java
- Teaser: Codegasmer watched the same form walk through two doors and come back as two different witnesses: a normal Play 2.3.8 submit binds cleanly into `Form<Permission>`, but the jQuery Ajax version leaves `permissionFormData.get().getPer1()` staring at a No Value exception. The browser's network panel says `per1` is present, the checkbox model defaults to `"off"`, and the escape route through JSON works only by dodging the question. Larkule Quirot's pre-brief starts at the boundary between serialized form data, Play's request binder, route method, and headers, where a POST can look familiar until the framework asks for its papers.

### 30529578 - Gradle compile dependency is not added to classpath
- URL: https://stackoverflow.com/questions/30529578/gradle-compile-dependency-is-not-added-to-classpath
- Teaser: Mvieghofer added `org.reflections:reflections:0.9.10` to an Android app like a witness invited into court, yet `tasks:compileReleaseJava` still swore the package did not exist. The app module lists CardView, RecyclerView, RoboGuice, `provided roboblender`, exclusions for `xml-apis` and `annotations`, while Android Studio can see the library under External Dependencies only after a manual nudge. Larkule Quirot's desk now holds two Gradle files, a vanishing import, and a question sharper than dependency folklore: why can the resolver find the artifact while the compiling module cannot put it on the classpath?

### 10859567 - Unexpected results implementing simple motion blur in Libgdx
- URL: https://stackoverflow.com/questions/10859567/unexpected-results-implementing-simple-motion-blur-in-libgdx
- Teaser: Ian.shaun.thomas brought two screenshots to the desk: on desktop, LibGDX left a clean fading trail; on a Galaxy Nexus and Vibrant, the same circles smeared into a darker, uglier confession. The effect is simple enough to be dangerous, a `Pixmap` filled with RGBA `(0, 0, 0, 0.1f)` drawn each frame before the moving textures, no motion-blur math, just alpha, batching, and OpenGL ES behaving unlike the PC. Larkule Quirot has to decide whether the crime is in blending state, texture format, device GPU behavior, or the assumption that a translucent clear sprite can be trusted as an accumulation buffer.

### 31007597 - How to use spark Java API to read binary file stream from HDFS?
- URL: https://stackoverflow.com/questions/31007597/how-to-use-spark-java-api-to-read-binary-file-stream-from-hdfs
- Teaser: Ying Tan's streaming job waits beside an HDFS directory for fresh binary files from Flume, but Spark keeps handing back a `BytesWritable` with an empty pocket. The evidence includes `binaryRecordsStream` rejected for fixed record length, `fileStream` wired through a custom `FileInputFormat`, a homemade `InputSplit`, and a `RecordReader` whose debug prints lead to `VAL-LENGTH = [0]` instead of online-learning data. Larkule Quirot's question is not whether Spark can read bytes; it is where the bytes disappear between HDFS discovery, split construction, and the Java Streaming API's contract.

### 29500133 - WebSocket Error during Handshake Unexpected code 200
- URL: https://stackoverflow.com/questions/29500133/websocket-error-during-handshake-unexpected-code-200
- Teaser: manpreetSingh's browser expected the WebSocket ritual to end with `101 Switching Protocols`; GlassFish answered `200 OK`, like the wrong clerk had stamped the file. Behind the polite HTTP face sits the real disturbance: `WebSocket filter` fails during startup, Tyrus reports that `com.CollabEdit.Message` has no registered decoder, and the `@ServerEndpoint` path is tangled with a user-facing URL that actually routes through `main.jsp`. Larkule Quirot has a handshake, a deployment exception, and a decoder class that appears to exist on paper; the case is to prove which part of the server never saw it.

### 15276976 - Maven generate-sources cannot resolve a dependency
- URL: https://stackoverflow.com/questions/15276976/maven-generate-sources-cannot-resolve-a-dependency
- Teaser: Nathan's Maven reactor works until JAXB walks into module B during `generate-sources` and asks for module A before module A has had a chance to become a jar. The ugly workaround is a third module, C, made only to house generated sources, a room built solely because the hallway order will not cooperate. Larkule Quirot's file has the parent POM, `jaxb2-maven-plugin` 1.3, `build-helper-maven-plugin`, a private Nexus URL, and one precise question under the lamp: can the build keep its two-module shape without lying to Maven's dependency resolver?

### 33696378 - connect android device via MQTT with ssl
- URL: https://stackoverflow.com/questions/33696378/connect-android-device-via-mqtt-with-ssl
- Teaser: StefanoS already had MQTT over TLS working in plain Java, packets checked under WireShark and all, but the Android client closed the door with `javax.net.ssl.SSLException: Connection closed by peer`. The evidence drawer contains Paho, IBM IoT-style `ssl://...:8883`, TLSv1.2 properties, PEM CA loading, Bouncy Castle BKS keystores, client certificates, and four different SSLContext rituals that all end at the same handshake failure. Larkule Quirot cannot call it a certificate case yet; he first has to prove whether Android's socket factory, trust chain, protocol negotiation, or broker expectations are the one piece that changed when the working Java client crossed onto a phone.

### 11930142 - Apk Expansion Files - Application Licensing - Developer account - NOT_LICENSED response
- URL: https://stackoverflow.com/questions/11930142/apk-expansion-files-application-licensing-developer-account-not-licensed-r
- Teaser: hDan's downloader reached Google's licensing desk with an APK expansion file in hand and came back stamped `NOT_LICENSED`, even when the test response said it should pass. The file includes `APKExpansionPolicy`, `AESObfuscator`, `LicenseChecker`, `STATE_FAILED_UNLICENSED`, version-code experiments, cache clearing, release-key suspicion, and a later note from Google support admitting new test accounts were returning errors. This is a cold case with a strange twist: Larkule Quirot may find that the most important witness was not code at all, but a remote licensing service whose old behavior can only be responsibly modeled.

### 33186004 - Jackson @JsonPropertyOrder is ignored
- URL: https://stackoverflow.com/questions/33186004/jackson-jsonpropertyorder-is-ignored
- Teaser: Alviere wanted JSON that read like a tidy ledger: `id`, `company`, `title`, `infos`, `startDate`, `endDate`; Jackson answered with `infos` first and a shrug. The room contains Spark Framework, Lombok `@Data`, Jackson 2.6.3 and 2.3.5, `ObjectMapper(new JsonFactory())`, `SerializationFeature.INDENT_OUTPUT`, and comments that first suspect Lombok, then remind everyone JSON objects have no official order. Larkule Quirot's pre-brief is not to decide whether order matters philosophically, but to prove why this annotation failed in this setup while small reproductions elsewhere behaved.

### 32676758 - Making Android BLE (Bluetooth LE) apprently stable
- URL: https://stackoverflow.com/questions/32676758/making-android-ble-bluetooth-le-apprently-stable
- Teaser: Tony Siu set two Moto E devices across from each other and asked Android BLE for a simple ritual: connect, exchange eleven write/notify messages, disconnect, repeat until the stack showed its character. Most rounds finish in under three seconds, but some stall for thirty, some disconnect before they begin, and some only recover when Bluetooth itself is switched off and back on. Larkule Quirot's dossier is part code path, part field report: `startScan`, `connectGatt`, `discoverServices`, notification descriptors, watchdog resets, and the uncomfortable question of whether stability can be engineered without pulling the whole radio switch.

### 12763746 - LinearLayout minHeight not working with weigth="1"
- URL: https://stackoverflow.com/questions/12763746/linearlayout-minheight-not-working-with-weigth-1
- Teaser: Timothee Jeannin spent an afternoon chasing a red bottom panel that should stretch when the list is short, then hold 200dp when the list grows tall. The XML looks innocent: a vertical `LinearLayout`, a `ListView` with `wrap_content`, and `linearMe` at `0dp` height with `layout_weight="1"` and `minHeight="200dp"`, but more list rows make the supposed minimum shrink until it disappears. Larkule Quirot opens this file as a layout interrogation, not a style debate: what does Android's weight measurement do with a child that asks for leftover space and a minimum at the same time?

### 32338134 - Java Multithreading for IVRS with GSM Modem rxtx (playing voice file making event listener stop working)
- URL: https://stackoverflow.com/questions/32338134/java-multithreading-for-ivrs-with-gsm-modem-rxtx-playing-voice-file-making-even
- Teaser: codefreaK's GSM modem answers the call, hears `RING`, sends `ATA`, and then the serial event listener goes quiet after the welcome audio takes the room. The file smells of old telephony hardware and busy threads: RXTX on `COM3`, `SerialPortEvent.DATA_AVAILABLE`, AT commands, `javazoom.jl.player.Player`, a spawned `play()` thread, silent `catch` blocks, and a plan to detect DTMF without starving serial I/O. Larkule Quirot cannot yet say whether the listener is blocked, masked by an exception, or simply asked to do too much in the wrong room; first he has to keep the wire awake while the voice plays.

### 32696237 - JPA with Hibernate 5: programmatically create EntityManagerFactory
- URL: https://stackoverflow.com/questions/32696237/jpa-with-hibernate-5-programmatically-create-entitymanagerfactory
- Teaser: Mike Nakis wanted a JPA `EntityManagerFactory`, not a Hibernate `SessionFactory` in a borrowed coat, and he wanted it built without XML, without Spring, and with his own `Interceptor` instance still breathing inside it. Hibernate 4.2 had left `Ejb3Configuration` marked for demolition, 4.3 forced him into `org.hibernate.jpa.internal.EntityManagerFactoryImpl`, and Hibernate 5 changed the lock again. Larkule Quirot's folder is thick with bootstrapping machinery, `PersistenceUnitDescriptor`, internal constructors, and comments about why JPA entity listeners could not replace the interceptor; the case is not whether a hack exists, but whether a clean door exists at all.

### 26656370 - GWT Editor Framework for polymorphic types
- URL: https://stackoverflow.com/questions/26656370/gwt-editor-framework-for-polymorphic-types
- Teaser: tj-recess built a tidy GWT inheritance desk: class A with common fields, B and C extending it, and reusable editors tucked into subtype editors with `@Path("")`. The flush behaves, but constraint violations multiply like bad carbon copies: one empty title becomes two messages, then three when a footer editor joins the room, and `SimpleViolation.pushViolations` shows multiple delegates answering for the same property. Larkule Quirot has no accepted answer to lean on, only comments about getters, `@Editor.Ignore`, and polymorphic editor examples that still duplicate violations; the case asks whether the framework is being misused or whether reuse itself is triggering the double exposure.

### 27647167 - Android App Crashed by using texureview
- URL: https://stackoverflow.com/questions/27647167/android-app-crashed-by-using-texureview
- Teaser: emmons gou's video view works until Android tears the window down, then `TextureView.destroySurface` calls `SurfaceTexture.detachFromGLContext` and the logcat line turns hard: `invalid current EGLContext`. The scene is a cached `TextureView` inside a `ListView`, hardware acceleration required, OpenGL knowledge thin, and a crash stack that runs from `AbsListView$RecycleBin.clear` through `ViewRootImpl.doDie`. Larkule Quirot has no answers on the page, only the shape of a lifecycle problem: a surface held in one GL context being detached under another as the list recycles its evidence.

### 30487257 - Is there a documentation on Hibernate's event types?
- URL: https://stackoverflow.com/questions/30487257/is-there-a-documentation-on-hibernates-event-types
- Teaser: Thomas did not ask for a shortcut; he asked for the missing map of thirty-five Hibernate event types and got mostly a hallway of sparse JavaDoc. His own logs make the hallway stranger: `preload` without `load`, `load` without `preload`, alternating events, subclass hints, and complex entity graphs where the order looks deterministic only after the fact. Larkule Quirot has no fix to chase here, only a documentation-shaped absence to turn into evidence: when are `PreLoadEventListener` and `LoadEventListener` actually summoned, and can their contracts be reconstructed from behavior without confusing coincidence for law?

### 14491309 - Deserializing Nested objects using RestTemplate
- URL: https://stackoverflow.com/questions/14491309/deserializing-nested-objects-using-resttemplate
- Teaser: nilesh's JSON looks ordinary until Spring's `RestTemplate` reaches the nested `response` object and Jackson snarls at `Time` as an unrecognized field. The drawer contains `jsonschema2pojo`, capitalized JSON properties, a `Date Time`, `FormHttpMessageConverter`, `HttpComponentsClientHttpRequestFactory`, and a later self-update pointing at the real split between pre-2.0 Jackson and `MappingJackson2HttpMessageConverter`. This file is less a whodunit than a lesson in old evidence: Larkule Quirot must preserve the user's own update while still treating the original failure as a replayable deserialization scene.

### 14953356 - Quartz-scheduler DB Lock Exception
- URL: https://stackoverflow.com/questions/14953356/quartz-scheduler-db-lock-exception
- Teaser: mawia moved Quartz's datasource out of `quartz.properties` and into Spring's `SchedulerFactoryBean`, and the scheduler suddenly could not find the lock named `TRIGGER_ACCESS`. The error is blunt, almost theatrical: `No row exists in table QRTZ_LOCKS`, even though the same JDBCJobStore had behaved when Quartz owned its datasource configuration. Larkule Quirot has Spring's transaction warning, `JobStoreTX`, `StdJDBCDelegate`, five manual `QRTZ_LOCKS` inserts, and an uneasy update that says the inserts worked; the mystery is why changing who supplies the datasource changes who is expected to seed the locks.

### 32205657 - Hibernate entity filters with Spring data repositories
- URL: https://stackoverflow.com/questions/32205657/hibernate-entity-filters-with-spring-data-repositories
- Teaser: francis wanted soft delete with Hibernate filters, something more flexible than `@Where`, and tried to slip the switch into every Spring Data repository call by way of an Aspect. The advice catches `EntityManager.find(..)`, unwraps the Hibernate `Session`, enables `status = 1`, and still the filter never touches the query. Larkule Quirot has a shared `EntityManager`, a Spring Boot repository boundary, an `@FilterDef`, a pointcut that may be watching the wrong doorway, and later comments pointing elsewhere; the pre-brief is to prove where a Hibernate filter must be enabled so Spring Data cannot outrun it.

### 31279000 - Java GC - Understanding TargetSurivorRatio
- URL: https://stackoverflow.com/questions/31279000/java-gc-understanding-targetsurivorratio
- Teaser: Chris had a 15 GB JVM, CMS, a 4 GB young generation, and one allocation wave large enough to shove garbage toward old gen before anyone could call it evidence. The GC log tells the story in survivor ages and thresholds: `Desired survivor size 483183816`, age-one objects jumping from 105 MB to 536 MB, `new threshold 1`, `MaxTenuringThreshold=5`, `SurvivorRatio=6`, and `TargetSurvivorRatio=90` standing accused of helping or harming. Larkule Quirot's job is to keep the numbers honest: this is not a generic tuning prayer, but a question about whether lowering the target ratio buys adaptation or steals the very survivor space the spike needs.

### 26850266 - Docker image creation exception: "This archives contains unclosed entries"
- URL: https://stackoverflow.com/questions/26850266/docker-image-creation-exception-this-archives-contains-unclosed-entries
- Teaser: Kummo's Dockerfile builds cleanly from the terminal, but the Java client chokes before Docker ever sees the case, failing while packing the build context into tar. The stack trace points through `BuildImageCmdImpl.buildDockerFolderTar`, `CompressArchiveUtil.archiveTARFiles`, and Apache Commons Compress, ending with the oddly accusatory line: `This archives contains unclosed entries.` Larkule Quirot has to inspect the context folder, docker-java's archive code, and the difference between `docker build` and `dockerClient.buildImageCmd(buildDir)`, because the Dockerfile may be innocent while the courier wrapping it is not.

### 34476223 - NoMessageBodyWriterFoundFailure: Could not find MessageBodyWriter for response object
- URL: https://stackoverflow.com/questions/34476223/nomessagebodywriterfoundfailure-could-not-find-messagebodywriter-for-response-o
- Teaser: Saurabh Mishra's REST endpoint returns a humble `Boolean`, but RESTEasy 3.0.12 tries to write it as `application/octet-stream` and walks out without a `MessageBodyWriter`. The interface says `@Consumes("application/json")`, the working jar set is RESTEasy 2.3.1 with Jackson/JAXB/Jettison, and the failing set is RESTEasy 3.0.12 without the same easy escape hatch. Larkule Quirot has one sharp comment on the file about missing `@Produces`, but no accepted closure; the case is to prove why the server chooses octet-stream and how a boolean response should announce its body before the writer goes missing.

### 25262449 - RabbitMQ Java client - How to sensibly handle exceptions and shutdowns?
- URL: https://stackoverflow.com/questions/25262449/rabbitmq-java-client-how-to-sensibly-handle-exceptions-and-shutdowns
- Teaser: bcoughlan's RabbitMQ worker pool has one fear: an `IOException` in the wrong place leaves a task unacked, stranded between broker and application like a package nobody will sign for. The file walks through `QueueingConsumer`, worker threads, `basicAck`, `ShutdownSignalException`, `AlreadyClosedException`, shutdown listeners, and auto-recovery, then tests the darkness by calling `channel.basicCancel(null)`. Larkule Quirot has a telling comment from the original poster that `IOException` does not guarantee shutdown; the case is to turn that observation into a disciplined failure policy before messages vanish into limbo.

### 23677459 - Excluding .class files from Gradle dependency
- URL: https://stackoverflow.com/questions/23677459/excluding-class-files-from-gradle-dependency
- Teaser: silverscania imported Kickflip's Android SDK and found `Base64.class` already waiting in the shadows, duplicated once in `classes.jar` and again through `commons-codec`. The build dies in dex with `Multiple dex files define Lorg/apache/commons/codec/binary/Base64;`, while the Gradle file shows old Android plugin wiring, `compile 'io.kickflip:sdk:0.9.9'`, local jar trees, Play Services, and a manifest hack to lower Kickflip's minSdk. Larkule Quirot has to prove whether this is a dependency-exclusion problem, an embedded jar problem, or an artifact that must be repacked before Gradle can stop importing the wrong body.

### 13897050 - Android AnalogClock : setting drawables programmatically
- URL: https://stackoverflow.com/questions/13897050/android-analogclock-setting-drawables-programmatically
- Teaser: QuantumFoam wanted fifteen analog clock designs without littering Android 4.0+ devices with a stack of widget XML files. `RemoteViews.setInt(..., "setDialResource", ...)` offers a tempting lever for the dial, but the clock hands stay beyond reach, leaving the widget half-disguised and half-stubborn. Larkule Quirot's pre-brief starts with `AnalogClock`, `RemoteViews`, app widget restrictions, and hidden setters: can the hands be changed at runtime, or is the old widget too sealed to wear fifteen faces cleanly?

### 14456547 - How to Unit Test handling of incoming Jersey MultiPart requests
- URL: https://stackoverflow.com/questions/14456547/how-to-unit-test-handling-of-incoming-jersey-multipart-requests
- Teaser: Pete's Jersey multipart test looks like the live client, but in the lab the first body part stays a raw `byte[]` instead of becoming the server-side `BodyPartEntity` his file handler expects. He does not want Jersey-Test or Grizzly because the Spring context matters; he wants a true unit test for the multipart reader that still passes through whatever parsing Jersey performs in production. Larkule Quirot's file has `MultiPart`, `BodyPart`, `MultiPartWriter`, `getEntityAs(BodyPartEntity.class)`, and the damning line `[B cannot be cast`; the unresolved question is how to reproduce the incoming request shape without starting the whole web machine.

### 22715285 - New Google Play Services API, Holding connection through activities
- URL: https://stackoverflow.com/questions/22715285/new-google-play-services-api-holding-connection-through-activities
- Teaser: Aeefire was migrating an Android game from the old Google Play Games client to the new API, and the old singleton `GameHelper` trick no longer fit the lock. Three activities keep passing the player between track selection, game, and summary, while achievements, sign-in prompts, and error-resolution UI still need a live activity to speak through. Larkule Quirot's pre-brief is not to accuse reconnection or singleton state too quickly; it is to map the boundary between Play Services' local client machinery, activity-bound UI, and the user's desire to carry one connection through a whole game loop.

### 22029815 - How to use the Qt Jni class "QAndroidJniObject"
- URL: https://stackoverflow.com/questions/22029815/how-to-use-the-qt-jni-class-qandroidjniobject
- Teaser: user3353801 is building a Qt Widget Android app that needs Java to place a SIP call, but `QAndroidJniObject` keeps returning an object that looks alive while every method call falls silent. The desk is crowded with Qt 5.2, `QPlatformNativeInterface`, `QtActivity`, `getApplicationContext`, a Java `SipCallSend extends Activity`, constructor signatures, `jstring` arguments, and an IDE complaining about template parameters. Larkule Quirot has one comment suggesting `QtNative.activity()` and `jobject` casts, but no answer; the case is to prove whether the failure is class loading, Activity misuse, JNI signature mismatch, or a Java exception nobody is checking.

### 33709849 - BeanCreationException: Cannot determine embedded database driver class for database type NONE
- URL: https://stackoverflow.com/questions/33709849/beancreationexception-cannot-determine-embedded-database-driver-class-for-datab
- Teaser: Mathias Mahlknecht had the MySQL driver in Gradle and a hand-built `DriverManagerDataSource` in `PersistenceJPAConfig`, yet Spring Boot still walked into `DataSourceAutoConfiguration` and claimed it could not determine an embedded database driver for type `NONE`. The stack trace points at Boot 1.2.7, `spring-boot-starter-data-jpa`, Hibernate 4.3.6, `mysql-connector-java`, and an `@Configuration` class that may be visible to JPA while invisible to auto-configuration. Larkule Quirot has zero-score answers, a possible duplicate, and a familiar Spring Boot trap; the case file stays open until the configuration boundary is reproduced, not merely named.

### 29706208 - Java 8 + Maven Javadoc plugin: Error fetching URL
- URL: https://stackoverflow.com/questions/29706208/java-8-maven-javadoc-plugin-error-fetching-url
- Teaser: Selena wanted Javadoc links that spoke plainly, not fully qualified class names marching through every sentence like witnesses reciting their addresses. Maven Javadoc Plugin 2.10.2 cannot fetch the Java 8 API URL, 2.10.3 restores Java API links, and then Selenium's third-party docs still refuse with the same `Error fetching URL` warning. Larkule Quirot has `detectLinks`, `detectOfflineLinks`, `detectJavaApiLink`, `-Xdoclint:none`, a `package-list` that exists, and a filed MJAVADOC-427 report; the case is to separate plugin defect from URL shape, Javadoc version, and Maven's own link detection habits.

### 33655627 - Empty response from server running inside Docker container
- URL: https://stackoverflow.com/questions/33655627/empty-response-from-server-running-inside-docker-container
- Teaser: Max had a server alive inside a Docker container, answering `curl` from within, but the host got only `curl: (52) Empty reply from server` through Boot2Docker's VirtualBox forwarding. The trail runs through `VBoxManage --natpf1`, `docker run -p 9000:9000`, a laptop, a VM, and a request that never reaches application logs. Larkule Quirot has one crucial comment from the original poster: binding to `0.0.0.0` fixed it; the case is to turn that clue into a clean reproduction of localhost binding inside a container, not just a remembered Docker proverb.

### 33470297 - How to make my Jersey HTTPS client connection persistent?
- URL: https://stackoverflow.com/questions/33470297/how-to-make-my-jersey-https-client-connection-persistent
- Teaser: neo11's Jersey 2.21 client sends a POST over HTTPS, receives `Connection: keep-alive`, then watches Java's `Keep-Alive-Timer` quietly close the socket before the next file can be sent. The evidence is unusually audible: `javax.net.debug=all`, TLS session caching, `HttpURLConnection 1.8.0_45`, netstat showing six to eight seconds of life, and a `close_notify` dispatched while the application is still sleeping on purpose. Larkule Quirot has no answer to cite, only later voices saying they hit the same thing; the case is to prove whether persistence belongs to Jersey, the JDK pool, the response lifecycle, or a server timeout hiding in plain sight.

### 11669722 - Disabling JPA Hibernate schema validation for a single entity
- URL: https://stackoverflow.com/questions/11669722/disabling-jpa-hibernate-schema-validation-for-a-single-entity
- Teaser: Thilo-Alexander Ginkel has a JPA class that is useful only as the result of a native query, yet Hibernate 4.1 insists on treating it like a table-backed citizen and fails startup with `Missing table: MyEntity`. The ugly escape is `List<Object[]>`, but that throws away the mapping support that made the entity tempting in the first place. Larkule Quirot has `@NamedNativeQuery`, schema validation, `persistence.xml`, zero-score answers that disable validation globally, and a later workaround that edits generated DDL; the case is whether one phantom entity can be excused without turning off the courthouse lights for every real table.

### 9927542 - Setting annotation attribute from properties file
- URL: https://stackoverflow.com/questions/9927542/setting-annotation-attribute-from-properties-file
- Teaser: bostonjava wanted an EJB `@Schedule` to read its minute value from a properties file, the kind of sensible request that Java annotations turn into a locked steel cabinet. The compiler is the first witness, warning that `Schedule.minute` must be a constant expression when `props.getScheduledMinute()` tries to step inside. Larkule Quirot's pre-brief is brief but sharp: the case is not about parsing `"*/1"` or `"*/2"`, but about whether a deployment-time schedule can be made configurable without pretending runtime properties are annotation constants.

### 29645613 - JPA 2.1 NamedSubgraph in Hibernate ignoring nested subgraphs
- URL: https://stackoverflow.com/questions/29645613/jpa-2-1-namedsubgraph-in-hibernate-ignoring-nested-subgraphs
- Teaser: edmallia's payroll model asks Hibernate 4.3.8 to walk a precise graph: Department to Employee, Employee sometimes to Manager, Manager to `fooSet`, and Foo sometimes to Bar. The annotation map is elaborate, with `@NamedEntityGraph`, `subgraphs`, `subclassSubgraphs`, JOINED inheritance, and a nested `FetchManagers.Subgraph.FooBar`, yet the generated SQL stops at employee and manager tables as if `foo` and `bar` never entered the room. Larkule Quirot has no answer on the page, only a vanished nested join; the case is to prove whether Hibernate ignores this kind of subclass subgraph or whether one name, type, or provider rule quietly invalidates the path.

### 27358851 - Android Content Provider and Gradle productFlavours
- URL: https://stackoverflow.com/questions/27358851/android-content-provider-and-gradle-productflavours
- Teaser: This dossier opens in the thin glow of a handset screen, where platform rules and app assumptions are already arguing. No answer ever took the stand, leaving the original question as an open file. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 10377704 - Spring AspectJ fails when double-proxying interface: Could not generate CGLIB subclass of class
- URL: https://stackoverflow.com/questions/10377704/spring-aspectj-fails-when-double-proxying-interface-could-not-generate-cglib-su
- Teaser: This case walks into the framework district, where proxies, channels, and endpoints can all wear someone else's coat. 1 answer came by without earning a clean verdict, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 27942679 - How do I terminate a process normally when created by ProcessBuilder?
- URL: https://stackoverflow.com/questions/27942679/how-do-i-terminate-a-process-normally-when-created-by-processbuilder
- Teaser: This dossier opens with a practical question that survived long enough to become evidence. The tags (`java` `windows` `processbuilder` `kill-process`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 11687174 - XML validation against xsd's in Java
- URL: https://stackoverflow.com/questions/11687174/xml-validation-against-xsds-in-java
- Teaser: The data has a shape, and somewhere between schema and runtime that shape starts telling a different story. Posted in 2012, it still carries 8 score, 12,067 views, and a cold signal of answers exist; top score 0. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 29230841 - How to acknowledge websocket (spring websocket + stomp + sockjs) message delivery
- URL: https://stackoverflow.com/questions/29230841/how-to-acknowledge-websocket-spring-websocket-stomp-sockjs-message-deliver
- Teaser: The first clue is a configuration that looks reasonable from across the room and suspicious under a stronger lamp. The tags (`java` `spring` `stomp` `sockjs` `spring-websocket`) name the neighborhood; the title names the locked door. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 31885618 - Cannot connect to localhost using service:jmx/rmi//..... When Using Visual VM with Tomcat within Vagrant
- URL: https://stackoverflow.com/questions/31885618/cannot-connect-to-localhost-using-servicejmx-rmi-when-using-visual-vm-wi
- Teaser: The runtime is already running when the file opens, which is exactly what makes it suspicious. Posted in 2015, it still carries 8 score, 9,019 views, and a cold signal of no answers. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 27763111 - Thread BLOCKED on org.apache.log4j.Category.callAppenders, but not waiting for any lock
- URL: https://stackoverflow.com/questions/27763111/thread-blocked-on-org-apache-log4j-category-callappenders-but-not-waiting-for-a
- Teaser: The system does not crash loudly; it hesitates, blocks, leaks, or drifts, which is the more patient kind of trouble. Posted in 2015, it still carries 10 score, 8,514 views, and a cold signal of answers exist; top score 0. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 21698128 - BIRT report with two or three-deep nested tables from POJO datasource
- URL: https://stackoverflow.com/questions/21698128/birt-report-with-two-or-three-deep-nested-tables-from-pojo-datasource
- Teaser: This dossier opens in the workshop: editors, renderers, generators, and visual APIs arranged like specialized lockpicks. The tags (`java` `eclipse` `nested` `reporting` `birt`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 31724445 - Mockito - mock for Context and getApplicationContext()
- URL: https://stackoverflow.com/questions/31724445/mockito-mock-for-context-and-getapplicationcontext
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `unit-testing` `mockito` `powermock`) name the neighborhood; the title names the locked door. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 7544979 - H2 database> How to compact / vacuum while running?
- URL: https://stackoverflow.com/questions/7544979/h2-database-how-to-compact-vacuum-while-running
- Teaser: The case arrives without ceremony: one precise Java problem, one old thread, and a silence where the answer should be. Posted in 2011, it still carries 11 score, 7,079 views, and a cold signal of no answers. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 21757191 - JDBC getUpdateCount is returning 0, but 1 row is updated, in SQL Server
- URL: https://stackoverflow.com/questions/21757191/jdbc-getupdatecount-is-returning-0-but-1-row-is-updated-in-sql-server
- Teaser: The case arrives without ceremony: one precise Java problem, one old thread, and a silence where the answer should be. Posted in 2014, it still carries 16 score, 6,967 views, and a cold signal of answers exist; top score 0. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 19999746 - Running JUnit tests with Hadoop 2.2 on Windows 7
- URL: https://stackoverflow.com/questions/19999746/running-junit-tests-with-hadoop-2-2-on-windows-7
- Teaser: The lab lights come up on mocks, runners, and assertions, all present, none yet persuasive. 1 answer came by without earning a clean verdict, leaving the original question as an open file. Until a replay speaks, this remains a cold case with java, windows, hadoop written on the folder tab.

### 28881943 - Malformed reply from SOCKS server whereas I use a HTTP proxy (with Apache HTTP library)
- URL: https://stackoverflow.com/questions/28881943/malformed-reply-from-socks-server-whereas-i-use-a-http-proxy-with-apache-http-l
- Teaser: The trail is small, specific, and stubborn, the kind of case that waits years for someone to recreate the room. No answer ever took the stand, leaving the original question as an open file. Until a replay speaks, this remains a cold case with java, proxy, apache-httpclient-4.x written on the folder tab.

### 8817813 - WebDriver getText throws exceptions
- URL: https://stackoverflow.com/questions/8817813/webdriver-gettext-throws-exceptions
- Teaser: The trail is small, specific, and stubborn, the kind of case that waits years for someone to recreate the room. 2 answers came by without earning a clean verdict, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 20100276 - Adding Spring Security JspTagLib to a Freemarker template - issues with controller unit tests
- URL: https://stackoverflow.com/questions/20100276/adding-spring-security-jsptaglib-to-a-freemarker-template-issues-with-controll
- Teaser: The first clue is a configuration that looks reasonable from across the room and suspicious under a stronger lamp. The tags (`java` `spring` `spring-security` `jsp-tags` `freemarker`) name the neighborhood; the title names the locked door. Until a replay speaks, this remains a cold case with java, spring, spring-security written on the folder tab.

### 24022125 - Spring Security: requires-channel="https" causes redirect loop
- URL: https://stackoverflow.com/questions/24022125/spring-security-requires-channel-https-causes-redirect-loop
- Teaser: The first clue is a configuration that looks reasonable from across the room and suspicious under a stronger lamp. The tags (`java` `spring` `ssl` `spring-security` `websphere`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 2749378 - When to use @Singleton in a Jersey resource
- URL: https://stackoverflow.com/questions/2749378/when-to-use-singleton-in-a-jersey-resource
- Teaser: This dossier opens at the wire, with headers, payloads, and client behavior arranged like evidence bags on a metal table. The tags (`java` `database` `web-services` `jersey`) name the neighborhood; the title names the locked door. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 13037422 - How can I set up connection with DVR and decode the data?
- URL: https://stackoverflow.com/questions/13037422/how-can-i-set-up-connection-with-dvr-and-decode-the-data
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android`) name the neighborhood; the title names the locked door. Until a replay speaks, this remains a cold case with java, android written on the folder tab.

### 26968721 - Manage Connection Pooling in multi tenant app using Hibernate
- URL: https://stackoverflow.com/questions/26968721/manage-connection-pooling-in-multi-tenant-app-using-hibernate
- Teaser: This file begins in the persistence layer, where annotations look official and the runtime still keeps its own counsel. The tags (`java` `hibernate` `multi-tenant` `c3p0`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 21934427 - EJB 3.1 Binding does not work on Websphere Application Server
- URL: https://stackoverflow.com/questions/21934427/ejb-3-1-binding-does-not-work-on-websphere-application-server
- Teaser: A server, container, or VM stands in the doorway of this case, saying very little and logging just enough to keep everyone awake. The tags (`java` `jakarta-ee` `ejb-3.1` `websphere-8`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 28573700 - JavaFx USE_COMPUTED_SIZE for Stage without using FXML
- URL: https://stackoverflow.com/questions/28573700/javafx-use-computed-size-for-stage-without-using-fxml
- Teaser: The first evidence is structural: names, fields, bytes, and wrappers that refuse to stand in the expected order. 2 answers came by without earning a clean verdict, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 13729840 - javac ignoring @SuppressWarnings("all")
- URL: https://stackoverflow.com/questions/13729840/javac-ignoring-suppresswarningsall
- Teaser: The trail is small, specific, and stubborn, the kind of case that waits years for someone to recreate the room. 1 answer came by without earning a clean verdict, leaving the original question as an open file. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 7444157 - SQLite connection pool
- URL: https://stackoverflow.com/questions/7444157/sqlite-connection-pool
- Teaser: This dossier opens in the thin glow of a handset screen, where platform rules and app assumptions are already arguing. No answer ever took the stand, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 34163634 - I'm getting javax.crypto.AEADBadTagException: Tag mismatch! when decrypting large files using AES/GCM/NoPadding
- URL: https://stackoverflow.com/questions/34163634/im-getting-javax-crypto-aeadbadtagexception-tag-mismatch-when-decrypting-larg
- Teaser: The security layer answers every question with another locked door. Posted in 2015, it still carries 7 score, 10,083 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 28345538 - JsonMappingException: Root name does not match expected
- URL: https://stackoverflow.com/questions/28345538/jsonmappingexception-root-name-does-not-match-expected
- Teaser: The service boundary is where the trail goes cold: a request enters cleanly, and the answer comes back wearing the wrong face. Posted in 2015, it still carries 6 score, 10,282 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 28065489 - Diagnosing issues with Spring WebSocket user destinations
- URL: https://stackoverflow.com/questions/28065489/diagnosing-issues-with-spring-websocket-user-destinations
- Teaser: This case walks into the framework district, where proxies, channels, and endpoints can all wear someone else's coat. No answer ever took the stand, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 31947118 - Spring SAML signature validation issue
- URL: https://stackoverflow.com/questions/31947118/spring-saml-signature-validation-issue
- Teaser: The Spring wiring hums like a city grid after rain, every bean claiming it was only following orders. Posted in 2015, it still carries 8 score, 4,436 views, and a cold signal of no answers. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 27035858 - Detect boundaries of a document in an image using opencv java
- URL: https://stackoverflow.com/questions/27035858/detect-boundaries-of-a-document-in-an-image-using-opencv-java
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2014, it still carries 9 score, 9,398 views, and a cold signal of no answers. Until a replay speaks, this remains a cold case with java, android, opencv written on the folder tab.

### 6752548 - Set line width and file type in output XML
- URL: https://stackoverflow.com/questions/6752548/set-line-width-and-file-type-in-output-xml
- Teaser: The data has a shape, and somewhere between schema and runtime that shape starts telling a different story. Posted in 2011, it still carries 8 score, 2,020 views, and a cold signal of no answers. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 6887165 - Setting up a file for download on a tomcat server.
- URL: https://stackoverflow.com/questions/6887165/setting-up-a-file-for-download-on-a-tomcat-server
- Teaser: The runtime is already running when the file opens, which is exactly what makes it suspicious. Posted in 2011, it still carries 6 score, 9,354 views, and a cold signal of no answers. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 28167740 - How to specify Git remote's URL for Maven Release plugin using standard SSH syntax?
- URL: https://stackoverflow.com/questions/28167740/how-to-specify-git-remotes-url-for-maven-release-plugin-using-standard-ssh-synt
- Teaser: The build room smells of old caches, half-read manifests, and a lifecycle that refuses to explain itself. Posted in 2015, it still carries 8 score, 4,105 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 34213003 - Change Spring WS Fault status code from 500 to 400
- URL: https://stackoverflow.com/questions/34213003/change-spring-ws-fault-status-code-from-500-to-400
- Teaser: The Spring wiring hums like a city grid after rain, every bean claiming it was only following orders. Posted in 2015, it still carries 8 score, 4,030 views, and a cold signal of no answers. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 28231312 - Using Static Nested Class in JSP Tag
- URL: https://stackoverflow.com/questions/28231312/using-static-nested-class-in-jsp-tag
- Teaser: The trail is small, specific, and stubborn, the kind of case that waits years for someone to recreate the room. No answer ever took the stand, leaving the original question as an open file. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 32275898 - Java Spring Boot: SimpMessagingTemplate send messages are not received by Stomp Endpoints
- URL: https://stackoverflow.com/questions/32275898/java-spring-boot-simpmessagingtemplate-send-messages-are-not-received-by-stomp
- Teaser: This case walks into the framework district, where proxies, channels, and endpoints can all wear someone else's coat. No answer ever took the stand, leaving the original question as an open file. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 26170281 - set of objects in avro schema
- URL: https://stackoverflow.com/questions/26170281/set-of-objects-in-avro-schema
- Teaser: This dossier opens on a document, payload, or mapping that should be ordinary, except ordinary things rarely leave this much smoke. The tags (`java` `avro`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 19376195 - Java print multiple copies but only one ends up at the printer
- URL: https://stackoverflow.com/questions/19376195/java-print-multiple-copies-but-only-one-ends-up-at-the-printer
- Teaser: This dossier opens on a document, payload, or mapping that should be ordinary, except ordinary things rarely leave this much smoke. The tags (`java` `pdf` `printing`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 29044711 - MongoDB ACKNOWLEDGED write concern faster than UNACKNOWLEDGED?
- URL: https://stackoverflow.com/questions/29044711/mongodb-acknowledged-write-concern-faster-than-unacknowledged
- Teaser: The case arrives without ceremony: one precise Java problem, one old thread, and a silence where the answer should be. Posted in 2015, it still carries 6 score, 3,371 views, and a cold signal of no answers. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 10430925 - Java thread dump prio value doesn't correspond with real thread priority on linux?
- URL: https://stackoverflow.com/questions/10430925/java-thread-dump-prio-value-doesnt-correspond-with-real-thread-priority-on-linu
- Teaser: The clue is not a line of code so much as a pattern of pressure building inside the JVM. 2 answers came by without earning a clean verdict, leaving the original question as an open file. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 28928793 - Android Bluetooth LE connection issue
- URL: https://stackoverflow.com/questions/28928793/android-bluetooth-le-connection-issue
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `bluetooth` `wear-os`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 33820732 - Android camera2 API error in call to createCaptureSession
- URL: https://stackoverflow.com/questions/33820732/android-camera2-api-error-in-call-to-createcapturesession
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2015, it still carries 5 score, 1,471 views, and a cold signal of no answers. Until a replay speaks, this remains a cold case with java, android, android-camera written on the folder tab.

### 12798265 - Handling Range content requests of a file with Java Servlet
- URL: https://stackoverflow.com/questions/12798265/handling-range-content-requests-of-a-file-with-java-servlet
- Teaser: This dossier opens at the wire, with headers, payloads, and client behavior arranged like evidence bags on a metal table. The tags (`java` `file` `servlets` `range`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 19675931 - Tomcat class loading order when serving modules without publishing
- URL: https://stackoverflow.com/questions/19675931/tomcat-class-loading-order-when-serving-modules-without-publishing
- Teaser: The runtime is already running when the file opens, which is exactly what makes it suspicious. Posted in 2013, it still carries 8 score, 3,087 views, and a cold signal of answers exist; top score 0. Until a replay speaks, this remains a cold case with java, eclipse, tomcat written on the folder tab.

### 498943 - Different form actions based on select change events
- URL: https://stackoverflow.com/questions/498943/different-form-actions-based-on-select-change-events
- Teaser: The trail is small, specific, and stubborn, the kind of case that waits years for someone to recreate the room. 1 answer came by without earning a clean verdict, leaving the original question as an open file. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 7366852 - How to set system properties through a file with Oracle's JVM
- URL: https://stackoverflow.com/questions/7366852/how-to-set-system-properties-through-a-file-with-oracles-jvm
- Teaser: The system does not crash loudly; it hesitates, blocks, leaks, or drifts, which is the more patient kind of trouble. Posted in 2011, it still carries 7 score, 2,906 views, and a cold signal of no answers. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 8253938 - What's the correct and working way to broadcast an UDP packet in Java?
- URL: https://stackoverflow.com/questions/8253938/whats-the-correct-and-working-way-to-broadcast-an-udp-packet-in-java
- Teaser: The wire carries the first whisper: a packet, a broker, a socket, or a serial line that knows more than it says. Posted in 2011, it still carries 8 score, 2,849 views, and a cold signal of answers exist; top score 0. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 32877081 - OAuth2 and email authorization for REST API backend
- URL: https://stackoverflow.com/questions/32877081/oauth2-and-email-authorization-for-rest-api-backend
- Teaser: The Spring wiring hums like a city grid after rain, every bean claiming it was only following orders. Posted in 2015, it still carries 5 score, 613 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 24644990 - camel-mongodb save java.util.Date as ISODate instead of NumberLong
- URL: https://stackoverflow.com/questions/24644990/camel-mongodb-save-java-util-date-as-isodate-instead-of-numberlong
- Teaser: This dossier opens with a practical question that survived long enough to become evidence. The tags (`java` `mongodb` `date` `apache-camel` `isodate`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 10374289 - HttpURLConnection performs always a GET request instead of a POST request in spite of setDoOutput(true) and setRequestMethod("POST")
- URL: https://stackoverflow.com/questions/10374289/httpurlconnection-performs-always-a-get-request-instead-of-a-post-request-in-spi
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2012, it still carries 9 score, 5,925 views, and a cold signal of answers exist; top score 0. Until a replay speaks, this remains a cold case with java, android, http written on the folder tab.

### 21686930 - How does IntelliJ know if a directory is a 'source' or a 'test source'?
- URL: https://stackoverflow.com/questions/21686930/how-does-intellij-know-if-a-directory-is-a-source-or-a-test-source
- Teaser: The build room smells of old caches, half-read manifests, and a lifecycle that refuses to explain itself. Posted in 2014, it still carries 10 score, 5,884 views, and a cold signal of answers exist; top score 0. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 25487092 - Setting Android proxy settings programmatically using System.Global method
- URL: https://stackoverflow.com/questions/25487092/setting-android-proxy-settings-programmatically-using-system-global-method
- Teaser: This dossier opens in the thin glow of a handset screen, where platform rules and app assumptions are already arguing. No answer ever took the stand, leaving the original question as an open file. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 34138201 - How do I add an ICC to an existing PDF document
- URL: https://stackoverflow.com/questions/34138201/how-do-i-add-an-icc-to-an-existing-pdf-document
- Teaser: The first evidence is structural: names, fields, bytes, and wrappers that refuse to stand in the expected order. No answer ever took the stand, leaving the original question as an open file. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 33729591 - Posting a file and JSON data to Spring rest service
- URL: https://stackoverflow.com/questions/33729591/posting-a-file-and-json-data-to-spring-rest-service
- Teaser: This case walks into the framework district, where proxies, channels, and endpoints can all wear someone else's coat. 4 answers came by without earning a clean verdict, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 14484657 - How do I design a generic Response builder / RESTful Web Service using Spring MVC?
- URL: https://stackoverflow.com/questions/14484657/how-do-i-design-a-generic-response-builder-restful-web-service-using-spring-mv
- Teaser: The Spring wiring hums like a city grid after rain, every bean claiming it was only following orders. Posted in 2013, it still carries 9 score, 17,571 views, and a cold signal of answers exist; top score 0. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 19706788 - jersey rest web Service with Activemq middleware integration
- URL: https://stackoverflow.com/questions/19706788/jersey-rest-web-service-with-activemq-middleware-integration
- Teaser: The API looks ordinary until the replay begins, and then the protocol starts leaving shoeprints. 1 answer came by without earning a clean verdict, leaving the original question as an open file. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 16700900 - Unexpected wrapper element when using CXF generated client
- URL: https://stackoverflow.com/questions/16700900/unexpected-wrapper-element-when-using-cxf-generated-client
- Teaser: The API looks ordinary until the replay begins, and then the protocol starts leaving shoeprints. 1 answer came by without earning a clean verdict, leaving the original question as an open file. Until a replay speaks, this remains a cold case with java, soap, wsdl written on the folder tab.

### 28348513 - How to load a yaml directly into a Map<String, Car> with SnakeYAML?
- URL: https://stackoverflow.com/questions/28348513/how-to-load-a-yaml-directly-into-a-mapstring-car-with-snakeyaml
- Teaser: The data has a shape, and somewhere between schema and runtime that shape starts telling a different story. Posted in 2015, it still carries 8 score, 19,223 views, and a cold signal of no answers. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 26621299 - Java MODBUS RTU master example code
- URL: https://stackoverflow.com/questions/26621299/java-modbus-rtu-master-example-code
- Teaser: The wire carries the first whisper: a packet, a broker, a socket, or a serial line that knows more than it says. Posted in 2014, it still carries 8 score, 17,561 views, and a cold signal of no answers. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 18680360 - Configuration failures resulting into Test skip in TestNG with no information in XMLs
- URL: https://stackoverflow.com/questions/18680360/configuration-failures-resulting-into-test-skip-in-testng-with-no-information-in
- Teaser: This dossier opens on a document, payload, or mapping that should be ordinary, except ordinary things rarely leave this much smoke. The tags (`java` `junit` `testng`) name the neighborhood; the title names the locked door. Until a replay speaks, this remains a cold case with java, junit, testng written on the folder tab.

### 5641091 - Spring 3 exception handling using JSON
- URL: https://stackoverflow.com/questions/5641091/spring-3-exception-handling-using-json
- Teaser: This case walks into the framework district, where proxies, channels, and endpoints can all wear someone else's coat. No answer ever took the stand, leaving the original question as an open file. Until a replay speaks, this remains a cold case with java, jquery, json written on the folder tab.

### 13292186 - What is the structure/pattern for android/java to organise http web service calls in the project?
- URL: https://stackoverflow.com/questions/13292186/what-is-the-structure-pattern-for-android-java-to-organise-http-web-service-call
- Teaser: This dossier opens in the thin glow of a handset screen, where platform rules and app assumptions are already arguing. 2 answers came by without earning a clean verdict, leaving the original question as an open file. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 33301036 - Gson ignore null when deserializing object
- URL: https://stackoverflow.com/questions/33301036/gson-ignore-null-when-deserializing-object
- Teaser: The data has a shape, and somewhere between schema and runtime that shape starts telling a different story. Posted in 2015, it still carries 10 score, 9,211 views, and a cold signal of answers exist; top score 0. Until a replay speaks, this remains a cold case with java, json, gson written on the folder tab.

### 13012031 - Why are all jar files not compressed in the JRE installer?
- URL: https://stackoverflow.com/questions/13012031/why-are-all-jar-files-not-compressed-in-the-jre-installer
- Teaser: The case arrives without ceremony: one precise Java problem, one old thread, and a silence where the answer should be. Posted in 2012, it still carries 8 score, 909 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether installation is suspect, witness, or just the alleyway.

### 34072774 - Android OkHttp library: GET Request - Exception EOFException: \n not found: size=0 content=
- URL: https://stackoverflow.com/questions/34072774/android-okhttp-library-get-request-exception-eofexception-n-not-found-size
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `http` `get` `okhttp`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 7220160 - Getting an EL in a Javascript file, loaded by @ResourceDependency
- URL: https://stackoverflow.com/questions/7220160/getting-an-el-in-a-javascript-file-loaded-by-resourcedependency
- Teaser: The trail is small, specific, and stubborn, the kind of case that waits years for someone to recreate the room. 1 answer came by without earning a clean verdict, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 11444609 - How to avoid code duplication using JAXB with container-like elements with a similar structure
- URL: https://stackoverflow.com/questions/11444609/how-to-avoid-code-duplication-using-jaxb-with-container-like-elements-with-a-sim
- Teaser: The data has a shape, and somewhere between schema and runtime that shape starts telling a different story. Posted in 2012, it still carries 8 score, 871 views, and a cold signal of answers exist; top score 0. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 27941522 - How to set PDF file size using PdfDocument on Android
- URL: https://stackoverflow.com/questions/27941522/how-to-set-pdf-file-size-using-pdfdocument-on-android
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `pdf`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 15992882 - Android SearchView empty string
- URL: https://stackoverflow.com/questions/15992882/android-searchview-empty-string
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2013, it still carries 8 score, 7,761 views, and a cold signal of answers exist; top score 0. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 31011354 - Effectively get line numbers in java source code at compile time
- URL: https://stackoverflow.com/questions/31011354/effectively-get-line-numbers-in-java-source-code-at-compile-time
- Teaser: The case opens where many Java mysteries learn to hide: between declared intent and the classpath that actually arrives. 1 answer came by without earning a clean verdict, leaving the original question as an open file. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 11960961 - What causes the JSessionID changing with every request?
- URL: https://stackoverflow.com/questions/11960961/what-causes-the-jsessionid-changing-with-every-request
- Teaser: The runtime is already running when the file opens, which is exactly what makes it suspicious. Posted in 2012, it still carries 6 score, 7,453 views, and a cold signal of no answers. Until a replay speaks, this remains a cold case with java, jsf, jakarta-ee written on the folder tab.

### 14556569 - Make sure photos are saved with the same orientation they were taken?
- URL: https://stackoverflow.com/questions/14556569/make-sure-photos-are-saved-with-the-same-orientation-they-were-taken
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `camera` `arrays` `photo`) name the neighborhood; the title names the locked door. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 21339686 - Eclipse setting to leave Java static imports alone?
- URL: https://stackoverflow.com/questions/21339686/eclipse-setting-to-leave-java-static-imports-alone
- Teaser: The trail runs through tooling, where the IDE or graphics stack smiles politely and does something else. Posted in 2014, it still carries 7 score, 1,551 views, and a cold signal of no answers. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 21986976 - IabHelper Android bug (NullPointerException) launchPurchaseFlow?
- URL: https://stackoverflow.com/questions/21986976/iabhelper-android-bug-nullpointerexception-launchpurchaseflow
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2014, it still carries 8 score, 1,509 views, and a cold signal of no answers. Until a replay speaks, this remains a cold case with java, android, nullpointerexception written on the folder tab.

### 31059947 - EC2 Storm cluster Netty problems
- URL: https://stackoverflow.com/questions/31059947/ec2-storm-cluster-netty-problems
- Teaser: The wire carries the first whisper: a packet, a broker, a socket, or a serial line that knows more than it says. Posted in 2015, it still carries 8 score, 1,474 views, and a cold signal of no answers. Until a replay speaks, this remains a cold case with java, amazon-ec2, netty written on the folder tab.

### 34427522 - Better way to match list of strings using JsonPath and Hamcrest Matchers
- URL: https://stackoverflow.com/questions/34427522/better-way-to-match-list-of-strings-using-jsonpath-and-hamcrest-matchers
- Teaser: The API looks ordinary until the replay begins, and then the protocol starts leaving shoeprints. No answer ever took the stand, leaving the original question as an open file. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 32448791 - Passing a custom java security policy file to surefire maven test fails, results in access control error for everything
- URL: https://stackoverflow.com/questions/32448791/passing-a-custom-java-security-policy-file-to-surefire-maven-test-fails-results
- Teaser: A dependency graph lies across the desk like a city map with one street missing at midnight. The tags (`java` `maven` `security` `surefire`) name the neighborhood; the title names the locked door. Until a replay speaks, this remains a cold case with java, maven, security written on the folder tab.

### 32195856 - Searching a grid of points, visting each point once only
- URL: https://stackoverflow.com/questions/32195856/searching-a-grid-of-points-visting-each-point-once-only
- Teaser: The case arrives without ceremony: one precise Java problem, one old thread, and a silence where the answer should be. Posted in 2015, it still carries 7 score, 1,353 views, and a cold signal of answers exist; top score 0. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 27319423 - Gradle transitive dependency to JAR inside of a library module
- URL: https://stackoverflow.com/questions/27319423/gradle-transitive-dependency-to-jar-inside-of-a-library-module
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `jar` `gradle`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 21235807 - Eclipse - Find Java references of a library without attached sources
- URL: https://stackoverflow.com/questions/21235807/eclipse-find-java-references-of-a-library-without-attached-sources
- Teaser: The trail runs through tooling, where the IDE or graphics stack smiles politely and does something else. Posted in 2014, it still carries 11 score, 5,975 views, and a cold signal of answers exist; top score 0. Until a replay speaks, this remains a cold case with java, eclipse, eclipse-jdt written on the folder tab.

### 33770972 - Cannot Delete an alias from the KeyStore - keyStore.store throws UnsupportedOperationException
- URL: https://stackoverflow.com/questions/33770972/cannot-delete-an-alias-from-the-keystore-keystore-store-throws-unsupportedoper
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2015, it still carries 11 score, 1,278 views, and a cold signal of no answers. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 21437450 - Cannot recover from org.omg.CORBA.TRANSIENT (becomes permanent)
- URL: https://stackoverflow.com/questions/21437450/cannot-recover-from-org-omg-corba-transient-becomes-permanent
- Teaser: This case begins where distributed systems become weather, with clients and brokers trading signals through fog. The tags (`java` `corba`) name the neighborhood; the title names the locked door. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 10570702 - Launch4j jre required error
- URL: https://stackoverflow.com/questions/10570702/launch4j-jre-required-error
- Teaser: The build room smells of old caches, half-read manifests, and a lifecycle that refuses to explain itself. Posted in 2012, it still carries 6 score, 5,793 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 30121485 - The connection pool for database has been unable to grant a connection to thread 602 (Binder_2) with flags 0x1
- URL: https://stackoverflow.com/questions/30121485/the-connection-pool-for-database-has-been-unable-to-grant-a-connection-to-thread
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2015, it still carries 8 score, 2,648 views, and a cold signal of no answers. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 31729516 - spring-boot camel case nested property as environment variable
- URL: https://stackoverflow.com/questions/31729516/spring-boot-camel-case-nested-property-as-environment-variable
- Teaser: The Spring wiring hums like a city grid after rain, every bean claiming it was only following orders. Posted in 2015, it still carries 8 score, 5,569 views, and a cold signal of answers exist; top score 0. Until a replay speaks, this remains a cold case with java, spring-boot, environment-variables written on the folder tab.

### 27322150 - How should a custom Guice scope be integrated with TestNG?
- URL: https://stackoverflow.com/questions/27322150/how-should-a-custom-guice-scope-be-integrated-with-testng
- Teaser: The test bench is set, but the witness will not repeat the story cleanly. Posted in 2014, it still carries 12 score, 540 views, and a cold signal of answers exist; top score 0. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 13372337 - Annotation @RolesAllowed does not work on Web Service deployed in Tomcat 7.0.32
- URL: https://stackoverflow.com/questions/13372337/annotation-rolesallowed-does-not-work-on-web-service-deployed-in-tomcat-7-0-32
- Teaser: The service boundary is where the trail goes cold: a request enters cleanly, and the answer comes back wearing the wrong face. Posted in 2012, it still carries 6 score, 1,150 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 23553053 - Can't get OpenCV to work with Java+Maven+IntelliJ
- URL: https://stackoverflow.com/questions/23553053/cant-get-opencv-to-work-with-javamavenintellij
- Teaser: A dependency graph lies across the desk like a city map with one street missing at midnight. The tags (`java` `maven` `opencv` `intellij-idea` `maven-3`) name the neighborhood; the title names the locked door. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 30653213 - Samza/Kafka Failed to Update Metadata
- URL: https://stackoverflow.com/questions/30653213/samza-kafka-failed-to-update-metadata
- Teaser: This case begins where distributed systems become weather, with clients and brokers trading signals through fog. The tags (`java` `metadata` `apache-kafka` `apache-samza`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 26489195 - Android BigInteger ArithmeticException
- URL: https://stackoverflow.com/questions/26489195/android-biginteger-arithmeticexception
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2014, it still carries 13 score, 1,110 views, and a cold signal of answers exist; top score 0. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 21587844 - Hibernate unsaved-value annotation
- URL: https://stackoverflow.com/questions/21587844/hibernate-unsaved-value-annotation
- Teaser: The database lamp is on, but the objects in the room do not all agree about who they are. Posted in 2014, it still carries 6 score, 5,103 views, and a cold signal of no answers. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 32047440 - Different benchmarking results between forks in JMH
- URL: https://stackoverflow.com/questions/32047440/different-benchmarking-results-between-forks-in-jmh
- Teaser: This file opens in the machinery room: threads, heaps, locks, and timings knocking in the dark. The tags (`java` `performance` `benchmarking` `jmh`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 30173709 - JNI - SetByteArrayRegion does not work
- URL: https://stackoverflow.com/questions/30173709/jni-setbytearrayregion-does-not-work
- Teaser: This dossier opens with a practical question that survived long enough to become evidence. The tags (`java` `c` `java-native-interface` `jniwrapper`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 18054059 - Tomcat 6.0.28 Unresponsive Because of Blocked Threads During Soak Test
- URL: https://stackoverflow.com/questions/18054059/tomcat-6-0-28-unresponsive-because-of-blocked-threads-during-soak-test
- Teaser: A server, container, or VM stands in the doorway of this case, saying very little and logging just enough to keep everyone awake. The tags (`java` `multithreading` `tomcat` `garbage-collection` `deadlock`) name the neighborhood; the title names the locked door. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 30880478 - Eclipse uses old PATH variable to execute command line process in Gradle Task?
- URL: https://stackoverflow.com/questions/30880478/eclipse-uses-old-path-variable-to-execute-command-line-process-in-gradle-task
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `eclipse` `groovy` `gradle`) name the neighborhood; the title names the locked door. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 32801536 - JavaPoet + Android Studio "addModifiers(Modifier) cannot be applied to Modifier"
- URL: https://stackoverflow.com/questions/32801536/javapoet-android-studio-addmodifiersmodifier-cannot-be-applied-to-modifier
- Teaser: This dossier opens in the thin glow of a handset screen, where platform rules and app assumptions are already arguing. 1 answer came by without earning a clean verdict, leaving the original question as an open file. Until a replay speaks, this remains a cold case with java, android, intellij-idea written on the folder tab.

### 33987245 - CameraDevice failing to create session [Camera2]
- URL: https://stackoverflow.com/questions/33987245/cameradevice-failing-to-create-session-camera2
- Teaser: The case starts under the hard light of an emulator window, where Android behaves like a witness with a perfect memory and terrible timing. Posted in 2015, it still carries 10 score, 4,790 views, and a cold signal of answers exist; top score 0. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 33318257 - Spring Data JPA - Custom Sort in JpaRepository
- URL: https://stackoverflow.com/questions/33318257/spring-data-jpa-custom-sort-in-jparepository
- Teaser: This file begins in the persistence layer, where annotations look official and the runtime still keeps its own counsel. The tags (`java` `spring` `jpa` `spring-data` `spring-data-jpa`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 31784658 - How can I loop through all RGB combinations in rainbow order in Java?
- URL: https://stackoverflow.com/questions/31784658/how-can-i-loop-through-all-rgb-combinations-in-rainbow-order-in-java
- Teaser: This dossier opens in the workshop: editors, renderers, generators, and visual APIs arranged like specialized lockpicks. The tags (`java` `loops` `colors` `rgb`) name the neighborhood; the title names the locked door. Until a replay speaks, this remains a cold case with java, loops, colors written on the folder tab.

### 28100218 - Is there any characters/bytes limit in the Android clipboard? [Android development]
- URL: https://stackoverflow.com/questions/28100218/is-there-any-characters-bytes-limit-in-the-android-clipboard-android-developme
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `eclipse` `string` `clipboard`) name the neighborhood; the title names the locked door. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 25347892 - How can I add shadow to ImageButton?
- URL: https://stackoverflow.com/questions/25347892/how-can-i-add-shadow-to-imagebutton
- Teaser: This dossier opens in the thin glow of a handset screen, where platform rules and app assumptions are already arguing. 1 answer came by without earning a clean verdict, leaving the original question as an open file. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 12785052 - java.lang.NoClassDefFoundError: Could not initialize class com.sun.xml.internal.ws.fault.SOAPFaultBuilder
- URL: https://stackoverflow.com/questions/12785052/java-lang-noclassdeffounderror-could-not-initialize-class-com-sun-xml-internal
- Teaser: This dossier opens at the wire, with headers, payloads, and client behavior arranged like evidence bags on a metal table. The tags (`java` `soap` `jboss` `jax-ws`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 33365237 - Java VM fails with heap size increase
- URL: https://stackoverflow.com/questions/33365237/java-vm-fails-with-heap-size-increase
- Teaser: The clue is not a line of code so much as a pattern of pressure building inside the JVM. No answer ever took the stand, leaving the original question as an open file. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 27356794 - OptimisticLockException in pessimistic locking
- URL: https://stackoverflow.com/questions/27356794/optimisticlockexception-in-pessimistic-locking
- Teaser: This file begins in the persistence layer, where annotations look official and the runtime still keeps its own counsel. The tags (`java` `spring` `hibernate` `jakarta-ee`) name the neighborhood; the title names the locked door. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 26933928 - Usable lock-files in Java
- URL: https://stackoverflow.com/questions/26933928/usable-lock-files-in-java
- Teaser: The system does not crash loudly; it hesitates, blocks, leaks, or drifts, which is the more patient kind of trouble. Posted in 2014, it still carries 1 score, 407 views, and a cold signal of no answers. The opening move is to reconstruct the scene carefully, then let evidence decide whether java is suspect, witness, or just the alleyway.

### 26933374 - LinkageError using lucene with spring redeploying on tomcat or weblogic
- URL: https://stackoverflow.com/questions/26933374/linkageerror-using-lucene-with-spring-redeploying-on-tomcat-or-weblogic
- Teaser: This case walks into the framework district, where proxies, channels, and endpoints can all wear someone else's coat. No answer ever took the stand, leaving the original question as an open file. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

### 26921457 - memory & disk cache with JCS 1.3
- URL: https://stackoverflow.com/questions/26921457/memory-disk-cache-with-jcs-1-3
- Teaser: The clue is not a line of code so much as a pattern of pressure building inside the JVM. No answer ever took the stand, leaving the original question as an open file. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 26929298 - Background thread factory pattern
- URL: https://stackoverflow.com/questions/26929298/background-thread-factory-pattern
- Teaser: On the mobile bench, the device logs are quiet until the one gesture that matters, then everything begins to blink. The tags (`java` `android` `multithreading` `factory`) name the neighborhood; the title names the locked door. Until a replay speaks, this remains a cold case with java, android, multithreading written on the folder tab.

### 26927833 - Is it possible to clone a git repository using ssh/git protocol from KIE Drools Workbench
- URL: https://stackoverflow.com/questions/26927833/is-it-possible-to-clone-a-git-repository-using-ssh-git-protocol-from-kie-drools
- Teaser: The trail is small, specific, and stubborn, the kind of case that waits years for someone to recreate the room. No answer ever took the stand, leaving the original question as an open file. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 26919612 - Avoid duplicates when eager loading from hibernate with shared objects?
- URL: https://stackoverflow.com/questions/26919612/avoid-duplicates-when-eager-loading-from-hibernate-with-shared-objects
- Teaser: This file begins in the persistence layer, where annotations look official and the runtime still keeps its own counsel. The tags (`java` `hibernate` `design-patterns` `orm`) name the neighborhood; the title names the locked door. The case file begins here, before the fix, before the flourish, with the original uncertainty still intact.

### 26922710 - java.lang.NoSuchFieldError: com/ibm/ws/ssl/core/Constants.ALL_PROTOCOLS
- URL: https://stackoverflow.com/questions/26922710/java-lang-nosuchfielderror-com-ibm-ws-ssl-core-constants-all-protocols
- Teaser: The security layer answers every question with another locked door. Posted in 2014, it still carries 0 score, 892 views, and a cold signal of no answers. Larkule Quirot enters with a notebook, not a verdict: first preserve the clues, then make the machine repeat them.

### 26923554 - Heroku app crashes on boot timeout (60 seconds) but app started in 30 seconds
- URL: https://stackoverflow.com/questions/26923554/heroku-app-crashes-on-boot-timeout-60-seconds-but-app-started-in-30-seconds
- Teaser: The first clue is a configuration that looks reasonable from across the room and suspicious under a stronger lamp. The tags (`java` `spring` `heroku` `timeout`) name the neighborhood; the title names the locked door. Until a replay speaks, this remains a cold case with java, spring, heroku written on the folder tab.
