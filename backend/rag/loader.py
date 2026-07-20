import fitz  # PyMuPDF
from typing import List, Dict, Any
from core.logger import logger

class PDFLoader:
    """Extracts clean text from PDF documents while preserving exact page numbers and metadata."""

    @staticmethod
    def extract_pages(file_path: str) -> List[Dict[str, Any]]:
        """Extracts text page by page from a PDF file.

        Args:
            file_path (str): Absolute path to the PDF document.

        Returns:
            List[Dict[str, Any]]: List of page dictionaries containing page_number, text, and char_count.
        """
        logger.info(f"Loading PDF document: {file_path}")
        pages = []
        try:
            doc = fitz.open(file_path)
            for page_idx in range(len(doc)):
                page = doc.load_page(page_idx)
                raw_text = page.get_text("text")
                cleaned_text = PDFLoader._clean_text(raw_text)
                
                if cleaned_text.strip():
                    pages.append({
                        "page_number": page_idx + 1,  # 1-indexed
                        "text": cleaned_text,
                        "char_count": len(cleaned_text)
                    })
            doc.close()
            logger.info(f"Successfully extracted {len(pages)} non-empty pages from {file_path}")
            return pages
        except Exception as e:
            logger.error(f"Failed to load or parse PDF file {file_path}: {str(e)}")
            raise RuntimeError(f"PDF extraction failed for {file_path}: {str(e)}")

    @staticmethod
    def _clean_text(text: str) -> str:
        """Cleans extracted text by resolving hyphenations and redundant whitespace."""
        text = text.replace("-\n", "")
        lines = [line.strip() for line in text.splitlines()]
        cleaned = "\n".join(lines)
        return cleaned
