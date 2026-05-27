# LinkageError using lucene with spring redeploying on tomcat or weblogic

Source: https://stackoverflow.com/questions/26933374/linkageerror-using-lucene-with-spring-redeploying-on-tomcat-or-weblogic

- Posted: 2014-11-14
- Score: 0
- Views: 697
- Answers: 0
- Cold signal: No answers
- Tags: `java` `spring` `spring-mvc` `tomcat` `lucene`
- Original poster: Tulio C (https://stackoverflow.com/users/2642037/tulio-c)

## Narrative Teaser

This case walks into the framework district, where proxies, channels, and endpoints can all wear someone else's coat. No answer ever took the stand, leaving the original question as an open file. The dossier asks for no leap of faith, only a reproduction sturdy enough to survive the next interrogation.

## Preserved Case Text

I have a service that reads a csv file and answers queries from that data using lucene. The service-module works perfectly stand alone and in the unit-tests. The service uses spring to create all lucene classes (directory, analyzer ...see below the ServiceConfig).

That services is used by a spring-rest web-application. When deploying the first time in tomcat or weblogic it works fine. BUT when I try to redeploy it, it cannot load the spring-context again with the following error:

2014-11-14 13:59:57,261 MyService#1.0-SNAPSHOT 750 ERROR org.springframework.web.context.ContextLoader - Context initialization failedorg.springframework.beans.factory.BeanCreationException: Error creating bean with name 'csvReader' defined in class de.camminati.config.ServiceConfig: Invocation of init method failed; nested exception is java.lang.LinkageError: loader constraint violation: when resolving method "java.lang.invoke.MethodHandle.invokeExact()Lorg/apache/lucene/util/AttributeImpl;" the class loader (instance of org/apache/catalina/loader/WebappClassLoader) of the current class, org/apache/lucene/util/AttributeFactory$1, and the class loader (instance of <bootloader>) for resolved class, java/lang/invoke/MethodHandle, have different Class objects for the type ; used in the signature
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1514)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:521)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:458)
at org.springframework.beans.factory.support.AbstractBeanFactory$1.getObject(AbstractBeanFactory.java:293)
at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:223)
at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:290)
at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:191)
at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:636)
at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:934)
at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:479)
at org.springframework.web.context.ContextLoader.configureAndRefreshWebApplicationContext(ContextLoader.java:410)
at org.springframework.web.context.ContextLoader.initWebApplicationContext(ContextLoader.java:306)
at org.springframework.web.context.ContextLoaderListener.contextInitialized(ContextLoaderListener.java:112)
at org.apache.catalina.core.StandardContext.listenerStart(StandardContext.java:4973)
at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:5467)
at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:150)
at org.apache.catalina.core.ContainerBase.addChildInternal(ContainerBase.java:901)
at org.apache.catalina.core.ContainerBase.addChild(ContainerBase.java:877)
at org.apache.catalina.core.StandardHost.addChild(StandardHost.java:632)
at org.apache.catalina.startup.HostConfig.deployWAR(HostConfig.java:1073)
at org.apache.catalina.startup.HostConfig.deployApps(HostConfig.java:553)
at org.apache.catalina.startup.HostConfig.check(HostConfig.java:1648)
at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:57)
at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
at java.lang.reflect.Method.invoke(Method.java:601)
at org.apache.tomcat.util.modeler.BaseModelMBean.invoke(BaseModelMBean.java:301)
at com.sun.jmx.interceptor.DefaultMBeanServerInterceptor.invoke(DefaultMBeanServerInterceptor.java:819)
at com.sun.jmx.mbeanserver.JmxMBeanServer.invoke(JmxMBeanServer.java:791)
at org.apache.catalina.manager.ManagerServlet.check(ManagerServlet.java:1496)
at org.apache.catalina.manager.ManagerServlet.deploy(ManagerServlet.java:709)
at org.apache.catalina.manager.ManagerServlet.doPut(ManagerServlet.java:450)
at javax.servlet.http.HttpServlet.service(HttpServlet.java:649)
at javax.servlet.http.HttpServlet.service(HttpServlet.java:727)
at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:303)
at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:208)
at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:52)
at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:241)
at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:208)
at org.apache.catalina.filters.SetCharacterEncodingFilter.doFilter(SetCharacterEncodingFilter.java:108)
at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:241)
at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:208)
at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:220)
at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:122)
at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:610)
at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:170)
at com.googlecode.psiprobe.Tomcat70AgentValve.invoke(Tomcat70AgentValve.java:38)
at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:98)
at org.apache.catalina.valves.AccessLogValve.invoke(AccessLogValve.java:950)
at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:116)
at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:408)
at org.apache.coyote.http11.AbstractHttp11Processor.process(AbstractHttp11Processor.java:1040)
at org.apache.coyote.AbstractProtocol$AbstractConnectionHandler.process(AbstractProtocol.java:607)
at org.apache.tomcat.util.net.AprEndpoint$SocketProcessor.doRun(AprEndpoint.java:2441)
at org.apache.tomcat.util.net.AprEndpoint$SocketProcessor.run(AprEndpoint.java:2430)
at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1110)
at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:603)
at java.lang.Thread.run(Thread.java:722)
Caused by: java.lang.LinkageError: loader constraint violation: when resolving method "java.lang.invoke.MethodHandle.invokeExact()Lorg/apache/lucene/util/AttributeImpl;" the class loader (instance of org/apache/catalina/loader/WebappClassLoader) of the current class, org/apache/lucene/util/AttributeFactory$1, and the class loader (instance of <bootloader>) for resolved class, java/lang/invoke/MethodHandle, have different Class objects for the type ; used in the signature
at org.apache.lucene.util.AttributeFactory$1.createInstance(AttributeFactory.java:140)
at org.apache.lucene.util.AttributeFactory$StaticImplementationAttributeFactory.createAttributeInstance(AttributeFactory.java:103)
at org.apache.lucene.util.AttributeSource.addAttribute(AttributeSource.java:222)
at org.apache.lucene.analysis.core.KeywordTokenizer.<init>(KeywordTokenizer.java:37)
at org.apache.lucene.analysis.core.KeywordTokenizer.<init>(KeywordTokenizer.java:41)
at org.apache.lucene.analysis.core.KeywordAnalyzer.createComponents(KeywordAnalyzer.java:34)
at org.apache.lucene.analysis.Analyzer.tokenStream(Analyzer.java:182)
at org.apache.lucene.document.Field.tokenStream(Field.java:554)
at org.apache.lucene.index.DefaultIndexingChain$PerField.invert(DefaultIndexingChain.java:611)
at org.apache.lucene.index.DefaultIndexingChain.processField(DefaultIndexingChain.java:359)
at org.apache.lucene.index.DefaultIndexingChain.processDocument(DefaultIndexingChain.java:318)
at org.apache.lucene.index.DocumentsWriterPerThread.updateDocument(DocumentsWriterPerThread.java:239)
at org.apache.lucene.index.DocumentsWriter.updateDocument(DocumentsWriter.java:454)
at org.apache.lucene.index.IndexWriter.updateDocument(IndexWriter.java:1511)
at org.apache.lucene.index.IndexWriter.addDocument(IndexWriter.java:1246)
at org.apache.lucene.index.IndexWriter.addDocument(IndexWriter.java:1231)
at de.camminati.csv.CSVReader.readData(CSVReader.java:54)
at de.camminati.csv.CSVReader.afterPropertiesSet(CSVReader.java:62)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1573)
at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1511)
... 57 more

