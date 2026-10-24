import cv2
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

YUNET_MODEL = MODEL_DIR / "face_detection_yunet_2026may.onnx"
SFACE_MODEL = MODEL_DIR / "face_recognition_sface_2021dec.onnx"


class FaceRecognitionService:
    def __init__(self):
        if not YUNET_MODEL.exists():
            raise FileNotFoundError(f"YuNet model not found: {YUNET_MODEL}")

        if not SFACE_MODEL.exists():
            raise FileNotFoundError(f"SFace model not found: {SFACE_MODEL}")

        self.detector = cv2.FaceDetectorYN_create(
            str(YUNET_MODEL), "", (320, 320), 0.8, 0.3, 5000
        )

        self.recognizer = cv2.FaceRecognizerSF_create(str(SFACE_MODEL), "")

    def extract_embeddings(self, image_bytes: bytes):
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Invalid image file.")

        height, width = image.shape[:2]

        # Limit processing cost for large classroom photos.
        max_dimension = 1280

        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)

            image = cv2.resize(
                image,
                (int(width * scale), int(height * scale)),
                interpolation=cv2.INTER_AREA,
            )

            height, width = image.shape[:2]

        self.detector.setInputSize((width, height))

        _, faces = self.detector.detect(image)

        if faces is None or len(faces) == 0:
            return []

        results = []

        for face in faces:
            aligned_face = self.recognizer.alignCrop(image, face)
            
            embedding = self.recognizer.feature(aligned_face)

            vector = embedding.flatten().astype(np.float32)

            # Normalize embeddings for cosine-similarity comparisons.
            norm = np.linalg.norm(vector)

            if norm == 0:
                continue

            vector = vector / norm

            results.append(
                {
                    "embedding": vector.tolist(),
                    "bounding_box": [float(value) for value in face[:4]],
                    "detection_score": float(face[-1]),
                }
            )

        return results


face_service = FaceRecognitionService()
