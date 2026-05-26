# Maven generate-sources cannot resolve a dependency

Source: https://stackoverflow.com/questions/15276976/maven-generate-sources-cannot-resolve-a-dependency

- Posted: 2013-03-07
- Score: 10
- Views: 2573
- Answers: 0
- Cold signal: No answers
- Tags: `java` `maven` `jaxb2`

## Preserved Case Text

I have a multi-module project in maven which uses JAXB generated sources:

    parent
        module A
        module B (depends on module A)

Without JAXB everything compiles fine.  When I add the JAXB plugin to module B, maven complains:

   Failed to execute goal on project moduleB: Could not resolve dependencies for
   project groupId:A:jar:1.7.0: Could not find artifact groupId:A:jar:1.7.0:
   in thirdparty (http://10.0.0.2:8081/nexus/content/repositories/thirdparty)

As far as I can tell, this is because the jaxb maven plugins require that all of the dependencies be resolved during the generate-sources phase, before module A has been compiled.  We don't have a mechanism to install module A in our local repository--we've never needed it because both module are in the same git repository.

The ugly solution I've found is this:

    parent
        module A
        module B (depends on module A & C)
        module C (contains only JAXB generate-sources)

JAXB does not require module A, so everything compiles.  This solution does work, but it's ugly.  Normally modules contain useful code, but in order to put useful code in module C, I would have to make it depend on module A which causes the same error.  (Switching to a different JAXB plugin didn't work because it also resolved dependencies during the generate-sources phase.)

Question: Is there a way to avoid this dependency without creating another module?

(Possible solutions could involve adding a phase or scope for module B, changing the scope of the dependency where module B requires module A so it isn't required until after generate-sources, or creating an exclusion so JAXB doesn't look for this particular dependency.)

All that follows is a minimalist version of the pom.xml files.  It is derived from working poms, but I'm not 100% sure it will compile in its present form.

parent/pom.xml:

<project xmlns="http://maven.apache.org/POM/4.0.0"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
   http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>
    <artifactId>artFacts</artifactId>
    <groupId>com.group</groupId>
    <version>1.7.0</verison>

    <repositories>
        <repository>
            <id>thirdparty</id>
            <url>http://10.0.0.2:8081/nexus/content/repositories/thirdparty</url>
        </repository>
    </repositories>

    <modules>
        <module>modA</module>
        <module>modB</module>
    </modules>
</project>

parent/a/pom.xml:

<project>
    <parent>
        <artifactId>artFacts</artifactId>
        <groupId>com.group</groupId>
        <version>1.7.0</version>
    </parent>

    <modelVersion>4.0.0</modelVersion>

    <artifactId>modA</artifactId>
    <packaging>jar</packaging>
</project>

parent/b/pom.xml:

<project>
    <parent>
        <artifactId>artFacts</artifactId>
        <groupId>com.group</groupId>
        <version>1.7.0</version>
    </parent>

    <modelVersion>4.0.0</modelVersion>

    <artifactId>modB</artifactId>
    <packaging>jar</packaging>

    <build>
      <plugins>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>jaxb2-maven-plugin</artifactId>
            <version>1.3</version>
            <executions>
                <execution>
                    <id>xjc_raw</id>
                    <goals>
                        <goal>xjc</goal>
                    </goals>
                    <configuration>
                        <packageName>com.group.jaxb</packageName>
                        <schemaDirectory>${basedir}/xsd/</schemaDirectory>
                        <outputDirectory>${project.build.directory}/generated-sources/jaxb</outputDirectory>
                        <staleFile>${project.build.directory}/generated-sources/jaxb/.staleFlag</staleFile>
                        <target>2.1</target>
                    </configuration>
                    <phase>generate-sources</phase>
                </execution>
            </executions>
        </plugin>
        <!-- Tell Eclipse where to find the generated sources. -->
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>build-helper-maven-plugin</artifactId>
            <version>1.1</version>
            <executions>
                <execution>
                    <id>add-source</id>
                    <phase>generate-sources</phase>
                    <goals>
                        <goal>add-source</goal>
                    </goals>
                    <configuration>
                        <sources>
                            <source>${project.build.directory}/generated-sources/jaxb</source>
                        </sources>
                    </configuration>
                </execution>
            </executions>
        </plugin>
      </plugins>
    </build>
    <dependencies>
        <!-- This is the dependency which fails because it can't be resolved
             during the generate-sources phase. -->
        <dependency>
            <groupId>com.group</groupId>
            <artifactId>modA</artifactId>
            <version>${project.version}</version>
            <type>jar</type>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>javax.xml.bind</groupId>
            <artifactId>jaxb-api</artifactId>
            <version>2.1</version>
            <type>jar</type>
            <optional>false</optional>
        </dependency>
    <dependencies>
</project>

In this form, the project should fail with the error message above.  Changing this to the ugly solution can be accomplished by creating modC and putting everything about JAXB there.  After this, it's simply a matter of making modB depend on both modA and modC, plus adding modC to the parent.

## Expected Evidence

Build lifecycle command output, dependency-resolution failure, then passing verification.

## Risk Hints

- No unusual risk hints detected from tags/title.
