
from uuid import UUID

from app.database import SessionLocal
from app.ml.profile_service import get_enrolled_profiles


def main():
    # Enter an existing classroom UUID from your database.
    classroom_id_input = input(
        "Enter classroom UUID: "
    ).strip()

    try:
        classroom_id = UUID(classroom_id_input)
    except ValueError:
        print("Invalid UUID. Please enter a valid classroom UUID.")
        return

    db = SessionLocal()

    try:
        profiles = get_enrolled_profiles(
            db,
            classroom_id,
        )

        print(f"\nProfiles found: {len(profiles)}")

        for profile in profiles:
            print(
                f"Student ID: {profile['student_id']}, "
                f"Embedding dimensions: "
                f"{len(profile['embedding'])}"
            )

        if not profiles:
            print(
                "No biometric profiles found for students "
                "enrolled in this classroom."
            )

    except Exception as error:
        print(f"Database query failed: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
