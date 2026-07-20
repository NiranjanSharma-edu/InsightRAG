import pytest
import fitz  # PyMuPDF
from rag.loader import PDFLoader

@pytest.fixture
def sample_pdf(tmp_path):
    pdf_path = str(tmp_path / "sample.pdf")
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Hello InsightRAG! This is a test PDF document for unit testing.")
    doc.save(pdf_path)
    doc.close()
    return pdf_path

def test_pdf_extraction(sample_pdf):
    pages = PDFLoader.extract_pages(sample_pdf)
    assert len(pages) == 1
    assert pages[0]["page_number"] == 1
    assert "Hello InsightRAG!" in pages[0]["text"]
