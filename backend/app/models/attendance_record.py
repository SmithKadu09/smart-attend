
import uuid
from datetime import datetime
from typing import Literal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    Uuid,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("attendance_sessions.id"),
        nullable=False
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("students.id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="NOT_DETECTED"
    )

    confidence: Mapped[float | None] = mapped_column(
        nullable=True
    )

    marked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "student_id",
            name="uq_session_student"
        ),
        CheckConstraint(
            "status IN ('PRESENT', 'ABSENT', 'REVIEW', "
            "'UNKNOWN', 'NOT_DETECTED')",
            name="ck_attendance_status"
        ),
        CheckConstraint(
            "confidence IS NULL OR "
            "(confidence >= 0 AND confidence <= 1)",
            name="ck_attendance_confidence"
        ),
    )

