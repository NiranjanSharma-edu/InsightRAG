import pytest
import numpy as np
from rag.vector_store import FAISSVectorStore

@pytest.fixture
def temp_vector_store(tmp_path):
    store = FAISSVectorStore(dimension=4)
    store.index_path = str(tmp_path / "test.index")
    store.meta_path = str(tmp_path / "test_meta.json")
    store._create_fresh_index()
    return store

def test_add_and_search_vectors(temp_vector_store):
    vec1 = np.array([[1.0, 0.0, 0.0, 0.0]], dtype=np.float32)
    vec2 = np.array([[0.0, 1.0, 0.0, 0.0]], dtype=np.float32)

    meta1 = {"document_id": "doc1", "text": "Apple content", "page_number": 1, "chunk_index": 0}
    meta2 = {"document_id": "doc2", "text": "Banana content", "page_number": 2, "chunk_index": 1}

    temp_vector_store.add_vectors(vec1, [meta1])
    temp_vector_store.add_vectors(vec2, [meta2])

    assert temp_vector_store.count() == 2

    query = np.array([0.9, 0.1, 0.0, 0.0], dtype=np.float32)
    results = temp_vector_store.similarity_search(query, top_k=1)

    assert len(results) == 1
    assert results[0]["document_id"] == "doc1"
    assert results[0]["text"] == "Apple content"

def test_delete_document_vectors(temp_vector_store):
    vec = np.array([[1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0]], dtype=np.float32)
    meta = [
        {"document_id": "docA", "text": "Doc A text"},
        {"document_id": "docB", "text": "Doc B text"}
    ]
    temp_vector_store.add_vectors(vec, meta)
    assert temp_vector_store.count() == 2

    temp_vector_store.delete_document_vectors("docA")
    assert temp_vector_store.count() == 1
    assert temp_vector_store.metadata_store[0]["document_id"] == "docB"
