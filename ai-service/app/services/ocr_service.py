"""
OCR & Document Extraction Service (Step 4.1)

Receives document URLs, downloads them, runs OCR/text extraction,
and returns structured text content for further analysis.
"""

import io
import httpx
from PyPDF2 import PdfReader
from PIL import Image

# Try importing pytesseract; it requires Tesseract OCR to be installed on the system
try:
    import pytesseract

    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


async def download_file(url: str) -> bytes:
    """Download a file from a URL and return its bytes."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text content from a PDF file."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text_parts: list[str] = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text.strip())

    return "\n\n".join(text_parts)


def extract_text_from_image(image_bytes: bytes) -> str:
    """Run OCR on an image to extract text."""
    if not TESSERACT_AVAILABLE:
        return "[OCR unavailable — pytesseract/Tesseract not installed]"

    image = Image.open(io.BytesIO(image_bytes))
    text: str = pytesseract.image_to_string(image)
    return text.strip()


async def extract_document_text(url: str, file_type: str = "auto") -> dict:
    """
    Download a document from URL and extract its text content.

    Args:
        url: URL to the document (PDF, image, etc.)
        file_type: Either 'pdf', 'image', or 'auto' (detects from URL)

    Returns:
        Dict with 'text', 'pages', 'method', and 'success' keys
    """
    try:
        file_bytes = await download_file(url)

        # Auto-detect file type
        if file_type == "auto":
            lower_url = url.lower()
            if lower_url.endswith(".pdf") or "pdf" in lower_url:
                file_type = "pdf"
            elif any(lower_url.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                file_type = "image"
            else:
                file_type = "pdf"  # Default to PDF

        if file_type == "pdf":
            text = extract_text_from_pdf(file_bytes)
            method = "pdf_text_extraction"
        elif file_type == "image":
            text = extract_text_from_image(file_bytes)
            method = "ocr_tesseract"
        else:
            return {
                "success": False,
                "text": "",
                "method": "none",
                "error": f"Unsupported file type: {file_type}",
            }

        return {
            "success": True,
            "text": text,
            "method": method,
            "character_count": len(text),
            "word_count": len(text.split()) if text else 0,
        }

    except httpx.HTTPError as e:
        return {"success": False, "text": "", "method": "none", "error": f"Download failed: {str(e)}"}
    except Exception as e:
        return {"success": False, "text": "", "method": "none", "error": f"Extraction failed: {str(e)}"}
