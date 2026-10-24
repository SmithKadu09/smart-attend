
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user

from app.models.teacher import Teacher
from app.models.student import Student
from app.models.classroom import Classroom
from app.models.enrollment import Enrollment
from app.models.attendance_session import AttendanceSession
from app.models.attendance_record import AttendanceRecord

from app.services.attendance_service import (
    create_attendance_session,
    finalize_attendance_session,
    review_attendance_record,
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


# --------------------------------------------------
# Request schemas
# --------------------------------------------------

class AttendanceRecordReviewRequest(BaseModel):
    status: Literal[
        "PRESENT",
        "ABSENT",
        "REVIEW",
        "UNKNOWN",
        "NOT_DETECTED",
    ]


# --------------------------------------------------
# Helper: extract authenticated user's ID
# --------------------------------------------------

def get_user_id(current_user) -> UUID:
    """Support user objects exposing either id or user_id."""

    user_id = getattr(current_user, "id", None)

    if user_id is None:
        user_id = getattr(current_user, "user_id", None)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID not found.",
        )

    try:
        return UUID(str(user_id))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user ID is invalid.",
        )


# --------------------------------------------------
# Teacher dashboard statistics
# GET /attendance/dashboard-stats
# --------------------------------------------------

@router.get("/dashboard-stats")
def get_teacher_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    teacher = db.scalar(
        select(Teacher).where(Teacher.user_id == user_id)
    )

    if teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found.",
        )

    total_classrooms = db.scalar(
        select(func.count(Classroom.id)).where(
            Classroom.teacher_id == teacher.id
        )
    ) or 0

    total_students = db.scalar(
        select(func.count(func.distinct(Enrollment.student_id)))
        .join(
            Classroom,
            Enrollment.classroom_id == Classroom.id,
        )
        .where(Classroom.teacher_id == teacher.id)
    ) or 0

    total_sessions = db.scalar(
        select(func.count(AttendanceSession.id))
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(Classroom.teacher_id == teacher.id)
    ) or 0

    total_records = db.scalar(
        select(func.count(AttendanceRecord.id))
        .join(
            AttendanceSession,
            AttendanceRecord.session_id == AttendanceSession.id,
        )
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(Classroom.teacher_id == teacher.id)
    ) or 0

    status_counts = {}

    for attendance_status in (
        "PRESENT",
        "ABSENT",
        "REVIEW",
        "UNKNOWN",
        "NOT_DETECTED",
    ):
        count = db.scalar(
            select(func.count(AttendanceRecord.id))
            .join(
                AttendanceSession,
                AttendanceRecord.session_id == AttendanceSession.id,
            )
            .join(
                Classroom,
                AttendanceSession.classroom_id == Classroom.id,
            )
            .where(
                Classroom.teacher_id == teacher.id,
                AttendanceRecord.status == attendance_status,
            )
        ) or 0

        status_counts[attendance_status] = count

    recent_rows = db.execute(
        select(
            AttendanceSession,
            Classroom.name,
            Classroom.subject,
        )
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(Classroom.teacher_id == teacher.id)
        .order_by(AttendanceSession.started_at.desc())
        .limit(5)
    ).all()

    recent_sessions = [
        {
            "session_id": str(session.id),
            "classroom_id": str(session.classroom_id),
            "classroom_name": classroom_name,
            "subject": subject,
            "started_at": session.started_at,
            "completed_at": session.completed_at,
        }
        for session, classroom_name, subject in recent_rows
    ]

    return {
        "total_classrooms": total_classrooms,
        "total_students": total_students,
        "total_sessions": total_sessions,
        "total_records": total_records,
        "present": status_counts["PRESENT"],
        "absent": status_counts["ABSENT"],
        "under_review": status_counts["REVIEW"],
        "unknown": status_counts["UNKNOWN"],
        "not_detected": status_counts["NOT_DETECTED"],
        "recent_sessions": recent_sessions,
    }


