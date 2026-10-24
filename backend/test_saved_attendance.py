
from sqlalchemy import select
from app.database import SessionLocal
from app.models.attendance_record import AttendanceRecord

db = SessionLocal()

try:
    records = db.scalars(
        select(AttendanceRecord)
        .order_by(AttendanceRecord.marked_at.desc().nullslast())
        .limit(20)
    ).all()

    for record in records:
        print({
            "session_id": str(record.session_id),
            "student_id": str(record.student_id),
            "status": record.status,
            "confidence": record.confidence,
            "marked_at": record.marked_at,
        })

    if not records:
        print("No attendance records found.")

finally:
    db.close()
