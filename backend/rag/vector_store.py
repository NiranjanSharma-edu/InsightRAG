import faiss
import numpy as np
import os
import json
from typing import List, Dict, Any
from core.config import settings
from core.logger import logger

class FAISSVectorStore:
    """Manages FAISS vector index, saving/loading to disk, and payload metadata mapping."""

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index_path = os.path.join(settings.VECTOR_STORE_DIR, "faiss.index")
        self.meta_path = os.path.join(settings.VECTOR_STORE_DIR, "faiss_metadata.json")
        
        self.metadata_store: List[Dict[str, Any]] = []
        self.index = None
        self._init_or_load_index()

    def _init_or_load_index(self):
        """Loads existing FAISS index from disk or creates a new IndexFlatIP (Cosine Similarity)."""
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.meta_path, "r", encoding="utf-8") as f:
                    self.metadata_store = json.load(f)
                logger.info(f"Loaded existing FAISS index with {self.index.ntotal} vectors.")
            except Exception as e:
                logger.error(f"Error loading FAISS index: {str(e)}. Creating fresh index.")
                self._create_fresh_index()
        else:
            self._create_fresh_index()

    def _create_fresh_index(self):
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata_store = []
        self.save()

    def add_vectors(self, embeddings: np.ndarray, metadatas: List[Dict[str, Any]]):
        """Adds vector embeddings and associated payload metadata to index."""
        if embeddings.shape[0] == 0:
            return

        if embeddings.shape[1] != self.dimension:
            raise ValueError(f"Vector dimension mismatch. Expected {self.dimension}, got {embeddings.shape[1]}")

        embeddings = embeddings.astype(np.float32)
        
        self.index.add(embeddings)
        self.metadata_store.extend(metadatas)
        self.save()
        logger.info(f"Added {len(metadatas)} vectors to FAISS store. Total count: {self.index.ntotal}")

    def similarity_search(self, query_embedding: np.ndarray, top_k: int = 4, filter_doc_ids: List[str] = None) -> List[Dict[str, Any]]:
        """Performs cosine similarity search against stored vector embeddings."""
        if self.index.ntotal == 0:
            return []

        query_vector = np.array([query_embedding], dtype=np.float32)
        fetch_k = min(self.index.ntotal, top_k * 5 if filter_doc_ids else top_k)
        scores, indices = self.index.search(query_vector, fetch_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1 or idx >= len(self.metadata_store):
                continue
            
            meta = self.metadata_store[idx].copy()
            if filter_doc_ids and meta.get("document_id") not in filter_doc_ids:
                continue

            meta["score"] = float(score)
            results.append(meta)
            
            if len(results) >= top_k:
                break

        return results

    def delete_document_vectors(self, document_id: str):
        """Rebuilds the FAISS index excluding vectors belonging to a deleted document."""
        if not self.metadata_store:
            return

        keep_indices = [i for i, meta in enumerate(self.metadata_store) if meta.get("document_id") != document_id]
        
        if len(keep_indices) == len(self.metadata_store):
            return

        logger.info(f"Rebuilding FAISS index to delete vectors for document_id: {document_id}")
        
        if keep_indices:
            all_vectors = np.zeros((self.index.ntotal, self.dimension), dtype=np.float32)
            for i in range(self.index.ntotal):
                all_vectors[i] = self.index.reconstruct(i)
            
            kept_vectors = all_vectors[keep_indices]
            kept_metadata = [self.metadata_store[i] for i in keep_indices]

            self.index = faiss.IndexFlatIP(self.dimension)
            self.index.add(kept_vectors)
            self.metadata_store = kept_metadata
        else:
            self._create_fresh_index()

        self.save()

    def save(self):
        """Persists the FAISS index and metadata array to disk."""
        faiss.write_index(self.index, self.index_path)
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata_store, f, ensure_ascii=False, indent=2)

    def count(self) -> int:
        return self.index.ntotal if self.index else 0

_vector_store_instance = None

def get_vector_store() -> FAISSVectorStore:
    global _vector_store_instance
    if _vector_store_instance is None:
        _vector_store_instance = FAISSVectorStore()
    return _vector_store_instance
