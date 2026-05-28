# How to Unit Test handling of incoming Jersey MultiPart requests

Source: https://stackoverflow.com/questions/14456547/how-to-unit-test-handling-of-incoming-jersey-multipart-requests

- Posted: 2013-01-22
- Score: 9
- Views: 5859
- Answers: 1
- Cold signal: Answers exist; top score 0
- Tags: `java` `rest` `testing` `jersey` `multipart`
- Original poster: Pete (https://stackoverflow.com/users/872975/pete)

## Narrative Teaser

Pete's Jersey multipart test looks like the live client, but in the lab the first body part stays a raw `byte[]` instead of becoming the server-side `BodyPartEntity` his file handler expects. He does not want Jersey-Test or Grizzly because the Spring context matters; he wants a true unit test for the multipart reader that still passes through whatever parsing Jersey performs in production. Larkule Quirot's file has `MultiPart`, `BodyPart`, `MultiPartWriter`, `getEntityAs(BodyPartEntity.class)`, and the damning line `[B cannot be cast`; the unresolved question is how to reproduce the incoming request shape without starting the whole web machine.

## Preserved Case Text

We have a REST service that accepts MultiPart POST requests containing BodyParts that hold InputStreams. Inside the REST service a file might be created based on the provided data.

Task

We want to unit test the class that does the file operations based on its MultiPart input. Note: Wo do NOT want to use Jersey-Test! Grizzly does not load our spring application context which we need to inject DAO and fileHandler services into our REST service class. We explicitly want to test how our fileHandler service processes multiPart data.

The problem however is that the MultiPart that is sent out from the REST Client is not the same as the one received by the REST Server as jersey probably does something with the data to stream it or whatever. Trying to test (see below) the following setup will result in an

IllegalArgumentException [B cannot be cast to com.sun.jersey.multipart.BodyPartEntity

REST Client - sending a MultiPart

(just snippets, I omitted the obvious stuff):

    byte[] bytes = FileManager.readImageFileToArray(completePath, fileType);

    MultiPart multiPart = new MultiPart().
            bodyPart(new BodyPart(bytes, MediaType.APPLICATION_OCTET_STREAM_TYPE)).
            bodyPart(new BodyPart(fileName, MediaType.APPLICATION_XML_TYPE)).
            bodyPart(new BodyPart(senderId, MediaType.APPLICATION_XML_TYPE));

    ClientConfig cc = new DefaultClientConfig();
    cc.getClasses().add(MultiPartWriter.class);
    Client client = Client.create(cc);
    WebResource webResource = client.resource(requestUrl);
    Builder builder = webResource.type(MediaType.MULTIPART_FORM_DATA_TYPE);
    builder = addHeaderParams(builder, headerParams);

    ClientResponse response = builder.post(ClientResponse.class, multiPart);

Server Side - receiving a MultiPart

REST:

@POST
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)
@Transactional
public Response create(MultiPart multiPart) {

    try {
            multiPartReader.saveFile(multiPart);

Server Side MultiPartReader to save file from multipart

public class MultiPartReader {

    public void saveFile(MultiPart multiPart) throws IOException {

        BodyPartEntity bpe = (BodyPartEntity) multiPart.getBodyParts().get(0).getEntity();
        InputStream inputStream = bpe.getInputStream();

        // ...

        BufferedImage bi = ImageIO.read(inputStream);
        String fileName = getFileNameFromMultiPart(multiPart);

        File file = new File(filename);

        if (file.isDirectory()) {
            ImageIO.write(bi, formatName, file);
        } else {
            file.mkdirs();
            ImageIO.write(bi, formatName, file);
        }

        bpe.close();
    }

Test - handling an incoming MultiPart in isolation

Now I want to test the MultiPartReader:

@Test
public void saveFile_should_Create_file() throws IOException {
    byte[] bytes = IOUtils.toByteArray(this.getClass().getResourceAsStream(fileResource));

    MultiPart multiPart = new MultiPart().
            bodyPart(new BodyPart(bytes, MediaType.APPLICATION_OCTET_STREAM_TYPE)).
            bodyPart(new BodyPart(fileName, MediaType.APPLICATION_XML_TYPE)).
            bodyPart(new BodyPart(senderId, MediaType.APPLICATION_XML_TYPE));

    multiPartReader.saveFile(multiPart);

    file = new File(fileName);
    Assert.assertNotNull(file);
    Assert.assertTrue(file.getTotalSpace() > 0);
    file.delete();
}

But, like I said I get a

IllegalArgumentException [B cannot be cast to com.sun.jersey.multipart.BodyPartEntity

at

    BodyPartEntity bpe = (BodyPartEntity) multiPart.getBodyParts().get(0).getEntity();

So what can I do to emulate the send/receive handled by jersey so that my test will get the same data as my REST service does deployed on a server and requested by a REST client?

EDIT

Using

BodyPartEntity bpe = multiPart.getBodyParts().get(0).getEntityAs(BodyPartEntity.class);

will throw a

IllegalStateException: Entity instance does not contain the unconverted content

Further pointer, I think, towards having to convert the test-generated MultiPart in some way, before calling my MultiPartReader..

There has to be some method in jersey, I can call that will do this converting just the way it does, when it sends out a MultiPart request on a deployed system or maybe it is the receiving end that does some parsing when receiving the HTTP request..?

## Expected Evidence

Runnable reproduction command, raw logs, and a final verification command with pass/fail evidence.

## Risk Hints

- No unusual risk hints detected from tags/title.
