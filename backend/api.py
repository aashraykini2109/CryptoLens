from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
from pathlib import Path

from backend.input_handler import scan_github, scan_zip


app = FastAPI(title="CryptoLens API")


# Allow the React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GitHubScanRequest(BaseModel):
    url: str


@app.get("/")
def root():
    return {"message": "CryptoLens API is running"}


@app.post("/scan/github")
def scan_github_endpoint(request: GitHubScanRequest):
    try:
        report = scan_github(request.url)
        return report

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@app.post("/scan/zip")
async def scan_zip_endpoint(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a ZIP file."
        )

    temporary_directory = tempfile.mkdtemp(prefix="cryptolens_upload_")
    zip_path = Path(temporary_directory) / file.filename

    try:
        contents = await file.read()

        with open(zip_path, "wb") as uploaded_file:
            uploaded_file.write(contents)

        report = scan_zip(zip_path)

        return report

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )