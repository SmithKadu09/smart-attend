
from pathlib import Path
import cv2

from app.ml.face_service import face_service

IMAGE_PATH = (
    Path(__file__).resolve().parent
    / "test_images"
    / "Smith.png"
)


def main():
    image = cv2.imread(str(IMAGE_PATH))

    if image is None:
        raise FileNotFoundError(f"Could not read: {IMAGE_PATH}")

    faces = face_service.extract_embeddings(
        IMAGE_PATH.read_bytes()
    )

    print("Faces detected:", len(faces))

    for i, face in enumerate(faces, start=1):
        print(f"\nFace {i}")
        print("Bounding box:", face["bounding_box"])
        print("Detection score:", face["detection_score"])

        x, y, w, h = map(
            int, face["bounding_box"]
        )

        cv2.rectangle(
            image,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

        cv2.putText(
            image,
            f"Face {i}",
            (x, max(y - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

    output_path = IMAGE_PATH.parent / "detection_debug.jpg"
    cv2.imwrite(str(output_path), image)

    print("\nDebug image saved to:", output_path)


if __name__ == "__main__":
    main()

