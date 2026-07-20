from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from models.schemas import ChatRequestSchema, ChatResponseSchema, CitationSchema
from api.settings import get_current_settings
from rag.retriever import RetrieverService
from rag.prompt_builder import PromptBuilder
from rag.generator import LLMGenerator
import json
import uuid

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponseSchema)
def chat_endpoint(
    payload: ChatRequestSchema,
    db: Session = Depends(get_db)
):
    """Processes user question: performs retrieval, builds grounded prompt, calls LLM, returns citations."""
    settings = get_current_settings(db)
    top_k = int(settings["top_k"])
    llm_provider = settings["llm_provider"]
    api_key = settings["api_key"]
    temperature = float(settings["temperature"])

    retrieved_chunks = RetrieverService.retrieve(
        query=payload.question,
        top_k=top_k,
        document_ids=payload.document_ids
    )

    citations = []
    for chunk in retrieved_chunks:
        doc_id = chunk["document_id"]
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        doc_name = doc.filename if doc else "Unknown Document"
        
        citations.append(CitationSchema(
            document_id=doc_id,
            document_name=doc_name,
            page_number=chunk["page_number"],
            chunk_index=chunk["chunk_index"],
            score=chunk["score"],
            snippet=chunk["text"]
        ))

    system_prompt, user_prompt = PromptBuilder.build_rag_prompt(
        query=payload.question,
        chunks=retrieved_chunks
    )

    generator = LLMGenerator.get_generator(provider=llm_provider, api_key=api_key)
    answer = generator.generate(
        prompt=user_prompt,
        system_prompt=system_prompt,
        temperature=temperature
    )

    chat_record = models.ChatMessage(
        id=str(uuid.uuid4()),
        question=payload.question,
        answer=answer,
        citations_json=json.dumps([c.model_dump() for c in citations])
    )
    db.add(chat_record)
    db.commit()

    return ChatResponseSchema(
        id=chat_record.id,
        question=payload.question,
        answer=answer,
        citations=citations,
        created_at=chat_record.created_at
    )
