
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.classroom import Classroom
from app.models.enrollment import Enrollment
from app.models.student import Student


def join_classroom(
    db: Session,
    user_id,
    class_code: str,
) -> Enrollment:
    student = db.scalar(
        select(Student).where(Student.user_id == user_id)
    )

    if student is None:
        raise ValueError("Student profile not found.")

    normalized_code = class_code.strip().upper()

    classroom = db.scalar(
        select(Classroom).where(
            Classroom.class_code == normalized_code
        )
    )

    if classroom is None:
        raise ValueError("Invalid classroom code.")

    existing = db.scalar(
        select(Enrollment).where(
            Enrollment.student_id == student.id,
            Enrollment.classroom_id == classroom.id,
        )
    )

    if existing is not None:
        raise ValueError("You have already joined this classroom.")

    enrollment = Enrollment(
        student_id=student.id,
        classroom_id=classroom.id,
    )

    try:
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
        return enrollment
    except IntegrityError:
        db.rollback()
        raise ValueError(
            "You have already joined this classroom."
        ) from None
    except Exception:
        db.rollback()
        raise
