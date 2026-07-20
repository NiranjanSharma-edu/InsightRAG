# InsightRAG Architecture & System Design

InsightRAG is an open-source, interview-ready Retrieval-Augmented Generation (RAG) platform. It allows users to query dense PDF documents using natural language with verifiable, grounded citations.

---

## 1. System Architecture Overview

```
                                 FRONTEND (Next.js 15)
                      ┌──────────────────────────────────────────┐
                      │  Landing | Upload | Chat | Settings | About│
                      └────────────────────┬─────────────────────┘
                                           │ REST API (JSON)
                                           ▼
                                  BACKEND (FastAPI)
      ┌────────────────────────────────────┴────────────────────────────────────┐
      │                                                                         │
      ▼                                                                         ▼
┌──────────────────────────┐                                       ┌──────────────────────────┐
│   Indexing Pipeline      │                                       │  Retrieval & Generation  │
├──────────────────────────┤                                       ├──────────────────────────┤
│ 1. PyMuPDF Loader        │                                       │ 1. User Question         │
│ 2. Text Chunker          │                                       │ 2. Embedding Query       │
│ 3. Sentence Transformers │                                       │ 3. FAISS Vector Search   │
│ 4. FAISS Vector Store    │                                       │ 4. Context Assembly      │
│ 5. SQLite Metadata DB    │                                       │ 5. LLM Answer Engine     │
└──────────────────────────┘                                       └──────────────────────────┘
```

---

## 2. Ingestion & Indexing Pipeline Flow

1. **PDF Upload & Storage**:
   - PDF files uploaded via `POST /documents/upload` are stored in `backend/data/uploads/`.
   - File metadata is registered in SQLite (`documents` table).

2. **Text Extraction (`rag/loader.py`)**:
   - `PyMuPDF` (`fitz`) extracts clean string text page by page.
   - Preserves exact page numbers (1-indexed) and char lengths.

3. **Text Chunking (`rag/chunker.py`)**:
   - Performs recursive sliding window chunking using `chunk_size` (default: 500 chars) and `chunk_overlap` (default: 50 chars).
   - Generates chunk records with metadata (`page_number`, `start_char`, `end_char`).

4. **Dense Vector Embeddings (`rag/embeddings.py`)**:
   - Encodes text chunks into 384-dimensional dense vectors using `SentenceTransformers` (`all-MiniLM-L6-v2`).
   - L2 normalizes vectors for fast Cosine Similarity calculation.

5. **Vector Indexing (`rag/vector_store.py`)**:
   - Inserts vectors into FAISS `IndexFlatIP`.
   - Persists FAISS binary index to `backend/data/vector_store/faiss.index` and metadata array to `faiss_metadata.json`.

---

## 3. Retrieval & Generation Pipeline Flow

1. **User Query**: User submits question via `/chat` page.
2. **Query Vector Encoding**: `EmbeddingService` generates 384D query vector.
3. **Similarity Search**: `FAISSVectorStore` conducts top-K inner product search over vector index.
4. **Prompt Building (`rag/prompt_builder.py`)**: Assembles prompt with strict system instructions and context passages tagged with Document Name and Page Number.
5. **LLM Generation (`rag/generator.py`)**: Provider (OpenAI, Groq, Gemini, Ollama, or Mock Offline) returns a grounded answer.
6. **Citation Formatting**: Response includes citation objects linking answer text directly to source PDF pages.
