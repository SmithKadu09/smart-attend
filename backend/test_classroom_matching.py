
from sqlalchemy import select

from app.database import SessionLocal
from app.models.classroom import Classroom
from app.ml.profile_service import (
    get_enrolled_profiles,
    match_face_to_classroom,
)


db = SessionLocal()

try:
    classroom = db.scalar(select(Classroom))

    if classroom is None:
        print("No classroom found. Create a classroom first.")
    else:
        profiles = get_enrolled_profiles(db, classroom.id)

        print("Classroom ID:", classroom.id)
        print("Enrolled biometric profiles:", len(profiles))

        if profiles:
            # Test ranking using an enrolled student's own embedding.
            query_embedding = profiles[0]["embedding"]

            matches = match_face_to_classroom(
                db=db,
                classroom_id=classroom.id,
                query_embedding=query_embedding,
            )

            print("Ranked matches:")
            for match in matches:
                print(match)
        else:
            print("No enrolled students have biometric profiles.")

finally:
    db.close()
