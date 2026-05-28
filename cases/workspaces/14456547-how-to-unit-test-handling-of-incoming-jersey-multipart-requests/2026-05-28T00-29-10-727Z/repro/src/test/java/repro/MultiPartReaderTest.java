package repro;

import com.sun.jersey.multipart.BodyPart;
import com.sun.jersey.multipart.BodyPartEntity;
import com.sun.jersey.multipart.MultiPart;
import org.junit.Test;

import javax.ws.rs.core.MediaType;

/**
 * Reproduces the two failures described in the Stack Overflow question
 * (SO #14456547).  Both tests are written WITHOUT expected= so the
 * exception surfaces as a raw test ERROR, matching what Pete saw.
 *
 * Root cause: when a MultiPart is constructed in-process (as a client
 * would build it), each BodyPart stores the raw Java object as its entity
 * (byte[] here).  Jersey's server-side MessageBodyReader normally
 * serialises the whole multipart to bytes over HTTP and then re-parses it,
 * leaving each part's entity as a BodyPartEntity wrapping an InputStream.
 * That round-trip never happens in a plain unit test.
 */
public class MultiPartReaderTest {

    /**
     * Reproduces:
     *   java.lang.ClassCastException: [B cannot be cast to
     *   com.sun.jersey.multipart.BodyPartEntity
     *
     * The entity stored in the BodyPart is byte[] (the object passed to the
     * constructor), not a BodyPartEntity.
     */
    @Test
    public void directCast_throwsClassCastException() {
        byte[] bytes = "fake-image-bytes".getBytes();

        MultiPart multiPart = new MultiPart()
                .bodyPart(new BodyPart(bytes, MediaType.APPLICATION_OCTET_STREAM_TYPE))
                .bodyPart(new BodyPart("file.png", MediaType.APPLICATION_XML_TYPE));

        // This is the production line that fails in the unit test:
        BodyPartEntity bpe = (BodyPartEntity) multiPart.getBodyParts().get(0).getEntity();
    }

    /**
     * Reproduces:
     *   java.lang.IllegalStateException: Entity instance does not contain
     *   the unconverted content
     *
     * getEntityAs() requires the entity to be stored as raw bytes (the
     * "unconverted" wire form).  When the entity was set as a typed Java
     * object it throws instead.
     */
    @Test
    public void getEntityAs_throwsIllegalStateException() {
        byte[] bytes = "fake-image-bytes".getBytes();

        MultiPart multiPart = new MultiPart()
                .bodyPart(new BodyPart(bytes, MediaType.APPLICATION_OCTET_STREAM_TYPE))
                .bodyPart(new BodyPart("file.png", MediaType.APPLICATION_XML_TYPE));

        // The edit in the SO question tried this alternative — also fails:
        BodyPartEntity bpe = multiPart.getBodyParts().get(0).getEntityAs(BodyPartEntity.class);
    }
}
