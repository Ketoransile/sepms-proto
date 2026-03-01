"""
Text-to-Speech Service (Step 4.5)

Generates audio summaries of pitch submissions for investor dashboards.
Uses Google Text-to-Speech (gTTS) for audio generation.
"""

import io
import base64
from gtts import gTTS


def generate_pitch_summary_text(pitch_data: dict) -> str:
    """
    Create a natural-language summary of the pitch for TTS.

    Args:
        pitch_data: Dictionary with pitch fields

    Returns:
        A spoken-language summary string
    """
    title = pitch_data.get("title", "Untitled Pitch")
    sector = pitch_data.get("sector", "unspecified sector")
    summary = pitch_data.get("summary", "")
    target_amount = pitch_data.get("target_amount", 0)
    problem = pitch_data.get("problem_statement", "")
    solution = pitch_data.get("solution_description", "")
    unique_value = pitch_data.get("unique_value", "")

    parts = [f"Pitch summary for {title}, in the {sector.replace('_', ' ')} sector."]

    if target_amount:
        parts.append(f"This startup is seeking ${target_amount:,.0f} in funding.")

    if summary:
        parts.append(summary[:300])

    if problem:
        parts.append(f"The problem they're solving: {problem[:200]}")

    if solution:
        parts.append(f"Their solution: {solution[:200]}")

    if unique_value:
        parts.append(f"What makes them unique: {unique_value[:200]}")

    return " ".join(parts)


async def generate_audio_summary(pitch_data: dict, language: str = "en") -> dict:
    """
    Generate an MP3 audio summary of a pitch.

    Args:
        pitch_data: Dictionary with pitch fields
        language: Language code for TTS (default: English)

    Returns:
        Dict with base64-encoded audio, duration estimate, and text used
    """
    try:
        summary_text = generate_pitch_summary_text(pitch_data)

        if not summary_text or len(summary_text) < 10:
            return {
                "success": False,
                "error": "Not enough content to generate audio summary",
            }

        # Generate audio
        tts = gTTS(text=summary_text, lang=language, slow=False)

        # Write to bytes buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        audio_bytes = audio_buffer.read()
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

        # Rough duration estimate: ~150 words per minute
        word_count = len(summary_text.split())
        estimated_duration = round(word_count / 2.5, 1)  # seconds

        return {
            "success": True,
            "audio_base64": audio_base64,
            "format": "mp3",
            "size_bytes": len(audio_bytes),
            "estimated_duration_seconds": estimated_duration,
            "text_used": summary_text,
            "word_count": word_count,
        }

    except Exception as e:
        return {"success": False, "error": f"TTS generation failed: {str(e)}"}
