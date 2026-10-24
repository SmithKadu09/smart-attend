import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("students.id"),
        nullable=False
    )

    classroom_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("classrooms.id"),
        nullable=False
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "classroom_id",
            name="uq_student_classroom"
        ),
    )