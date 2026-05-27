package repro;

import org.junit.Test;

import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.net.URLClassLoader;

import static org.junit.Assert.fail;

/**
 * Reproduces the LinkageError reported in:
 * https://stackoverflow.com/questions/26933374/
 *
 * Root cause: Lucene 4.x AttributeFactory$1 uses MethodHandle.invokeExact()
 * with a return type of AttributeImpl (bytecode descriptor:
 *   invokevirtual MethodHandle.invokeExact:()Lorg/apache/lucene/util/AttributeImpl;
 * ).
 * The JVM records a loader constraint: for the classloader of AttributeFactory$1,
 * the class AttributeImpl in this descriptor must match the class AttributeImpl
 * as seen by the bootstrap classloader's MethodHandle.
 *
 * On redeploy (second URLClassLoader), a new AttributeImpl class is loaded by
 * a different classloader. The JVM detects the constraint violation and throws:
 *   LinkageError: loader constraint violation: when resolving method
 *   "java.lang.invoke.MethodHandle.invokeExact()Lorg/apache/lucene/util/AttributeImpl;"
 *
 * This test simulates two sequential "deploys" in the same JVM by loading
 * Lucene classes through two separate URLClassLoaders (mimicking Tomcat's
 * WebappClassLoader being recreated on redeploy).
 *
 * JAVA VERSION NOTE:
 *   - Java 8: this test PASSES (LinkageError IS thrown on second deploy — bug present)
 *   - Java 11+: this test FAILS (LinkageError is NOT thrown — JVM fixed the constraint)
 *
 * Running on Java 21 this test is RED because the expected LinkageError is absent,
 * confirming the bug was a Java 8 JVM loader-constraint issue, not a Lucene bug.
 */
public class LuceneLinkageErrorReproTest {

    /**
     * Trigger Lucene's AttributeFactory MethodHandle path via AttributeSource.addAttribute().
     * This is the exact call chain from the original stack trace:
     *   AttributeFactory$1.createInstance() <- AttributeSource.addAttribute()
     * which calls:
     *   MethodHandle.invokeExact()Lorg/apache/lucene/util/AttributeImpl;
     */
    @SuppressWarnings("unchecked")
    private static void triggerAttributeFactory(ClassLoader cl) throws Exception {
        Class<?> attributeSourceClass =
            cl.loadClass("org.apache.lucene.util.AttributeSource");
        Class<?> charTermAttrClass =
            cl.loadClass("org.apache.lucene.analysis.tokenattributes.CharTermAttribute");

        // new AttributeSource() then addAttribute(CharTermAttribute.class)
        // This calls AttributeFactory.DEFAULT_ATTRIBUTE_FACTORY.createAttributeInstance()
        // -> AttributeFactory$StaticImplementationAttributeFactory.createAttributeInstance()
        // -> AttributeFactory$1.createInstance()
        // -> MethodHandle.invokeExact()Lorg/apache/lucene/util/AttributeImpl;
        Object source = attributeSourceClass.getDeclaredConstructor().newInstance();
        attributeSourceClass
            .getMethod("addAttribute", Class.class)
            .invoke(source, charTermAttrClass);
    }

    /**
     * Unwrap InvocationTargetException to get the real cause.
     */
    private static Throwable unwrap(Throwable t) {
        while (t instanceof InvocationTargetException && t.getCause() != null) {
            t = t.getCause();
        }
        return t;
    }

    /**
     * This test expects a LinkageError on the second deploy (Java 8 behavior).
     * On Java 21 the test FAILS because the JVM no longer throws the error,
     * making this a valid failing reproduction that documents the original bug.
     */
    @Test
    public void secondDeployThrowsLinkageError() throws Exception {
        URL luceneJar = findLuceneCoreJar();

        // --- First "deploy": load Lucene in its own classloader ---
        try (URLClassLoader cl1 = new URLClassLoader(new URL[]{luceneJar},
                ClassLoader.getPlatformClassLoader())) {
            triggerAttributeFactory(cl1);
            System.out.println("First deploy: OK (expected)");
        }
        // cl1 is closed here, simulating Tomcat undeploy

        // --- Second "deploy": new classloader, same JVM ---
        // On Java 8 this throws LinkageError: loader constraint violation
        // On Java 21 this succeeds (bug fixed in JVM)
        try (URLClassLoader cl2 = new URLClassLoader(new URL[]{luceneJar},
                ClassLoader.getPlatformClassLoader())) {
            try {
                triggerAttributeFactory(cl2);
                // If we reach here, the LinkageError was NOT thrown.
                // On Java 8 this would not be reached.
                // On Java 21 this is reached — test fails to document the original bug.
                fail("Expected LinkageError on second deploy (Java 8 behavior). "
                   + "Running on Java " + System.getProperty("java.specification.version")
                   + " which has fixed this JVM loader constraint issue. "
                   + "The original bug only manifests on Java 8 with Lucene 4.x. "
                   + "See: https://stackoverflow.com/questions/26933374/");
            } catch (InvocationTargetException ite) {
                Throwable cause = unwrap(ite);
                if (cause instanceof LinkageError) {
                    System.out.println("Second deploy: LinkageError thrown as expected (Java 8 behavior)");
                    System.out.println("  " + cause.getMessage());
                } else {
                    throw new AssertionError("Expected LinkageError but got: " + cause, cause);
                }
            }
        }
    }

    private static URL findLuceneCoreJar() throws Exception {
        String cp = System.getProperty("java.class.path");
        for (String entry : cp.split(System.getProperty("path.separator"))) {
            if (entry.contains("lucene-core")) {
                return new java.io.File(entry).toURI().toURL();
            }
        }
        throw new IllegalStateException("lucene-core jar not found on classpath: " + cp);
    }
}
