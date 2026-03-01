"""
Analysis Router

Main endpoint that orchestrates the full pitch analysis pipeline:
1. Score the pitch (classification & completeness)
2. If confidence is low, escalate to Gemini LLM
3. Generate semantic embedding
4. Generate audio summary
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.scoring_service import PitchData, score_pitch
from app.services.gemini_service import analyze_with_gemini
from app.services.embedding_service import generate_pitch_embedding
from app.services.tts_service import generate_audio_summary
from app.config import get_settings

router = APIRouter(prefix="/api", tags=["Analysis"])


class PitchSubmission(BaseModel):
    """Request body for pitch analysis."""

    title: str = ""
    summary: str = ""
    sector: str = ""
    target_amount: float = 0.0
    problem_statement: str = ""
    target_market: str = ""
    market_size: str = ""
    solution_description: str = ""
    unique_value: str = ""
    competitive_advantage: str = ""
    revenue_streams: str = ""
    pricing_strategy: str = ""
    customer_acquisition: str = ""
    current_revenue: str = ""
    projected_revenue: str = ""
    burn_rate: str = ""
    runway: str = ""
    document_count: int = 0


class AnalysisResponse(BaseModel):
    """Full analysis response."""

    success: bool
    score: dict
    gemini_analysis: dict | None = None
    embedding: dict | None = None
    audio: dict | None = None


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_pitch(submission: PitchSubmission):
    """
    Full pitch analysis pipeline.

    1. Scores the pitch for completeness and quality
    2. If confidence < threshold, runs Gemini deep analysis
    3. Generates semantic embedding vector
    4. Generates audio summary

    Returns complete analysis results.
    """
    settings = get_settings()

    # Step 1: Score the pitch
    pitch_data = PitchData(
        title=submission.title,
        summary=submission.summary,
        problem_statement=submission.problem_statement,
        target_market=submission.target_market,
        market_size=submission.market_size,
        solution_description=submission.solution_description,
        unique_value=submission.unique_value,
        competitive_advantage=submission.competitive_advantage,
        revenue_streams=submission.revenue_streams,
        pricing_strategy=submission.pricing_strategy,
        customer_acquisition=submission.customer_acquisition,
        current_revenue=submission.current_revenue,
        projected_revenue=submission.projected_revenue,
        burn_rate=submission.burn_rate,
        runway=submission.runway,
        sector=submission.sector,
        target_amount=submission.target_amount,
        document_count=submission.document_count,
    )

    score_result = score_pitch(pitch_data)

    # Step 2: Gemini fallback if confidence is low
    gemini_result = None
    if score_result["confidence"] < settings.CONFIDENCE_THRESHOLD:
        gemini_result = await analyze_with_gemini(submission.model_dump())

    # Step 3: Generate embedding
    try:
        embedding_result = generate_pitch_embedding(submission.model_dump())
    except Exception as e:
        embedding_result = {"error": str(e), "embedding": None}

    # Step 4: Generate audio summary
    try:
        audio_result = await generate_audio_summary(submission.model_dump())
    except Exception as e:
        audio_result = {"success": False, "error": str(e)}

    return AnalysisResponse(
        success=True,
        score=score_result,
        gemini_analysis=gemini_result,
        embedding=embedding_result,
        audio=audio_result,
    )


class ScoreRequest(BaseModel):
    """Request for scoring only (lightweight)."""

    title: str = ""
    summary: str = ""
    sector: str = ""
    target_amount: float = 0.0
    problem_statement: str = ""
    target_market: str = ""
    market_size: str = ""
    solution_description: str = ""
    unique_value: str = ""
    competitive_advantage: str = ""
    revenue_streams: str = ""
    pricing_strategy: str = ""
    customer_acquisition: str = ""
    current_revenue: str = ""
    projected_revenue: str = ""
    burn_rate: str = ""
    runway: str = ""
    document_count: int = 0


@router.post("/score")
async def score_only(req: ScoreRequest):
    """Lightweight scoring endpoint — no embedding or TTS."""
    pitch = PitchData(**req.model_dump())
    return {"success": True, "score": score_pitch(pitch)}


class EmbedRequest(BaseModel):
    """Request for embedding generation."""

    title: str = ""
    summary: str = ""
    sector: str = ""
    problem_statement: str = ""
    target_market: str = ""
    solution_description: str = ""
    unique_value: str = ""
    competitive_advantage: str = ""
    revenue_streams: str = ""


@router.post("/embed")
async def generate_embedding(req: EmbedRequest):
    """Generate semantic embedding for pitch text."""
    try:
        result = generate_pitch_embedding(req.model_dump())
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")


class TTSRequest(BaseModel):
    """Request for TTS audio generation."""

    title: str = ""
    summary: str = ""
    sector: str = ""
    target_amount: float = 0.0
    problem_statement: str = ""
    solution_description: str = ""
    unique_value: str = ""


@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    """Generate audio summary of a pitch."""
    result = await generate_audio_summary(req.model_dump())
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "TTS failed"))
    return result
