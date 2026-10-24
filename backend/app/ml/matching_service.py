
import numpy as np


def cosine_similarity(
    embedding_a: list[float],
    embedding_b: list[float],
) -> float:
    """Calculate cosine similarity between two embeddings."""

    a = np.asarray(embedding_a, dtype=np.float32).flatten()
    b = np.asarray(embedding_b, dtype=np.float32).flatten()

    if a.shape != b.shape:
        raise ValueError("Embeddings must have the same dimensions.")

    if a.size != 128:
        raise ValueError("Expected 128-dimensional face embeddings.")

    if not np.all(np.isfinite(a)) or not np.all(np.isfinite(b)):
        raise ValueError("Embeddings contain invalid numeric values.")

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        raise ValueError("Cannot compare a zero-length embedding.")

    score = np.dot(a, b) / (norm_a * norm_b)

    return float(np.clip(score, -1.0, 1.0))


def rank_matches(
    query_embedding: list[float],
    enrolled_profiles: list[dict],
) -> list[dict]:
    """Rank enrolled student profiles by cosine similarity."""

    matches = []

    for profile in enrolled_profiles:
        score = cosine_similarity(
            query_embedding,
            profile["embedding"],
        )

        matches.append({
            "student_id": profile["student_id"],
            "similarity": score,
        })

    return sorted(
        matches,
        key=lambda item: item["similarity"],
        reverse=True,
    )
