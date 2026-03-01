"""
Classification & Scoring Service (Step 4.2)

Analyzes pitch submissions and generates a completeness/quality score
using text-based features and scikit-learn.
"""

import numpy as np
from dataclasses import dataclass


@dataclass
class PitchData:
    """Structured pitch data for scoring."""

    title: str = ""
    summary: str = ""
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
    sector: str = ""
    target_amount: float = 0.0
    document_count: int = 0


# Field weights for scoring (out of 100)
FIELD_WEIGHTS = {
    "title": 5,
    "summary": 10,
    "problem_statement": 12,
    "target_market": 8,
    "market_size": 8,
    "solution_description": 12,
    "unique_value": 8,
    "competitive_advantage": 8,
    "revenue_streams": 8,
    "pricing_strategy": 5,
    "customer_acquisition": 5,
    "projected_revenue": 6,
    "target_amount": 3,
    "document_count": 2,
}

# Minimum word counts for quality thresholds
QUALITY_THRESHOLDS = {
    "title": 3,
    "summary": 15,
    "problem_statement": 20,
    "target_market": 10,
    "market_size": 5,
    "solution_description": 20,
    "unique_value": 10,
    "competitive_advantage": 10,
    "revenue_streams": 10,
    "pricing_strategy": 8,
    "customer_acquisition": 10,
    "projected_revenue": 3,
}


def compute_field_score(text: str, min_words: int) -> float:
    """
    Score a text field from 0.0 to 1.0 based on completeness.

    - 0.0 if empty
    - 0.5 if present but below threshold
    - 0.75+ if meets threshold (scaled by word count up to 1.0)
    """
    if not text or not text.strip():
        return 0.0

    word_count = len(text.split())

    if word_count < min_words:
        return 0.3 + (0.4 * (word_count / min_words))

    # Scale from 0.75 to 1.0 based on how much over the threshold
    bonus = min(word_count / (min_words * 3), 1.0)
    return 0.75 + (0.25 * bonus)


def score_pitch(pitch: PitchData) -> dict:
    """
    Generate a comprehensive pitch completeness and quality score.

    Returns a dict with:
    - overall_score: 0-100 integer score
    - confidence: 0.0-1.0 confidence in the score
    - field_scores: per-field breakdown
    - missing_fields: list of empty required fields
    - suggestions: improvement recommendations
    """
    field_scores: dict[str, float] = {}
    missing_fields: list[str] = []
    suggestions: list[str] = []

    # Score each text field
    text_fields = {
        "title": pitch.title,
        "summary": pitch.summary,
        "problem_statement": pitch.problem_statement,
        "target_market": pitch.target_market,
        "market_size": pitch.market_size,
        "solution_description": pitch.solution_description,
        "unique_value": pitch.unique_value,
        "competitive_advantage": pitch.competitive_advantage,
        "revenue_streams": pitch.revenue_streams,
        "pricing_strategy": pitch.pricing_strategy,
        "customer_acquisition": pitch.customer_acquisition,
        "projected_revenue": pitch.projected_revenue,
    }

    for field_name, field_text in text_fields.items():
        threshold = QUALITY_THRESHOLDS.get(field_name, 5)
        score = compute_field_score(field_text, threshold)
        field_scores[field_name] = round(score, 2)

        if score == 0.0:
            missing_fields.append(field_name)
            suggestions.append(f"Add content for '{field_name.replace('_', ' ')}'")
        elif score < 0.7:
            suggestions.append(
                f"Expand '{field_name.replace('_', ' ')}' — add more detail (currently below quality threshold)"
            )

    # Score numeric fields
    if pitch.target_amount > 0:
        field_scores["target_amount"] = 1.0
    else:
        field_scores["target_amount"] = 0.0
        missing_fields.append("target_amount")
        suggestions.append("Specify your target funding amount")

    if pitch.document_count > 0:
        field_scores["document_count"] = min(pitch.document_count / 3, 1.0)
    else:
        field_scores["document_count"] = 0.0
        suggestions.append("Upload supporting documents (pitch deck, financials, etc.)")

    # Calculate weighted overall score
    weighted_sum = 0.0
    total_weight = 0.0
    for field_name, weight in FIELD_WEIGHTS.items():
        if field_name in field_scores:
            weighted_sum += field_scores[field_name] * weight
            total_weight += weight

    overall_score = round((weighted_sum / total_weight) * 100) if total_weight > 0 else 0

    # Confidence is based on how many fields are filled
    filled_ratio = 1 - (len(missing_fields) / len(FIELD_WEIGHTS))
    score_values = list(field_scores.values())
    avg_quality = float(np.mean(score_values)) if score_values else 0.0
    confidence = round(filled_ratio * 0.5 + avg_quality * 0.5, 2)

    return {
        "overall_score": min(overall_score, 100),
        "confidence": confidence,
        "field_scores": field_scores,
        "missing_fields": missing_fields,
        "suggestions": suggestions[:5],  # Top 5 suggestions
        "grade": _score_to_grade(overall_score),
    }


def _score_to_grade(score: int) -> str:
    """Convert numeric score to letter grade."""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"
