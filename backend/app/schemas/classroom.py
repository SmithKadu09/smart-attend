
from pydantic import BaseModel, Field


class ClassroomCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    subject: str = Field(min_length=2, max_length=100)


class ClassroomResponse(BaseModel):
    id: str
    name: str
    subject: str
    class_code: str

class JoinClassroomRequest(BaseModel):
    class_code: str = Field(min_length=8, max_length=20)


class JoinedClassroomResponse(BaseModel):
    id: str
    name: str
    subject: str
    class_code: str
