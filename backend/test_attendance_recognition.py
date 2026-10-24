
from pathlib import Path

from sqlalchemy import select

from app.database import SessionLocal
from app.models.classroom import Classroom
from app.ml.attendance_recognition_service import recognize_classroom_photo

# Replace this with the path to your test classroom photo.
IMAGE_PATH = Path(r"C:\Users\smith\Desktop\smart-attend\backend\test_classroom.jpg")

db = SessionLocal()

try:
    classroom = db.scalar(select(Classroom))

    if classroom is None:
        print("No classroom found.")
    elif not IMAGE_PATH.is_file():
        print(f"Image not found: {IMAGE_PATH}")
    else:
        image_bytes = IMAGE_PATH.read_bytes()

        result = recognize_classroom_photo(
            db=db,
            classroom_id=classroom.id,
            image_bytes=image_bytes,
        )

        print("Recognition result:")
        print(result)

finally:
    db.close()
