import cv2
import numpy as np


YUNET_MODEL = "app/ml/models/face_detection_yunet_2026may.onnx"
SFACE_MODEL = "app/ml/models/face_recognition_sface_2021dec.onnx"
IMAGE_PATH = "app/ml/test_images/Smith.png"


# Load image
image = cv2.imread(IMAGE_PATH)

if image is None:
    raise FileNotFoundError(f"Could not load image: {IMAGE_PATH}")


height, width = image.shape[:2]

print("Image shape:", image.shape)


# Create YuNet face detector
detector = cv2.FaceDetectorYN_create(
    YUNET_MODEL,
    "",
    (width, height)
)

# Detect faces
detector.setInputSize((width, height))

_, faces = detector.detect(image)

if faces is None:
    print("No face detected.")
    raise SystemExit

print("Faces detected:", len(faces))


# Load SFace
recognizer = cv2.FaceRecognizerSF_create(
    SFACE_MODEL,
    ""
)


# Use the first detected face
face = faces[0]

print("Detected face:", face)


# Align and crop the face for SFace
aligned_face = recognizer.alignCrop(image, face)

print("Aligned face shape:", aligned_face.shape)


# Generate embedding
embedding = recognizer.feature(aligned_face)

print("Embedding shape:", embedding.shape)
print("Embedding data type:", embedding.dtype)
print("Embedding size:", embedding.size)