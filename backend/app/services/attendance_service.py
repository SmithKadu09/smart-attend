
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attendance_session import AttendanceSession
from app.models.classroom import Classroom
from app.models.teacher import Teacher
from app.models.attendance_record import AttendanceRecord
from app.models.enrollment import Enrollment
from app.models.student import Student
from app.models.user import User
from app.ml.attendance_recognition_service import recognize_classroom_photo


# Provisional thresholds for testing only.
MATCH_THRESHOLD = 0.75
MIN_MATCH_GAP = 0.05


def create_attendance_session(
    db: Session,
    user_id: UUID,
    classroom_id: UUID,
) -> AttendanceSession:
    """Create an attendance session for a classroom owned by the teacher."""

    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    classroom = db.scalar(
        select(Classroom).where(
            Classroom.id == classroom_id,
            Classroom.teacher_id == teacher.id,
        )
    )

    if classroom is None:
        raise ValueError(
            "Classroom not found or you do not have permission to access it."
        )

    session = AttendanceSession(
        classroom_id=classroom.id,
        started_at=datetime.now(timezone.utc),
    )

    try:
        db.add(session)
        db.commit()
        db.refresh(session)
        return session
    except Exception:
        db.rollback()
        raise


def process_classroom_photo(
    db: Session,
    user_id: UUID,
    session_id: UUID,
    image_bytes: bytes,
) -> dict:
    """Process a classroom photo and save attendance records."""

    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    session = db.scalar(
        select(AttendanceSession)
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(
            AttendanceSession.id == session_id,
            Classroom.teacher_id == teacher.id,
        )
    )

    if session is None:
        raise ValueError(
            "Attendance session not found or access denied."
        )

    if session.completed_at is not None:
        raise ValueError("This attendance session is already completed.")

    classroom_id = session.classroom_id

    recognition = recognize_classroom_photo(
        db=db,
        classroom_id=classroom_id,
        image_bytes=image_bytes,
    )

    enrolled_student_ids = db.scalars(
        select(Enrollment.student_id).where(
            Enrollment.classroom_id == classroom_id
        )
    ).all()

    existing_records = db.scalars(
        select(AttendanceRecord).where(
            AttendanceRecord.session_id == session.id
        )
    ).all()

    records = {
        record.student_id: record
        for record in existing_records
    }

    # Create a record for every enrolled student.
    for student_id in enrolled_student_ids:
        if student_id not in records:
            record = AttendanceRecord(
                session_id=session.id,
                student_id=student_id,
                status="NOT_DETECTED",
            )
            db.add(record)
            records[student_id] = record

    # Process every detected face before committing.
    for result in recognition["results"]:
        best_match = result.get("best_match")
        second_match = result.get("second_match")

        if best_match is None:
            continue

        if result["status"] != "REVIEW":
            continue

        similarity = best_match["similarity"]

        if similarity < MATCH_THRESHOLD:
            continue

        if (
            second_match is not None
            and similarity - second_match["similarity"] < MIN_MATCH_GAP
        ):
            continue

        try:
            matched_student_id = UUID(best_match["student_id"])
        except (ValueError, TypeError):
            continue

        if matched_student_id not in records:
            continue

        record = records[matched_student_id]
        record.status = "PRESENT"
        record.confidence = similarity

        if record.marked_at is None:
            record.marked_at = datetime.now(timezone.utc)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "message": "Photo processed and attendance records saved.",
        "session_id": str(session.id),
        "faces_detected": recognition["faces_detected"],
        "results": recognition["results"],
        "records_created_or_updated": len(records),
    }


def finalize_attendance_session(
    db: Session,
    user_id: UUID,
    session_id: UUID,
) -> AttendanceSession:
    """Finalize a session owned by the teacher."""

    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    session = db.scalar(
        select(AttendanceSession)
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(
            AttendanceSession.id == session_id,
            Classroom.teacher_id == teacher.id,
        )
    )

    if session is None:
        raise ValueError(
            "Attendance session not found or access denied."
        )

    if session.completed_at is not None:
        raise ValueError("This attendance session is already finalized.")

    session.completed_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(session)
        return session
    except Exception:
        db.rollback()
        raise


