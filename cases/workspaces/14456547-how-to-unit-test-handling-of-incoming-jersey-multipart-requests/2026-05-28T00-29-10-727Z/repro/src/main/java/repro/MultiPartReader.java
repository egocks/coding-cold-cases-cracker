package repro;

import com.sun.jersey.multipart.BodyPartEntity;
import com.sun.jersey.multipart.MultiPart;
import com.sun.jersey.multipart.BodyPart;

import javax.ws.rs.core.MediaType;
import java.io.InputStream;

/**
 * Minimal stand-in for the production MultiPartReader described in the SO question.
 * The cast on line below is exactly what fails in the test.
 */
public class MultiPartReader {

    public InputStream getImageStream(MultiPart multiPart) {
        // This is the line that throws ClassCastException in the test:
        // entity is byte[] when constructed directly, BodyPartEntity only after
        // Jersey's MessageBodyReader has deserialized the HTTP wire bytes.
        BodyPartEntity bpe = (BodyPartEntity) multiPart.getBodyParts().get(0).getEntity();
        return bpe.getInputStream();
    }
}
