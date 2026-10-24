
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.biometric_profile import BiometricProfile
from app.models.enrollment import Enrollment
from app.ml.matching_service import rank_matches


def get_enrolled_profiles(
    db: Session,
    classroom_id,
) -> list[dict]:
    """Retrieve biometric profiles for students enrolled in a classroom."""

    statement = (
        select(
            BiometricProfile.student_id,
            BiometricProfile.embedding,
        )
        .join(
            Enrollment,
            Enrollment.student_id == BiometricProfile.student_id,
        )
        .where(Enrollment.classroom_id == classroom_id)
    )

    rows = db.execute(statement).all()

    return [
        {
            "student_id": str(row.student_id),
            "embedding": list(row.embedding),
        }
        for row in rows
    ]


def match_face_to_classroom(
    db: Session,
    classroom_id,
    query_embedding: list[float],
) -> list[dict]:
    """
    Rank enrolled students by similarity to a detected face.
    Only students enrolled in the specified classroom are considered.
    """

    enrolled_profiles = get_enrolled_profiles(
        db=db,
        classroom_id=classroom_id,
    )

    return rank_matches(
        query_embedding=query_embedding,
        enrolled_profiles=enrolled_profiles,
    )
