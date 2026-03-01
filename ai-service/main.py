from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from dotenv import load_dotenv

from app.config import get_settings
from app.routers import analysis, ocr

# Load environment variables
load_dotenv()

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI Processing Microservice for the Smart Entrepreneurial Pitching & Matching System",
    version=settings.APP_VERSION,
)

# ---------------------
# CORS Configuration
# ---------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        settings.BACKEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------
# Include Routers
# ---------------------
app.include_router(analysis.router)
app.include_router(ocr.router)


# ---------------------
# Health Check Endpoints
# ---------------------
@app.get("/")
async def root():
    return {
        "status": "OK",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints": [
            "POST /api/analyze  — Full analysis pipeline",
            "POST /api/score    — Pitch scoring only",
            "POST /api/embed    — Semantic embedding",
            "POST /api/tts      — Audio summary",
            "POST /api/ocr      — Document text extraction",
        ],
    }
