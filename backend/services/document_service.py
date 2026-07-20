import os
from sqlalchemy.orm import Session
from database import models
from rag.loader import PDFLoader
from rag.chunker import TextChunker
from rag.embeddings import EmbeddingService
from rag.vector_store import get_vector_store
from api.settings import get_current_settings
from core.logger import logger

def process_document(document_id: str, db: Session) -> models.Document:
    """End-to-End indexing pipeline: PDF load ➔ Chunking ➔ Embedding ➔ FAISS vector store & SQLite update."""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise ValueError(f"Document with ID {document_id} not found.")

    if not os.path.exists(doc.file_path):
        raise FileNotFoundError(f"PDF file at path {doc.file_path} does not exist.")

    logger.info(f"Starting processing pipeline for document: {doc.filename} ({doc.id})")

    pages = PDFLoader.extract_pages(doc.file_path)
    
    sys_settings = get_current_settings(db)
    chunk_size = int(sys_settings["chunk_size"])
    chunk_overlap = int(sys_settings["chunk_overlap"])

    raw_chunks = TextChunker.chunk_document_pages(pages, chunk_size=chunk_size, chunk_overlap=chunk_overlap)

    embedding_service = EmbeddingService()
    chunk_texts = [c["text"] for c in raw_chunks]
    embeddings = embedding_service.embed_texts(chunk_texts)

    db.query(models.DocumentChunk).filter(models.DocumentChunk.document_id == document_id).delete()

    chunk_models = []
    vector_metadata_list = []
    
    for idx, c in enumerate(raw_chunks):
        chunk_obj = models.DocumentChunk(
            document_id=document_id,
            chunk_index=c["chunk_index"],
            text=c["text"],
            page_number=c["page_number"],
            start_char=c["start_char"],
            end_char=c["end_char"]
        )
        chunk_models.append(chunk_obj)

        vector_metadata_list.append({
            "document_id": document_id,
            "chunk_index": c["chunk_index"],
            "page_number": c["page_number"],
            "text": c["text"]
        })

    db.bulk_save_objects(chunk_models)
    
    doc.processed = True
    doc.num_chunks = len(raw_chunks)
    doc.page_count = len(pages)
    db.commit()

    vector_store = get_vector_store()
    vector_store.delete_document_vectors(document_id)
    vector_store.add_vectors(embeddings, vector_metadata_list)

    logger.info(f"Successfully processed and indexed document {doc.filename}. ({len(raw_chunks)} chunks indexed)")
    return doc

def delete_document_vector_and_db(document_id: str, db: Session):
    """Deletes physical PDF file, vector store index entries, and SQLite metadata."""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        return

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            logger.error(f"Failed to delete file {doc.file_path}: {str(e)}")

    vector_store = get_vector_store()
    vector_store.delete_document_vectors(document_id)

    db.delete(doc)
    db.commit()
    logger.info(f"Document {document_id} completely removed from system.")
