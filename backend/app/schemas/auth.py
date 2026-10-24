
from typing import Literal

from pydantic import BaseModel, EmailStr, Field



from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    role: Literal["student", "teacher"]
    student_number: str | None = None

    @model_validator(mode="after")
    def validate_student_number(self):
        if self.role == "student":
            if not self.student_number or not self.student_number.strip():
                raise ValueError("Student number is required for students.")
            self.student_number = self.student_number.strip()

        elif self.student_number is not None:
            raise ValueError("Student number is only for student accounts.")

        return self



class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str



class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
