from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import json
from pathlib import Path
from groq import Groq

from backend.input_handler import scan_github, scan_zip

# 1. Initialize Groq Cloud Client
GROQ_API_KEY = "enter key"
groq_client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="CryptoLens API")

# Allow the React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GitHubScanRequest(BaseModel):
    url: str

class RemediateRequest(BaseModel):
    algo: str
    file: str = "Unknown"
    code_context: str = ""

class ChatRequest(BaseModel):
    question: str
    algo: str

# 2. Local FIPS/NIST Knowledge Base (Fallback)
FALLBACK_KNOWLEDGE_BASE = {
    "RSA-1024": {
        "explanation": "RSA-1024 provides less than 80 bits of security and is mathematically breakable with modern compute. It offers zero resistance against quantum attacks via Shor's Algorithm.",
        "fix": "Migrate classical public-key cryptography to NIST Post-Quantum standards like ML-KEM-768 (FIPS 203) for key encapsulation, or use RSA-3072 / ECC P-384 as an interim classical hybrid.",
        "codeSnippet": "// ❌ Insecure (RSA-1024)\nconst keypair = crypto.generateKeyPairSync('rsa', { modulusLength: 1024 });\n\n// ✅ Secure (Modern PQC / Ed25519)\nimport { ml_kem768 } from '@noble/post-quantum/ml-kem';\nconst keypair = ml_kem768.keygen();"
    },
    "SHA-1": {
        "explanation": "SHA-1 is vulnerable to practical hash collision attacks (SHAttered) and was formally deprecated by NIST in SP 800-131A.",
        "fix": "Upgrade hashing and integrity verification pipelines to SHA-256, SHA-384, or SHA3-256.",
        "codeSnippet": "// ❌ Insecure (SHA-1)\nconst hash = crypto.createHash('sha1').update(password).digest('hex');\n\n// ✅ Secure (SHA-256 / SHA-3)\nconst hash = crypto.createHash('sha256').update(password).digest('hex');"
    },
    "MD5": {
        "explanation": "MD5 suffers from severe collision vulnerabilities and can be forged in seconds, making it completely unsuitable for digital signatures, password storage, or integrity validation.",
        "fix": "Replace with SHA-256 or SHA-3 for hashing, or Argon2id / bcrypt for credential hashing.",
        "codeSnippet": "// ❌ Insecure (MD5)\nimport hashlib\nhash_val = hashlib.md5(data.encode()).hexdigest()\n\n// ✅ Secure (SHA-256)\nimport hashlib\nhash_val = hashlib.sha256(data.encode()).hexdigest()"
    },
    "OLD OPENSSL": {
        "explanation": "Older versions of OpenSSL contain known CVEs (e.g., Heartbleed) and lack support for modern TLS 1.3 or PQC cipher suites.",
        "fix": "Update OpenSSL dependencies to version 3.0+ and ensure TLS 1.2 minimum is enforced.",
        "codeSnippet": "// ❌ Insecure\n\"dependencies\": { \"openssl\": \"1.0.1\" }\n\n// ✅ Secure\n\"dependencies\": { \"openssl\": \"^3.0.0\" }"
    }
}

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

# 3. Groq-Powered AI Remediation Endpoint
@app.post("/api/remediate")
async def remediate_vulnerability(req: RemediateRequest):
    algo_key = req.algo.upper()

    prompt = f"""
    You are an expert cryptographic security engineer for CryptoLens.
    Analyze this cryptographic primitive:
    - Primitive: {req.algo}
    - File Location: {req.file}
    - Context: {req.code_context or 'Standard usage'}

    Return ONLY a valid JSON object matching this schema:
    {{
      "explanation": "2-sentence clear explanation of why this algorithm is broken or deprecated under NIST guidelines.",
      "fix": "Recommended modern NIST or Post-Quantum Cryptography (PQC) replacement.",
      "codeSnippet": "// Insecure vs Secure code comparison"
    }}
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a cryptographic security auditor. Output strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Remediation Groq Error: {e}")
        for known_algo, data in FALLBACK_KNOWLEDGE_BASE.items():
            if known_algo in algo_key:
                return data

        return {
            "explanation": f"The algorithm '{req.algo}' has been flagged for FIPS/NIST non-compliance.",
            "fix": "Migrate to modern NIST Post-Quantum standards.",
            "codeSnippet": f"// ❌ Flagged primitive: {req.algo}"
        }

# 4. Groq-Powered Copilot Chat Endpoint
@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    prompt = f"The user is asking a question regarding the cryptographic vulnerability '{req.algo}'. User Question: '{req.question}'"

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a concise, helpful cybersecurity copilot specializing in FIPS/NIST standards, Post-Quantum Cryptography (PQC), and secure code remediation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300,
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"reply": f"Groq Error: {str(e)}"}

