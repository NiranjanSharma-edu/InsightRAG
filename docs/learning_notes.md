# InsightRAG Learning Notes & Technical Interview Q&A

This document serves as an interview prep guide for explaining RAG architectures, chunking tradeoffs, vector mathematics, and implementation details line-by-line.

---

## 1. What is RAG and why use it instead of Fine-Tuning?
**Retrieval-Augmented Generation (RAG)** dynamically injects relevant context passages from an external document repository into the LLM prompt at query time.

### RAG vs Fine-Tuning:
| Feature | RAG | Fine-Tuning |
| :--- | :--- | :--- |
| **Data Recency** | Updated instantly (add PDF to index) | Requires costly retraining cycle |
| **Hallucination** | Low (grounded in source context) | Moderate/High (relies on parametric memory) |
| **Citations** | Precise (exact page number & chunk text) | Non-existent / opaque source attribution |
| **Cost & Compute** | Low (cheap embeddings & vector search) | High (GPU fine-tuning runs) |

---

## 2. Why PyMuPDF (`fitz`) for PDF Extraction?
PyMuPDF provides fast native execution speeds and preserves page layout boundaries without heavy dependencies. By extracting text page by page, we maintain an exact mapping between chunk index, page number, and source document metadata.

---

## 3. What is the Chunk Size vs Chunk Overlap Tradeoff?
- **Chunk Size**: Controls the semantic context window.
  - *Too small (e.g., 100 chars)*: Context gets fragmented, missing key sentences.
  - *Too large (e.g., 2000 chars)*: Introduces noise, lowering vector similarity precision.
- **Chunk Overlap**: Prevents semantic loss at chunk boundaries when a crucial sentence spans across sliding windows.
- **InsightRAG Default**: `chunk_size = 500` characters, `chunk_overlap = 50` characters.

---

## 4. How does FAISS similarity search work?
FAISS (Facebook AI Similarity Search) is an open-source library for efficient vector retrieval.
In InsightRAG, vectors are **L2 normalized** prior to insertion. Inner Product search (`faiss.IndexFlatIP`) over normalized vectors is mathematically identical to **Cosine Similarity**:
$$\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = A \cdot B \quad (\text{when } \|A\| = \|B\| = 1)$$

---

## 5. How are Citations Grounded?
Every document chunk stored in FAISS carries metadata:
- `document_id` & `document_name`
- `page_number`
- `chunk_index`
- `snippet` (retrieved text)

When the LLM receives prompt context, these chunk metadata fields are formatted alongside the text. When rendering answers in the frontend, citation badges link directly to the chunk's page number and exact snippet.

---

## 6. How do you handle non-existent information or hallucination?
We mitigate hallucinations through **Prompt Engineering**:
1. Strictly instruct the system prompt: *"Do not use external knowledge that contradicts or is not mentioned in the context."*
2. Require the LLM to output *"I could not find a clear answer in the provided documents."* when context match is insufficient.
3. Keep temperature low ($\approx 0.2$) for deterministic, fact-driven generations.
