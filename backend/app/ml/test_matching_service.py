
from app.ml.matching_service import (
    cosine_similarity,
    rank_matches,
)


def main():
    # Simple sample embeddings for testing the logic.
    query_embedding = [1.0, 0.0, 0.0]

    enrolled_profiles = [
        {
            "student_id": "student_A",
            "embedding": [0.0, 1.0, 0.0],
        },
        {
            "student_id": "student_B",
            "embedding": [0.9, 0.1, 0.0],
        },
        {
            "student_id": "student_C",
            "embedding": [1.0, 0.0, 0.0],
        },
    ]

    print("Testing cosine similarity:")
    print(
        "Identical embeddings:",
        round(
            cosine_similarity(
                query_embedding,
                [1.0, 0.0, 0.0],
            ),
            4,
        ),
    )

    print("\nRanking enrolled profiles:")

    matches = rank_matches(
        query_embedding,
        enrolled_profiles,
    )

    for match in matches:
        print(
            f"{match['student_id']}: "
            f"{match['similarity']:.4f}"
        )

    assert matches[0]["student_id"] == "student_C"
    assert matches[1]["student_id"] == "student_B"
    assert matches[2]["student_id"] == "student_A"

    print("\nAll matching-service tests passed!")


if __name__ == "__main__":
    main()
