from typing import List, Dict, Any
from core.logger import logger

class TextChunker:
    """Sliding-window recursive chunking isolating chunk logic."""

    @staticmethod
    def chunk_document_pages(
        pages: List[Dict[str, Any]],
        chunk_size: int = 500,
        chunk_overlap: int = 50
    ) -> List[Dict[str, Any]]:
        """Chunks page text into overlapping windows while preserving page metadata.

        Args:
            pages (List[Dict[str, Any]]): Pages output from PDFLoader.
            chunk_size (int): Max character length per chunk.
            chunk_overlap (int): Overlap characters between consecutive chunks.

        Returns:
            List[Dict[str, Any]]: List of chunk dicts containing chunk_index, text, page_number, start_char, end_char.
        """
        if chunk_overlap >= chunk_size:
            chunk_overlap = max(0, chunk_size - 50)

        chunks = []
        global_chunk_idx = 0

        for page in pages:
            page_num = page["page_number"]
            text = page["text"]
            text_len = len(text)

            if text_len == 0:
                continue

            start = 0
            while start < text_len:
                end = min(start + chunk_size, text_len)
                
                # Try to split at a word boundary near the end
                if end < text_len:
                    last_space = text.rfind(" ", start, end)
                    if last_space != -1 and last_space > start + (chunk_size // 2):
                        end = last_space

                chunk_text = text[start:end].strip()
                if chunk_text:
                    chunks.append({
                        "chunk_index": global_chunk_idx,
                        "text": chunk_text,
                        "page_number": page_num,
                        "start_char": start,
                        "end_char": end
                    })
                    global_chunk_idx += 1

                if end >= text_len:
                    break
                
                step = (end - start) - chunk_overlap
                if step <= 0:
                    step = max(1, end - start)
                start += step

        logger.info(f"Generated {len(chunks)} text chunks (size={chunk_size}, overlap={chunk_overlap}).")
        return chunks
