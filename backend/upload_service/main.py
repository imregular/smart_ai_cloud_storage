from fastapi import FastAPI, UploadFile, File, HTTPException
import uuid
import os
from pathlib import Path

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def hello():
    print("hello how are you")
    


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # 1️⃣ Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    # 2️⃣ Create unique filename
    ext = file.filename.split(".")[-1]
    unique_name = f"{uuid.uuid4()}.{ext}"

    file_path = UPLOAD_DIR / unique_name

    # 3️⃣ Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "message": "Image uploaded successfully",
        "filename": unique_name
    }
