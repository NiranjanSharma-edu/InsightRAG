from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
from core.config import settings
from core.logger import logger

class EmbeddingService:
    """Manages text embedding generation using SentenceTransformers."""

    _instances = {}

    def __new__(cls, model_name: str = None):
        model_name = model_name or settings.DEFAULT_EMBEDDING_MODEL
        if model_name not in cls._instances:
            instance = super(EmbeddingService, cls).__new__(cls)
            instance._init_model(model_name)
            cls._instances[model_name] = instance
        return cls._instances[model_name]

    def _init_model(self, model_name: str):
        self.model_name = model_name
        logger.info(f"Loading SentenceTransformer model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        logger.info(f"Embedding model {model_name} loaded successfully (dim={self.dimension}).")

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """Generates normalized vector embeddings for a list of text strings.

        Args:
            texts (List[str]): Input texts.

        Returns:
            np.ndarray: float32 NumPy matrix of shape (N, dimension).
        """
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)

        embeddings = self.model.encode(
            texts,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True  # Cosine similarity normalization
        )
        return embeddings.astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        """Embeds a single user question query string."""
        return self.embed_texts([query])[0]
