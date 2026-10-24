
from pathlib import Path

import numpy as np

from app.ml.face_service import face_service


IMAGE_DIR = Path(__file__).resolve().parent / "test_images"


def get_single_embedding(image_name: str) -> np.ndarray:
    image_path = IMAGE_DIR / image_name

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    faces = face_service.extract_embeddings(
        image_path.read_bytes()
    )

    if not faces:
        raise ValueError(
            f"{image_name}: no face detected"
        )

    # Temporary diagnostic shortcut for single-person photos.
    largest_face = max(
        faces,
        key=lambda face:
            face["bounding_box"][2]
            * face["bounding_box"][3]
    )

    print(
        f"{image_name}: detected {len(faces)} face(s); "
        "using the largest detection"
    )

    return np.asarray(
        largest_face["embedding"],
        dtype=np.float32
    )


def main():
    image_names = [
        "Smith.png",
        "Smith_2.png",
        "Smith_3.png",
        "Smith_4.png",
    ]

    embeddings = {
        name: get_single_embedding(name)
        for name in image_names
    }

    print("\nPairwise cosine similarity:\n")

    for i in range(len(image_names)):
        for j in range(i + 1, len(image_names)):
            name_a = image_names[i]
            name_b = image_names[j]

            similarity = float(
                np.dot(embeddings[name_a], embeddings[name_b])
            )

            print(
                f"{name_a} vs {name_b}: "
                f"{similarity:.4f}"
            )


if __name__ == "__main__":
    main()
