# Course Content Indexer

An automatic indexing system for GroeimetAI course content that enables semantic search and RAG (Retrieval-Augmented Generation) capabilities.

## Features

- **Automatic Course Scanning**: Recursively scans all courses in `/src/lib/data/course-content`
- **Content Extraction**: Parses lesson content, code examples, assignments, and resources
- **Semantic Embeddings**: Generates OpenAI embeddings for semantic search
- **Vector Storage**: Stores embeddings in a vector database for fast retrieval
- **Progress Tracking**: Real-time progress updates during indexing
- **Error Recovery**: Continues indexing even if individual lessons fail
- **Incremental Updates**: Support for updating only changed content (coming soon)
- **Search Functionality**: Query the indexed content with natural language

## Setup

1. Ensure you have an OpenAI API key set in your environment:
   ```bash
   # Add to .env.local
   OPENAI_API_KEY=your-api-key-here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Index All Courses
```bash
npm run index-courses
```

### Search the Index
```bash
npm run index-courses search "langchain memory management"
```

### View Statistics
```bash
npm run index-courses stats
```

### Clear the Index
```bash
npm run index-courses clear
```

### Show Help
```bash
npm run index-courses help
```

## Index Structure

The indexer creates the following chunks for each lesson:

1. **Content Chunks**: Main lesson content split into ~1000 character chunks
2. **Code Examples**: Each code example as a separate chunk with metadata
3. **Assignments**: Assignment descriptions and initial code
4. **Resources**: External links and references

## Metadata

Each chunk includes:
- Course ID and title
- Module ID and title  
- Lesson ID and title
- Lesson duration
- Chunk type (content, code, assignment, resource)
- Code language (for code chunks)

## Output Files

The indexer creates a `.course-index` directory containing:
- `index.json`: The vector embeddings and documents
- `metadata.json`: Index metadata and statistics
- `stats.json`: Detailed indexing statistics
- `indexing.log`: History of indexing operations

## Performance

- Typical indexing speed: 10-50 chunks/second
- Memory usage: ~500MB for full course catalog
- Index size: ~50-100MB on disk

## API Usage

```typescript
import { CourseIndexer } from '@/lib/rag/course-indexer';

// Initialize indexer
const indexer = new CourseIndexer({
  openAIApiKey: process.env.OPENAI_API_KEY,
  chunkSize: 1000,
  chunkOverlap: 200
});

// Index courses
const stats = await indexer.indexAllCourses();

// Search
const results = await indexer.search("how to use langchain memory", 5);

// Access vector store directly
const vectorStore = indexer.getVectorStore();
```

## Extending the Indexer

The indexer is designed to be extensible:

1. **Custom Vector Stores**: Replace `MemoryVectorStore` with Pinecone, Weaviate, etc.
2. **Different Embeddings**: Use other embedding models (Cohere, HuggingFace, etc.)
3. **Additional Metadata**: Extend the metadata schema for your needs
4. **Custom Chunking**: Implement different text splitting strategies

## Future Improvements

- [ ] Incremental indexing based on file modification times
- [ ] Support for video transcripts
- [ ] Multi-language support
- [ ] Custom embedding models
- [ ] Cloud vector database integration
- [ ] Webhook for automatic re-indexing
- [ ] Better chunking for code examples
- [ ] Course difficulty scoring