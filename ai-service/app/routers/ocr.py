"""
OCR Router

Endpoint for document text extraction via OCR.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from app.services.ocr_service import extract_document_text

router = APIRouter(prefix="/api", tags=["OCR"])


class OCRRequest(BaseModel):
    """Request body for OCR extraction."""

    url: str
    file_type: str = "auto"  # 'pdf', 'image', or 'auto'


@router.post("/ocr")
async def ocr_extract(req: OCRRequest):
    """
    Extract text from a document URL.

    Supports PDFs (text extraction) and images (OCR via Tesseract).
    """
    result = await extract_document_text(req.url, req.file_type)
    return result
