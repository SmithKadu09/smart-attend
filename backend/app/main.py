
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.classrooms import router as classrooms_router
from app.routes.biometrics import router as biometrics_router
from app.routes.attendance import router as attendance_routerfrom fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="SmartAttend API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://make-me-present.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(classrooms_router)
app.include_router(biometrics_router)
app.include_router(attendance_router)


@app.get("/")
def root():
    return {"message": "SmartAttend API is running"}