def review_attendance_record(
    db: Session,
    user_id: UUID,
    session_id: UUID,
    student_id: UUID,
    new_status: str,
) -> AttendanceRecord:
    """Allow the owning teacher to correct an attendance record."""

    allowed_statuses = {
        "PRESENT",
        "ABSENT",
        "REVIEW",
        "UNKNOWN",
        "NOT_DETECTED",
    }

    if new_status not in allowed_statuses:
        raise ValueError(
            "Status must be PRESENT, ABSENT, REVIEW, UNKNOWN, or NOT_DETECTED."
        )

    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    # Verify that this session belongs to the logged-in teacher.
    session = db.scalar(
        select(AttendanceSession)
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(
            AttendanceSession.id == session_id,
            Classroom.teacher_id == teacher.id,
        )
    )

    if session is None:
        raise ValueError(
            "Attendance session not found or access denied."
        )

    # Corrections are allowed after finalization.
    record = db.scalar(
        select(AttendanceRecord).where(
            AttendanceRecord.session_id == session_id,
            AttendanceRecord.student_id == student_id,
        )
    )

    if record is None:
        raise ValueError("Attendance record not found.")

    previous_status = record.status
    record.status = new_status

    if new_status == "PRESENT":
        if previous_status != "PRESENT" or record.marked_at is None:
            record.marked_at = datetime.now(timezone.utc)

    else:
        record.marked_at = None
        record.confidence = None

    try:
        db.commit()
        db.refresh(record)
        return record
    except Exception:
        db.rollback()
        raise


def get_attendance_session_records(
    db: Session,
    user_id: UUID,
    session_id: UUID,
) -> dict:
    """Return attendance records with student names for the teacher."""

    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    attendance_session = db.scalar(
        select(AttendanceSession)
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(
            AttendanceSession.id == session_id,
            Classroom.teacher_id == teacher.id,
        )
    )

    if attendance_session is None:
        raise ValueError(
            "Attendance session not found or access denied."
        )

    rows = db.execute(
        select(
            AttendanceRecord,
            Student.student_number,
            User.name,
        )
        .join(
            Student,
            AttendanceRecord.student_id == Student.id,
        )
        .join(
            User,
            Student.user_id == User.id,
        )
        .where(
            AttendanceRecord.session_id == session_id
        )
        .order_by(User.name)
    ).all()

    records = []

    for record, student_number, student_name in rows:
        records.append({
            "id": str(record.id),
            "session_id": str(record.session_id),
            "student_id": str(record.student_id),
            "student_name": student_name,
            "student_number": student_number,
            "status": record.status,
            "confidence": record.confidence,
            "marked_at": record.marked_at,
        })

    return {
        "session_id": str(attendance_session.id),
        "records": records,
        "total_records": len(records),
    }


def get_attendance_session_summary(
    db: Session,
    user_id: UUID,
    session_id: UUID,
) -> dict:
    """Return session information and attendance counts."""

    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise ValueError("Teacher profile not found.")

    attendance_session = db.scalar(
        select(AttendanceSession)
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(
            AttendanceSession.id == session_id,
            Classroom.teacher_id == teacher.id,
        )
    )

    if attendance_session is None:
        raise ValueError(
            "Attendance session not found or access denied."
        )

    records = db.scalars(
        select(AttendanceRecord).where(
            AttendanceRecord.session_id == session_id
        )
    ).all()

    counts = {
        "PRESENT": 0,
        "ABSENT": 0,
        "REVIEW": 0,
        "UNKNOWN": 0,
        "NOT_DETECTED": 0,
    }

    for record in records:
        if record.status in counts:
            counts[record.status] += 1

    return {
        "session_id": str(attendance_session.id),
        "classroom_id": str(attendance_session.classroom_id),
        "started_at": attendance_session.started_at,
        "completed_at": attendance_session.completed_at,
        "total_records": len(records),
        "present": counts["PRESENT"],
        "absent": counts["ABSENT"],
        "review": counts["REVIEW"],
        "unknown": counts["UNKNOWN"],
        "not_detected": counts["NOT_DETECTED"],
    }
