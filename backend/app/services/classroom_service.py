
import secrets
import string

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.classroom import Classroom
from app.models.teacher import Teacher
from app.schemas.classroom import ClassroomCreate
from app.models.student import Student
from app.models.enrollment import Enrollment

def generate_class_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(8))


def create_classroom(
    db: Session,
    user_id,
    data: ClassroomCreate,
) -> Classroom:
    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    for _ in range(5):
        class_code = generate_class_code()

        existing = db.scalar(
            select(Classroom).where(
                Classroom.class_code == class_code
            )
        )

        if existing is None:
            classroom = Classroom(
                teacher_id=teacher.id,
                name=data.name.strip(),
                subject=data.subject.strip(),
                class_code=class_code,
            )

            try:
                db.add(classroom)
                db.commit()
                db.refresh(classroom)
                return classroom
            except Exception:
                db.rollback()
                raise

    raise RuntimeError("Could not generate a unique class code.")


def get_joined_classrooms(db: Session, user_id) -> list[Classroom]:
    student = db.scalar(
        select(Student).where(Student.user_id == user_id)
    )

    if student is None:
        raise ValueError("Student profile not found.")

    statement = (
        select(Classroom)
        .join(Enrollment, Enrollment.classroom_id == Classroom.id)
        .where(Enrollment.student_id == student.id)
        .order_by(Classroom.created_at.desc())
    )

    return list(db.scalars(statement).all())


def get_teacher_classrooms(db: Session, user_id) -> list[Classroom]:
    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    statement = (
        select(Classroom)
        .where(Classroom.teacher_id == teacher.id)
        .order_by(Classroom.created_at.desc())
    )

    return list(db.scalars(statement).all())