# --------------------------------------------------
# Student attendance history
# GET /attendance/my-history
# --------------------------------------------------

@router.get("/my-history")
def get_my_attendance_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    student = db.scalar(
        select(Student).where(Student.user_id == user_id)
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    enrolled_classrooms = select(
        Enrollment.classroom_id
    ).where(
        Enrollment.student_id == student.id
    )

    rows = db.execute(
        select(
            AttendanceRecord,
            AttendanceSession,
            Classroom,
        )
        .join(
            AttendanceSession,
            AttendanceRecord.session_id == AttendanceSession.id,
        )
        .join(
            Classroom,
            AttendanceSession.classroom_id == Classroom.id,
        )
        .where(
            AttendanceRecord.student_id == student.id,
            AttendanceSession.classroom_id.in_(enrolled_classrooms),
        )
        .order_by(AttendanceSession.started_at.desc())
    ).all()

    records = []

    for record, session, classroom in rows:
        records.append(
            {
                "session_id": str(session.id),
                "classroom_id": str(classroom.id),
                "classroom_name": classroom.name,
                "subject": classroom.subject,
                "status": record.status,
                "confidence": record.confidence,
                "marked_at": record.marked_at,
                "session_started_at": session.started_at,
                "session_completed_at": session.completed_at,
            }
        )

    return {
        "student_id": str(student.id),
        "total_records": len(records),
        "records": records,
    }


# --------------------------------------------------
# Create an attendance session
# POST /attendance/sessions
# --------------------------------------------------

@router.post(
    "/sessions",
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    classroom_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        session = create_attendance_session(
            db=db,
            user_id=get_user_id(current_user),
            classroom_id=classroom_id,
        )

        return {
            "message": "Attendance session created successfully.",
            "session_id": str(session.id),
            "classroom_id": str(session.classroom_id),
            "started_at": session.started_at,
            "completed_at": session.completed_at,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# --------------------------------------------------
# Finalize an attendance session
# POST /attendance/sessions/{session_id}/finalize
# --------------------------------------------------

@router.post("/sessions/{session_id}/finalize")
def finalize_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        session = finalize_attendance_session(
            db=db,
            user_id=get_user_id(current_user),
            session_id=session_id,
        )

        return {
            "message": "Attendance session finalized successfully.",
            "session_id": str(session.id),
            "completed_at": session.completed_at,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# --------------------------------------------------
# Get attendance session summary
# GET /attendance/sessions/{session_id}/summary
# --------------------------------------------------

@router.get("/sessions/{session_id}/summary")
def get_session_summary(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.attendance_service import (
        get_attendance_session_summary,
    )

    try:
        return get_attendance_session_summary(
            db=db,
            user_id=get_user_id(current_user),
            session_id=session_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# --------------------------------------------------
# Get attendance records for a session
# GET /attendance/sessions/{session_id}/records
# --------------------------------------------------

@router.get("/sessions/{session_id}/records")
def get_session_records(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.attendance_service import (
        get_attendance_session_records,
    )

    try:
        return get_attendance_session_records(
            db=db,
            user_id=get_user_id(current_user),
            session_id=session_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


# --------------------------------------------------
# Review or edit an attendance record
# PATCH /attendance/sessions/{session_id}/records/{student_id}
# --------------------------------------------------

@router.patch("/sessions/{session_id}/records/{student_id}")
def update_attendance_record(
    session_id: UUID,
    student_id: UUID,
    request: AttendanceRecordReviewRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        record = review_attendance_record(
            db=db,
            user_id=get_user_id(current_user),
            session_id=session_id,
            student_id=student_id,
            new_status=request.status,
        )

        return {
            "message": "Attendance record updated successfully.",
            "session_id": str(record.session_id),
            "student_id": str(record.student_id),
            "status": record.status,
            "confidence": record.confidence,
            "marked_at": record.marked_at,
        }

    except ValueError as exc:
        message = str(exc)

        if (
            "not found" in message.lower()
            or "access denied" in message.lower()
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
