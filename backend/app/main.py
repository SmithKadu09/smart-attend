from fastapi import FastAPI

app = FastAPI(title="SmartAttend API")


@app.get("/")
def root():
    return {
        "message": "SmartAttend API is running"
    }