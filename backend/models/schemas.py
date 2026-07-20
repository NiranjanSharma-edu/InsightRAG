from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentSchema(BaseModel):
    id: str
    filename: str
    file_size: int
    upload_date: datetime
    processed: bool
    num_chunks: int
    page_count: int

    class Config:
        from_attributes = True

class DocumentChunkSchema(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    text: str
    page_number: int
    start_char: int
    end_char: int

    class Config:
        from_attributes = True

class CitationSchema(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    chunk_index: int
    score: float
    snippet: str

class ChatRequestSchema(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    stream: bool = False

class ChatResponseSchema(BaseModel):
    id: str
    question: str
    answer: str
    citations: List[CitationSchema]
    created_at: datetime

class SettingsSchema(BaseModel):
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k: int = 4
    embedding_model: str = "all-MiniLM-L6-v2"
    temperature: float = 0.2
    llm_provider: str = "mock"
    api_key: Optional[str] = ""

class SettingsUpdateSchema(BaseModel):
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    top_k: Optional[int] = None
    embedding_model: Optional[str] = None
    temperature: Optional[float] = None
    llm_provider: Optional[str] = None
    api_key: Optional[str] = None

class HealthCheckSchema(BaseModel):
    status: str
    documents_count: int
    total_chunks: int
    vector_store_indexed: int
    llm_provider: str
