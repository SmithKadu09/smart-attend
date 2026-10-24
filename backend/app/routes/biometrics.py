
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.services.biometric_service import save_biometric_profile
from app.ml.face_service import face_service
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

router = APIRouter(prefix="/biometrics", tags=["Biometrics"])

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_face(
    image: UploadFile = File(...),
    consent: bool = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    
    if consent is not True:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Explicit consent is required for biometric enrollment.",
    )
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Upload a JPEG, PNG, or WebP image.",
        )

    image_bytes = await image.read(MAX_IMAGE_SIZE + 1)

    if not image_bytes or len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be non-empty and no larger than 5 MB.",
        )

    try:
        faces = face_service.extract_embeddings(image_bytes)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    if len(faces) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No face detected. Please upload a clear face photo.",
        )

    if len(faces) > 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Multiple faces detected. Upload a photo with only your face.",
        )

    try:
        profile = save_biometric_profile(
            db=db,
            user_id=current_user.id,
            embedding=faces[0]["embedding"],
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return {
        "message": "Face enrollment successful.",
        "biometric_profile_id": str(profile.id),
    }