So basically, it cannot reload because the objects are not being destroyed completely, because lucene does something fishy with the class loader (some Thread-operations I guess) and cannot be accessed again from the class loader that spring is using.

Here is my ServiceConfig.class:

@Configuration
@Slf4j
public class ServiceConfig {

  @Bean
  @Value("classpath:/data.csv")
  public java.io.InputStream cvsInputStream(Resource vpknCSV) throws IOException {
    return vpknCSV.getInputStream();
  }

  @Bean
  public Analyzer analyzer() {
    return new KeywordAnalyzer();
  }

  @Bean(name = "directory")
  public Directory directory() throws IOException {
    return new RAMDirectory();
  }

  @Bean
  public IndexWriter indexWriter(Directory directory, Analyzer analyzer) throws IOException {
    IndexWriterConfig config = new IndexWriterConfig(Version.LUCENE_4_10_2, analyzer);
    config.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);
    return new IndexWriter(directory, config);
  }

  @Bean
  @DependsOn("indexWriter")
  public CSVReader csvReader() {
    return new CSVReader();
  }

  @Bean
  @DependsOn("csvReader")
  public IndexSearcher indexSearcher(Directory directory) throws IOException {
    return new IndexSearcher(DirectoryReader.open(directory));
  }
}

And the CSVReader.java:

public class CSVReader implements InitializingBean, DisposableBean {

  @Autowired
  InputStream csvInputStream;
  @Autowired
  IndexWriter indexWriter;

  private ApplicationContext appContext;

  public void readData() throws IOException {
    CSVParser csvParser = new CSVParser(new InputStreamReader(csvInputStream), CSVFormat.EXCEL.withDelimiter(';').withIgnoreEmptyLines(true));
    for (CSVRecord record : csvParser.getRecords()) {

      Document doc = new Document();
      doc.add(...);
      indexWriter.addDocument(doc);
    }
    indexWriter.close();
  }
  @Override
  public void afterPropertiesSet() throws IOException {
    readData();
  }

  @Override
  public void destroy() throws Exception {
    log.info("Closing from destroy().....");
    csvInputStream.close();
    log.info("Closing from destroy().....done!");
  }
}

And the Service.class:

@Service
@Slf4j
public class Service {

  @Autowired(required = true)
  @Qualifier(("directory"))
  Directory directory;
  @Autowired
  Analyzer analyzer;
  @Autowired
  IndexSearcher indexSearcher;

  private final int MAX_HITS = 45000;

  @Override
  protected void finalize() throws IOException {
    directory.close();
  }

  public boolean existsInIndex(String input, String index) throws ParseException, IOException {
    QueryParser parser = new QueryParser(Version.LUCENE_4_10_2, index, analyzer);
    Query query = parser.parse("\"" + parser.escape(input) + "\"");
    ScoreDoc[] hits = indexSearcher.search(query, null, MAX_HITS).scoreDocs;
    return (hits.length > 0) ? true : false;
  }
}

Any ideas why it would run only exactly once? And any ideas how to fix it?

## Expected Evidence

Executable test or integration harness showing the original behavior and the fixed behavior.

## Risk Hints

- No unusual risk hints detected from tags/title.
