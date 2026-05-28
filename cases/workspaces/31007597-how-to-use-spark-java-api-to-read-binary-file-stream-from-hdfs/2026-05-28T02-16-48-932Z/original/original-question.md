# How to use spark Java API to read binary file stream from HDFS?

Source: https://stackoverflow.com/questions/31007597/how-to-use-spark-java-api-to-read-binary-file-stream-from-hdfs

- Posted: 2015-06-23
- Score: 19
- Views: 3627
- Answers: 2
- Cold signal: Answers exist; top score 0
- Tags: `java` `hadoop` `apache-spark` `streaming`
- Original poster: Ying Tan (https://stackoverflow.com/users/5040785/ying-tan)

## Narrative Teaser

Ying Tan's streaming job waits beside an HDFS directory for fresh binary files from Flume, but Spark keeps handing back a `BytesWritable` with an empty pocket. The evidence includes `binaryRecordsStream` rejected for fixed record length, `fileStream` wired through a custom `FileInputFormat`, a homemade `InputSplit`, and a `RecordReader` whose debug prints lead to `VAL-LENGTH = [0]` instead of online-learning data. Larkule Quirot's question is not whether Spark can read bytes; it is where the bytes disappear between HDFS discovery, split construction, and the Java Streaming API's contract.

## Preserved Case Text

I am writing a component which needs to get the new binary file in a specific HDFS path, so that I can do some online learning based on this data. So, I want to read binary file created by Flume from HDFS in stream. I found several functions provided by spark API, such as

public JavaDStream<byte[]> binaryRecordsStream(String directory,int recordLength)

and

public <K,V,F extends org.apache.hadoop.mapreduce.InputFormat<K,V>>
     JavaPairInputDStream<K,V> fileStream(String directory, Class<K> kClass, Class<V> vClass, Class<F> fClass)

But, I really do not know how to use these functions. I have tried binaryRecordStream, but it defines the specific length of file, so it is not good.

For fileStream function, I have used:

SparkConf sparkConf = new   SparkConf().setAppName("SparkFileStreamTest").setMaster("local[2]");

// Create the context with the specified batch size
JavaStreamingContext jssc = new JavaStreamingContext(sparkConf, new Duration(durationInMillis));

JavaPairInputDStream<LongWritable, BytesWritable> inputDStream = jssc.fileStream(hdfsPath, LongWritable.class, BytesWritable.class, CustomInputFormat.class);

//**********************************************************************
JavaPairInputDStream<LongWritable, BytesWritable> inputDStream = jssc.fileStream(
            hdfsPath, LongWritable.class, BytesWritable.class, CustomInputFormat.class);

JavaDStream<byte[]> content = inputDStream.map(new Function<Tuple2<LongWritable, BytesWritable>, byte[]>() {
    @Override
    public byte[] call(Tuple2<LongWritable, BytesWritable> tuple2) {
        System.out.println("----------------[testReadFileStreamFromHDFS] ENTER ......");
        if (tuple2 == null) {
            System.out.println("----------------[testReadFileStreamFromHDFS] TUPLE = NULL");
            System.out.println("----------------[testReadFileStreamFromHDFS] END.");
            return null;
        }
        else {
            System.out.println("----------------[testReadFileStreamFromHDFS] KEY = [" + tuple2._1().toString() + "]");
            System.out.println("----------------[testReadFileStreamFromHDFS] VAL-LENGTH = [" + tuple2._2().getBytes().length + "]");
            System.out.println("----------------[testReadFileStreamFromHDFS] END.");
            return tuple2._2().getBytes();
        }
    }
});

/***********************************************************************/
if (content == null) {
        System.out.println("----------------[testReadFileStreamFromHDFS] CONTENT = NULL");
}
else {
    System.out.println("----------------[testReadFileStreamFromHDFS] CONTENT-length = [" + content.count());
    content.print();
}

System.out.println("----------------[testReadFileStreamFromHDFS] END-111.");

jssc.start();
jssc.awaitTermination();
System.out.println("----------------[testReadFileStreamFromHDFS] END-222.");

For CustomInputFormat, I created

public class CustomInputFormat extends FileInputFormat<LongWritable, BytesWritable> {

private CustomInputSplit mInputSplit;

public CustomInputFormat() {
    mInputSplit = new CustomInputSplit();
}

@Override
public List<InputSplit> getSplits(JobContext context)
        throws IOException {

    System.out.println("----------------[CustomInputFormat] 1111 ......");
    final ArrayList<InputSplit> result = new ArrayList<InputSplit>();
    result.add(mInputSplit);

    System.out.println("----------------[CustomInputFormat] 2222 ......");
    return result;
}

@Override
public RecordReader<LongWritable, BytesWritable> createRecordReader(
        InputSplit inputSplit, TaskAttemptContext taskAttemptContext)
        throws IOException, InterruptedException {

    System.out.println("----------------[CustomInputFormat] 3333 ......");
    System.out.println("----------------[CustomInputFormat] ENTER createRecordReader, inputSplit-length = ["
            + inputSplit.getLength() + "]");

    mInputSplit.init(inputSplit);

    System.out.println("----------------[CustomInputFormat] 4444 ......");
    return new CustomRecordReader();
}

@Override
protected boolean isSplitable(JobContext context, Path filename) {
    System.out.println("----------------[CustomInputFormat] 5555 ......");
    return false;
}

public class CustomRecordReader extends RecordReader<LongWritable, BytesWritable> {

private BytesWritable mValues;
private int mCursor;

public CustomRecordReader() {
    System.out.println("----------------[CustomRecordReader] 1111 ......");
    mValues = null;
    mCursor = 0;
    System.out.println("----------------[CustomRecordReader] 2222 ......");
}

@Override
public void initialize(InputSplit inputSplit, TaskAttemptContext taskAttemptContext)
        throws IOException, InterruptedException {
    System.out.println("----------------[CustomRecordReader] 3333 ......");
    CustomInputSplit customInputSplit = (CustomInputSplit) inputSplit;
    mValues = customInputSplit.getValues();
    System.out.println("----------------[CustomRecordReader] 4444 ......");
}

@Override
public boolean nextKeyValue() throws IOException, InterruptedException {
    System.out.println("----------------[CustomRecordReader] 5555 ......");
    boolean existNext = (mCursor == 0);
    mCursor++;
    System.out.println("----------------[CustomRecordReader] 6666 ......");
    return existNext;
}

@Override
public LongWritable getCurrentKey() throws IOException, InterruptedException {
    System.out.println("----------------[CustomRecordReader] 7777 ......");
    return new LongWritable(0);
}

@Override
public BytesWritable getCurrentValue() throws IOException, InterruptedException {
    System.out.println("----------------[CustomRecordReader] 8888 ......");
    return mValues;
}

@Override
public float getProgress() throws IOException, InterruptedException {
    System.out.println("----------------[CustomRecordReader] 9999 ......");
    return 0;
}

@Override
public void close() throws IOException {
    System.out.println("----------------[CustomRecordReader] AAAA ......");
    mValues = null;
}
}

public class CustomInputSplit extends InputSplit implements Writable {

private long mLength;
private String[] mLocations;

private final BytesWritable mContent;

public CustomInputSplit() {
    System.out.println("----------------[CustomInputSplit] 1111 ......");
    mLength = 0;
    mLocations = null;

    mContent = new BytesWritable();
    System.out.println("----------------[CustomInputSplit] 2222 ......");
}

public void init(InputSplit inputSplit) throws IOException, InterruptedException {
    System.out.println("----------------[CustomInputSplit] 3333 ......");
    mLength = inputSplit.getLength();

    String[] locations = inputSplit.getLocations();
    if (locations != null) {
        int numLocations = locations.length;
        mLocations = new String[numLocations];
        for (int i = 0; i < numLocations; i++) {
            mLocations[i] = locations[i];
        }
    }
    System.out.println("----------------[CustomInputSplit] 4444 ......");
}

@Override
public long getLength() throws IOException, InterruptedException {
    System.out.println("----------------[CustomInputSplit] 5555 ......");
    return mLength;
}

@Override
public String[] getLocations() throws IOException, InterruptedException {
    if (mLocations == null) {
        System.out.println("----------------[CustomInputSplit] 6666-0001 ...... mLocations = [NULL]");
        mLocations = new String[] {"localhost"};
    }
    System.out.println("----------------[CustomInputSplit] 6666-0002 ...... mLocations-length = [" + mLocations.length + "]");
    return mLocations;
}

@Override
public void write(DataOutput dataOutput) throws IOException {
    System.out.println("----------------[CustomInputSplit] 7777 ......");
    mContent.write(dataOutput);
}

@Override
public void readFields(DataInput dataInput) throws IOException {
    System.out.println("----------------[CustomInputSplit] 8888 ......");
    mContent.readFields(dataInput);
}

public BytesWritable getValues() {
    System.out.println("----------------[CustomInputSplit] 9999 ......");
    return mContent;
}
}

But when I print:

System.out.println("----------------[testReadFileStreamFromHDFS] VAL-LENGTH = [" + tuple2._2().getBytes().length + "]");

I always get 0 length:

----------------[testReadFileStreamFromHDFS] VAL-LENGTH = [0]

Are there some problems with CustomerInputFormat.class? Does anybody know how to use Spark stream Java API to read binary file from HDFS?

## Expected Evidence

Runnable reproduction command, raw logs, and a final verification command with pass/fail evidence.

## Risk Hints

- No unusual risk hints detected from tags/title.
