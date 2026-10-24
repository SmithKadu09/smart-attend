
from app.ml.face_service import face_service
from app.ml.profile_service import match_face_to_classroom

# Provisional values for testing only.
# Validate them with more genuine and different-person samples.
MATCH_THRESHOLD = 0.75
MIN_MATCH_GAP = 0.05


def recognize_classroom_photo(db, classroom_id, image_bytes: bytes) -> dict:
    """
    Detect faces and compare them with biometric profiles
    belonging to students enrolled in the selected classroom.

    Returns candidates for teacher review.
    Does not mark attendance.
    """
    detected_faces = face_service.extract_embeddings(image_bytes)

    if not detected_faces:
        return {
            "message": "No faces detected in the uploaded image.",
            "faces_detected": 0,
            "results": [],
        }

    results = []

    for index, face in enumerate(detected_faces):
        matches = match_face_to_classroom(
            db=db,
            classroom_id=classroom_id,
            query_embedding=face["embedding"],
        )

        best_match = matches[0] if matches else None
        second_match = matches[1] if len(matches) > 1 else None

        if best_match is None:
            status = "UNKNOWN"
        elif best_match["similarity"] < MATCH_THRESHOLD:
            status = "UNKNOWN"
        elif (
            second_match is not None
            and best_match["similarity"] - second_match["similarity"]
            < MIN_MATCH_GAP
        ):
            status = "REVIEW"
        else:
            status = "REVIEW"

        results.append({
            "face_index": index,
            "bounding_box": face["bounding_box"],
            "detection_score": face["detection_score"],
            "status": status,
            "best_match": best_match,
            "second_match": second_match,
        })

    return {
        "message": "Classroom photo processed successfully.",
        "faces_detected": len(detected_faces),
        "results": results,
    }
