"""
Semantic Embedding Service (Step 4.4)

Generates vector embeddings from pitch text using sentence-transformers.
These embeddings are used for semantic matching between pitches and investor preferences.
"""

from sentence_transformers import SentenceTransformer
from functools import lru_cache
import numpy as np


MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    """Load the sentence transformer model (cached singleton)."""
    print(f"📦 Loading embedding model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    print(f"✅ Embedding model loaded: {MODEL_NAME}")
    return model


def generate_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding for a given text string.

    Args:
        text: Input text to embed

    Returns:
        List of floats representing the embedding vector (384 dimensions)
    """
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_pitch_embedding(pitch_data: dict) -> dict:
    """
    Generate a composite embedding for a full pitch submission.

    Combines key pitch fields into a single text, then generates
    the embedding vector for semantic matching.

    Args:
        pitch_data: Dictionary with pitch fields

    Returns:
        Dict with embedding vector, dimension count, and model info
    """
    # Compose a rich text representation of the pitch
    text_parts = [
        f"Title: {pitch_data.get('title', '')}",
        f"Sector: {pitch_data.get('sector', '')}",
        f"Summary: {pitch_data.get('summary', '')}",
        f"Problem: {pitch_data.get('problem_statement', '')}",
        f"Target Market: {pitch_data.get('target_market', '')}",
        f"Solution: {pitch_data.get('solution_description', '')}",
        f"Unique Value: {pitch_data.get('unique_value', '')}",
        f"Competitive Advantage: {pitch_data.get('competitive_advantage', '')}",
        f"Revenue Model: {pitch_data.get('revenue_streams', '')}",
    ]

    combined_text = "\n".join(part for part in text_parts if part.split(": ", 1)[-1].strip())
    embedding = generate_embedding(combined_text)

    return {
        "embedding": embedding,
        "dimensions": len(embedding),
        "model": MODEL_NAME,
        "text_length": len(combined_text),
    }


def compute_similarity(embedding_a: list[float], embedding_b: list[float]) -> float:
    """
    Compute cosine similarity between two embedding vectors.

    Returns:
        Float between -1.0 and 1.0 (higher = more similar)
    """
    a = np.array(embedding_a)
    b = np.array(embedding_b)
    similarity = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    return round(similarity, 4)
