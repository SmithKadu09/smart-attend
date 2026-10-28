
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.core.token import create_access_token
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher
from app.schemas.auth import RegisterRequest


def register_user(db: Session, data: RegisterRequest) -> User:
    email = str(data.email).strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise ValueError("An account with this email already exists.")

    student_number = None

    if data.role == "student":
        student_number = (data.student_number or "").strip()

        existing_student = db.scalar(
            select(Student).where(
                Student.student_number == student_number
            )
        )

        if existing_student:
            raise ValueError(
                "This student number is already registered. "
                "Please use a different one."
            )

    user = User(
        name=data.name.strip(),
        email=email,
        password_hash=hash_password(data.password),
        role=data.role,
    )

    try:
        db.add(user)
        db.flush()

        if data.role == "student":
            student = Student(
                user_id=user.id,
                student_number=student_number,
            )
            db.add(student)

        elif data.role == "teacher":
            teacher = Teacher(user_id=user.id)
            db.add(teacher)

        db.commit()
        db.refresh(user)
        return user

    except IntegrityError:
        db.rollback()

        # Handle duplicate student numbers even if two registrations
        # attempt to use the same number at nearly the same time.
        if data.role == "student":
            existing_student = db.scalar(
                select(Student).where(
                    Student.student_number == student_number
                )
            )

            if existing_student:
                raise ValueError(
                    "This student number is already registered. "
                    "Please use a different one."
                ) from None

        raise

    except Exception:
        db.rollback()
        raise


def login_user(db: Session, email: str, password: str) -> dict:
    normalized_email = email.strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if user is None or not verify_password(
        password, user.password_hash
    ):
        raise ValueError("Invalid email or password.")

    access_token = create_access_token(
        user_id=str(user.id),
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }
