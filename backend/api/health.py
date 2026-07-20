from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from api.settings import get_current_settings
from rag.vector_store import get_vector_store
from models.schemas import HealthCheckSchema

router = APIRouter(tags=["health"])

@router.get("/health", response_model=HealthCheckSchema)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify system status, DB connection, and vector index size."""
    doc_count = db.query(models.Document).count()
    chunk_count = db.query(models.DocumentChunk).count()
    
    vs = get_vector_store()
    vector_indexed = vs.count()
    
    settings = get_current_settings(db)
    
    return HealthCheckSchema(
        status="healthy",
        documents_count=doc_count,
        total_chunks=chunk_count,
        vector_store_indexed=vector_indexed,
        llm_provider=settings.get("llm_provider", "mock")
    )
