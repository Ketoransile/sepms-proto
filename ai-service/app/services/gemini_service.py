"""
LLM Fallback Service (Step 4.3)

When the scoring engine's confidence falls below the threshold,
escalate to Google Gemini for deeper qualitative analysis.
"""

from google import genai
from app.config import get_settings


def get_gemini_client() -> genai.Client:
    """Get a Gemini API client instance."""
    settings = get_settings()
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in .env")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


ANALYSIS_PROMPT = """You are an expert startup investment analyst. Analyze the following pitch submission and provide:

1. **Overall Assessment** (2-3 sentences): Is this a compelling investment opportunity?
2. **Strengths** (3-5 bullet points): What makes this pitch strong?
3. **Weaknesses** (3-5 bullet points): What needs improvement?
4. **Market Viability Score** (0-100): How viable is the market opportunity?
5. **Team Readiness Score** (0-100): Based on the information provided, how prepared does the team seem?
6. **Investment Recommendation**: One of [STRONG_PASS, PASS, NEUTRAL, CONSIDER, STRONG_CONSIDER]

## Pitch Data:
**Title:** {title}
**Sector:** {sector}
**Target Funding:** ${target_amount:,.0f}

**Executive Summary:**
{summary}

**Problem Statement:**
{problem_statement}

**Target Market:**
{target_market}

**Market Size:**
{market_size}

**Solution:**
{solution_description}

**Unique Value Proposition:**
{unique_value}

**Competitive Advantage:**
{competitive_advantage}

**Revenue Streams:**
{revenue_streams}

**Pricing Strategy:**
{pricing_strategy}

**Customer Acquisition:**
{customer_acquisition}

**Financial Projections:**
- Current Revenue: {current_revenue}
- Projected Revenue: {projected_revenue}
- Burn Rate: {burn_rate}
- Runway: {runway}

Respond in valid JSON format with these exact keys:
{{
    "overall_assessment": "...",
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "market_viability_score": 0,
    "team_readiness_score": 0,
    "investment_recommendation": "...",
    "detailed_feedback": "..."
}}
"""


async def analyze_with_gemini(pitch_data: dict) -> dict:
    """
    Use Google Gemini to perform deep qualitative analysis of a pitch.

    Args:
        pitch_data: Dictionary containing all pitch fields

    Returns:
        Dict with Gemini's analysis or error information
    """
    try:
        client = get_gemini_client()

        prompt = ANALYSIS_PROMPT.format(
            title=pitch_data.get("title", "N/A"),
            sector=pitch_data.get("sector", "N/A"),
            target_amount=pitch_data.get("target_amount", 0),
            summary=pitch_data.get("summary", "N/A"),
            problem_statement=pitch_data.get("problem_statement", "N/A"),
            target_market=pitch_data.get("target_market", "N/A"),
            market_size=pitch_data.get("market_size", "N/A"),
            solution_description=pitch_data.get("solution_description", "N/A"),
            unique_value=pitch_data.get("unique_value", "N/A"),
            competitive_advantage=pitch_data.get("competitive_advantage", "N/A"),
            revenue_streams=pitch_data.get("revenue_streams", "N/A"),
            pricing_strategy=pitch_data.get("pricing_strategy", "N/A"),
            customer_acquisition=pitch_data.get("customer_acquisition", "N/A"),
            current_revenue=pitch_data.get("current_revenue", "N/A"),
            projected_revenue=pitch_data.get("projected_revenue", "N/A"),
            burn_rate=pitch_data.get("burn_rate", "N/A"),
            runway=pitch_data.get("runway", "N/A"),
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )

        import json

        analysis = json.loads(response.text)

        return {
            "success": True,
            "analysis": analysis,
            "model": "gemini-2.0-flash",
        }

    except ValueError as e:
        return {"success": False, "error": str(e), "analysis": None}
    except Exception as e:
        return {"success": False, "error": f"Gemini analysis failed: {str(e)}", "analysis": None}
