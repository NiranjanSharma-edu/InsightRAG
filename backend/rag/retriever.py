from typing import List, Dict, Any
from rag.embeddings import EmbeddingService
from rag.vector_store import get_vector_store
from core.logger import logger

class RetrieverService:
    """Handles question embedding and vector similarity retrieval pipeline."""

    @staticmethod
    def retrieve(query: str, top_k: int = 4, document_ids: List[str] = None) -> List[Dict[str, Any]]:
        """Retrieves top-K most relevant chunks for a user query.

        Args:
            query (str): User question text.
            top_k (int): Number of chunks to retrieve.
            document_ids (List[str], optional): Specific document IDs to filter by.

        Returns:
            List[Dict[str, Any]]: List of chunk objects with similarity score and metadata.
        """
        logger.info(f"Retrieving top-{top_k} chunks for query: '{query[:50]}...'")
        
        embedding_service = EmbeddingService()
        query_vector = embedding_service.embed_query(query)
        
        vector_store = get_vector_store()
        results = vector_store.similarity_search(
            query_embedding=query_vector,
            top_k=top_k,
            filter_doc_ids=document_ids
        )
        
        logger.info(f"Retrieved {len(results)} chunks successfully.")
        return results
