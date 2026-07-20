from rag.chunker import TextChunker

def test_text_chunker():
    dummy_pages = [
        {
            "page_number": 1,
            "text": "Sentence one is long enough. Sentence two follows immediately. Sentence three concludes page one."
        }
    ]

    chunks = TextChunker.chunk_document_pages(
        pages=dummy_pages,
        chunk_size=40,
        chunk_overlap=10
    )

    assert len(chunks) > 1
    assert chunks[0]["page_number"] == 1
    assert "start_char" in chunks[0]
    assert "end_char" in chunks[0]
