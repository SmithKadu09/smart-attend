
from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.user import User
from app.schemas.classroom import (
    ClassroomCreate,
    ClassroomResponse,
    JoinClassroomRequest,
)
from app.services.classroom_service import create_classroom
from app.services.enrollment_service import join_classroom
from app.schemas.classroom import JoinedClassroomResponse
from app.services.classroom_service import get_joined_classrooms
from app.services.classroom_service import get_teacher_classrooms


router = APIRouter(
    prefix="/classrooms",
    tags=["Classrooms"],
)


@router.post(
    "",
    response_model=ClassroomResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_classroom_endpoint(
    data: ClassroomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    try:
        classroom = create_classroom(
            db=db,
            user_id=current_user.id,
            data=data,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return ClassroomResponse(
        id=str(classroom.id),
        name=classroom.name,
        subject=classroom.subject,
        class_code=classroom.class_code,
    )


@router.post(
    "/join",
    status_code=status.HTTP_201_CREATED,
)
def join_classroom_endpoint(
    data: JoinClassroomRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    try:
        enrollment = join_classroom(
            db=db,
            user_id=current_user.id,
            class_code=data.class_code,
        )
    except ValueError as error:
        message = str(error)

        if message == "Invalid classroom code.":
            error_status = status.HTTP_404_NOT_FOUND
        elif "already joined" in message:
            error_status = status.HTTP_409_CONFLICT
        else:
            error_status = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=error_status,
            detail=message,
        ) from error

    return {
        "message": "Successfully joined classroom.",
        "enrollment_id": str(enrollment.id),
        "classroom_id": str(enrollment.classroom_id),
    }
    
    
@router.get("/joined", response_model=list[JoinedClassroomResponse])
def get_joined_classrooms_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    try:
        classrooms = get_joined_classrooms(
            db=db,
            user_id=current_user.id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return [
        JoinedClassroomResponse(
            id=str(classroom.id),
            name=classroom.name,
            subject=classroom.subject,
            class_code=classroom.class_code,
        )
        for classroom in classrooms
    ]


@router.get("/mine", response_model=list[ClassroomResponse])
def get_teacher_classrooms_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher")),
):
    try:
        classrooms = get_teacher_classrooms(
            db=db,
            user_id=current_user.id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return [
        ClassroomResponse(
            id=str(classroom.id),
            name=classroom.name,
            subject=classroom.subject,
            class_code=classroom.class_code,
        )
        for classroom in classrooms
    ]
