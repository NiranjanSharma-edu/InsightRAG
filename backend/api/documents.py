import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from models.schemas import DocumentSchema, DocumentChunkSchema
from core.config import settings
from core.logger import logger
from services.document_service import process_document, delete_document_vector_and_db

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("", response_model=List[DocumentSchema])
def list_documents(db: Session = Depends(get_db)):
    """List all uploaded documents."""
    docs = db.query(models.Document).order_by(models.Document.upload_date.desc()).all()
    return docs

@router.post("/upload", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a PDF file to the system."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF documents are supported."
        )

    doc_id = str(uuid.uuid4())
    saved_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)

        doc_record = models.Document(
            id=doc_id,
            filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            processed=False,
            num_chunks=0,
            page_count=0
        )
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

        logger.info(f"Document uploaded: {file.filename} (ID: {doc_id})")
        return doc_record

    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save uploaded file: {str(e)}"
        )

@router.post("/{document_id}/process", response_model=DocumentSchema)
def process_document_endpoint(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Trigger processing (PDF parsing, text chunking, FAISS embedding) for a document."""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    processed_doc = process_document(document_id, db)
    return processed_doc

@router.get("/{document_id}/chunks", response_model=List[DocumentChunkSchema])
def get_document_chunks(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Get all extracted chunks for a given document."""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    chunks = db.query(models.DocumentChunk)\
               .filter(models.DocumentChunk.document_id == document_id)\
               .order_by(models.DocumentChunk.chunk_index)\
               .all()
    return chunks

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Delete a document, its chunks from DB, physical file, and FAISS vector index entries."""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    delete_document_vector_and_db(document_id, db)
    return {"message": f"Document {document_id} and associated vector embeddings successfully deleted."}
