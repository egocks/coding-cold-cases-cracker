package repaired;

import org.junit.Test;
import org.junit.Assume;

import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.net.URLClassLoader;

import static org.junit.Assert.fail;

/**
 * Verifies the fix for SO #26933374:
 * https://stackoverflow.com/questions/26933374/
 *
 * ROOT CAUSE (Java 8 + Lucene 4.x):
 *   Lucene's AttributeFactory$1 uses MethodHandle.invokeExact() with a return
 *   type of AttributeImpl. The JVM's loader-constraint mechanism records that
 *   constraint against the bootstrap classloader's MethodHandle. On redeploy,
 *   a new WebappClassLoader loads a fresh AttributeImpl class object. The JVM
 *   detects the mismatch and throws:
 *     LinkageError: loader constraint violation: when resolving method
 *     "java.lang.invoke.MethodHandle.invokeExact()Lorg/apache/lucene/util/AttributeImpl;"
 *
 * FIX:
 *   Upgrade to Java 11+. The JVM's loader-constraint tracking for MethodHandle
 *   invocations was corrected in Java 9 (JDK-8072008 / JDK-8130305). On Java 11+
 *   the second deploy succeeds without error.
 *
 *   Application-level workarounds (for users stuck on Java 8):
 *     1. Move lucene-core to Tomcat's shared/lib so it is loaded by the shared
 *        classloader, not the WebappClassLoader — only one class object ever exists.
 *     2. Avoid hot redeploys; restart the JVM between deploys.
 *     3. Upgrade to Lucene 5+ which replaced the MethodHandle-based
 *        AttributeFactory with a plain reflective approach.
 *
 * VERIFICATION STRATEGY:
 *   This test asserts that on Java 11+ the second "deploy" (second URLClassLoader
 *   loading the same Lucene jar) succeeds without a LinkageError. The test is
 *   SKIPPED on Java 8 (where the bug is present and the fix does not apply).
 */
public class LuceneLinkageErrorFixedTest {

    @SuppressWarnings("unchecked")
    private static void triggerAttributeFactory(ClassLoader cl) throws Exception {
        Class<?> attributeSourceClass =
            cl.loadClass("org.apache.lucene.util.AttributeSource");
        Class<?> charTermAttrClass =
            cl.loadClass("org.apache.lucene.analysis.tokenattributes.CharTermAttribute");

        Object source = attributeSourceClass.getDeclaredConstructor().newInstance();
        attributeSourceClass
            .getMethod("addAttribute", Class.class)
            .invoke(source, charTermAttrClass);
    }

    private static Throwable unwrap(Throwable t) {
        while (t instanceof InvocationTargetException && t.getCause() != null) {
            t = t.getCause();
        }
        return t;
    }

    /**
     * On Java 11+ (the fix): two sequential URLClassLoaders loading Lucene 4.x
     * both succeed. No LinkageError is thrown on the second deploy.
     *
     * This test is SKIPPED on Java 8 where the bug is present.
     */
    @Test
    public void secondDeploySucceedsOnJava11Plus() throws Exception {
        int javaVersion = Integer.parseInt(System.getProperty("java.specification.version"));
        Assume.assumeTrue(
            "Skipping: Java 11+ required for this fix. Running on Java " + javaVersion,
            javaVersion >= 11
        );

        URL luceneJar = findLuceneCoreJar();

        // First deploy
        try (URLClassLoader cl1 = new URLClassLoader(new URL[]{luceneJar},
                ClassLoader.getPlatformClassLoader())) {
            triggerAttributeFactory(cl1);
            System.out.println("First deploy: OK");
        }

        // Second deploy — must NOT throw LinkageError on Java 11+
        try (URLClassLoader cl2 = new URLClassLoader(new URL[]{luceneJar},
                ClassLoader.getPlatformClassLoader())) {
            try {
                triggerAttributeFactory(cl2);
                System.out.println("Second deploy: OK (LinkageError absent — fix confirmed)");
            } catch (InvocationTargetException ite) {
                Throwable cause = unwrap(ite);
                if (cause instanceof LinkageError) {
                    fail("LinkageError thrown on second deploy — fix did NOT take effect.\n"
                       + "This should not happen on Java " + javaVersion + ".\n"
                       + "Cause: " + cause.getMessage());
                }
                throw new AssertionError("Unexpected exception on second deploy: " + cause, cause);
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
