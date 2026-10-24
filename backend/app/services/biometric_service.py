
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.biometric_profile import BiometricProfile
from app.models.student import Student


def save_biometric_profile(
    db: Session,
    user_id,
    embedding: list[float],
) -> BiometricProfile:
    student = db.scalar(
        select(Student).where(Student.user_id == user_id)
    )

    if student is None:
        raise ValueError("Student profile not found.")

    existing_profile = db.scalar(
        select(BiometricProfile).where(
            BiometricProfile.student_id == student.id
        )
    )

    if existing_profile is not None:
        raise ValueError(
            "A biometric profile already exists. "
            "Use the update flow to replace it."
        )

    if len(embedding) != 128:
        raise ValueError("Embedding must contain exactly 128 values.")

    profile = BiometricProfile(
        student_id=student.id,
        embedding=embedding,
    )

    try:
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    except Exception:
        db.rollback()
        raise
