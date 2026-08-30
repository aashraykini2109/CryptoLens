from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import json
from pathlib import Path
import ollama

from backend.input_handler import scan_github, scan_zip


# ============================================================
# INITIALIZE FASTAPI
# ============================================================

app = FastAPI(title="CryptoLens API")


# ============================================================
# CORS
# ============================================================

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


# ============================================================
# REQUEST MODELS
# ============================================================

class GitHubScanRequest(BaseModel):
    url: str


class RemediateRequest(BaseModel):
    algo: str
    file: str = "Unknown"
    code_context: str = ""


class ChatRequest(BaseModel):
    question: str
    algo: str


# ============================================================
# TRUSTED CRYPTOGRAPHY KNOWLEDGE BASE
# ============================================================

FALLBACK_KNOWLEDGE_BASE = {

    "RSA-1024": {
        "explanation": (
            "RSA-1024 is considered insecure because its 1024-bit "
            "modulus provides insufficient security against modern "
            "classical factorization attacks. RSA security relies on "
            "the difficulty of factoring large integers. RSA is also "
            "vulnerable to sufficiently capable quantum computers "
            "because Shor's algorithm can efficiently factor large "
            "integers."
        ),

        "fix": (
            "For classical RSA deployments, migrate RSA-1024 to at "
            "least RSA-2048, with RSA-3072 or RSA-4096 providing a "
            "stronger classical security margin where appropriate. "
            "Increasing the RSA key size improves classical security "
            "but does NOT make RSA post-quantum secure. For long-term "
            "post-quantum readiness, evaluate standardized PQC "
            "mechanisms appropriate to the use case, such as ML-KEM "
            "for key establishment or ML-DSA for digital signatures."
        ),

        "codeSnippet": """ ❌ Insecure: RSA-1024
const crypto = require('crypto');

const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 1024
});

 ✅ Stronger classical RSA: RSA-4096
const secureKeyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096
});

// RSA-4096 provides stronger classical security.
// It does NOT make RSA post-quantum secure.
"""
    },


    "SHA-1": {
        "explanation": (
            "SHA-1 is cryptographically broken for collision "
            "resistance. Practical collision attacks have demonstrated "
            "that different inputs can be constructed to produce the "
            "same SHA-1 hash. SHA-1 should therefore not be used for "
            "security-sensitive hashing, digital signatures, or "
            "integrity mechanisms that depend on collision resistance."
        ),

        "fix": (
            "Migrate SHA-1 to a modern hash function such as SHA-256, "
            "SHA-384, SHA-512, or SHA-3 according to the application's "
            "requirements. SHA-3 is a modern cryptographic hash "
            "function, but it is NOT a post-quantum cryptographic "
            "algorithm."
        ),

        "codeSnippet": """ ❌ Insecure: SHA-1
const crypto = require('crypto');

const hash = crypto.createHash('sha1');
hash.update(data);
const hashed = hash.digest('hex');

✅ Secure replacement: SHA-256
const secureHash = crypto.createHash('sha256');
secureHash.update(data);
const secureHashed = secureHash.digest('hex');
"""
    },


    "MD5": {
        "explanation": (
            "MD5 has practical collision vulnerabilities and should "
            "not be used for security-sensitive hashing, integrity "
            "protection, or digital signatures."
        ),

        "fix": (
            "Replace MD5 with SHA-256, SHA-384, SHA-512, or SHA-3 "
            "for general-purpose hashing and integrity protection. "
            "If MD5 is being used for password storage, migrate to "
            "a dedicated password hashing function such as Argon2id "
            "or bcrypt."
        ),

        "codeSnippet": """ ❌ Insecure: MD5
const crypto = require('crypto');

const hash = crypto.createHash('md5');
hash.update(data);
const hashed = hash.digest('hex');

 ✅ Secure replacement: SHA-256
const secureHash = crypto.createHash('sha256');
secureHash.update(data);
const secureHashed = secureHash.digest('hex');

If this is password storage,
use Argon2id or bcrypt instead.
"""
    },


    "DES": {
        "explanation": (
            "DES uses an inadequate key size for modern security "
            "requirements and should not be used for new "
            "security-sensitive applications."
        ),

        "fix": (
            "Migrate DES to a modern authenticated encryption "
            "construction such as AES-GCM. AES-256-GCM is an "
            "appropriate modern choice when the application's "
            "requirements call for symmetric authenticated encryption."
        ),

        "codeSnippet": """ ❌ Insecure: DES
 Do not use DES for new encryption.

 ✅ Modern authenticated encryption: AES-256-GCM
const crypto = require('crypto');

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(12);

const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    key,
    iv
);

const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
]);

const authTag = cipher.getAuthTag();
"""
    },


    "3DES": {
        "explanation": (
            "Triple DES (3DES) is a legacy block cipher and should "
            "not be used for new cryptographic designs."
        ),

        "fix": (
            "Migrate from 3DES to a modern authenticated encryption "
            "scheme such as AES-GCM where appropriate."
        ),

        "codeSnippet": """ ❌ Insecure: 3DES
Do not use 3DES for new encryption.

 ✅ Modern authenticated encryption: AES-256-GCM
const crypto = require('crypto');

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(12);

const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    key,
    iv
);

const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
]);

const authTag = cipher.getAuthTag();
"""
    },


    "OLD OPENSSL": {
        "explanation": (
            "An outdated OpenSSL version may contain known security "
            "vulnerabilities and may lack current security features "
            "and cryptographic protections."
        ),

        "fix": (
            "Upgrade OpenSSL to a currently supported release and "
            "review the application's TLS and cryptographic "
            "configuration after upgrading."
        ),

        "codeSnippet": """ ❌ Outdated dependency
"openssl": "1.0.1"

 ✅ Use a currently supported OpenSSL release
"openssl": "3.x"
"""
    }
}


# ============================================================
# HELPER: FIND TRUSTED KNOWLEDGE
# ============================================================

def get_trusted_knowledge(algo: str):

    algo_key = algo.upper().strip()

    if "RSA-1024" in algo_key:
        return FALLBACK_KNOWLEDGE_BASE["RSA-1024"]

    if "SHA-1" in algo_key or "SHA1" in algo_key:
        return FALLBACK_KNOWLEDGE_BASE["SHA-1"]

    if "MD5" in algo_key:
        return FALLBACK_KNOWLEDGE_BASE["MD5"]

    if "3DES" in algo_key or "TRIPLE DES" in algo_key:
        return FALLBACK_KNOWLEDGE_BASE["3DES"]

    if algo_key == "DES" or "DES-" in algo_key:
        return FALLBACK_KNOWLEDGE_BASE["DES"]

    if "OPENSSL" in algo_key:
        return FALLBACK_KNOWLEDGE_BASE["OLD OPENSSL"]

    return None


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "CryptoLens API is running",
        "ai_provider": "Ollama",
        "model": "llama3.2"
    }


# ============================================================
# GITHUB SCAN
# ============================================================

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


# ============================================================
# ZIP SCAN
# ============================================================

@app.post("/scan/zip")
async def scan_zip_endpoint(
    file: UploadFile = File(...)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was uploaded."
        )

    if not file.filename.lower().endswith(".zip"):

        raise HTTPException(
            status_code=400,
            detail="Please upload a ZIP file."
        )

    temporary_directory = tempfile.mkdtemp(
        prefix="cryptolens_upload_"
    )

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


# ============================================================
# AI REMEDIATION
# ============================================================

@app.post("/api/remediate")
async def remediate_vulnerability(
    req: RemediateRequest
):

    algo_key = req.algo.upper().strip()

    trusted = get_trusted_knowledge(req.algo)

    # --------------------------------------------------------
    # OLLAMA PROMPT
    # --------------------------------------------------------

    prompt = f"""
You are the cryptographic security engine inside CryptoLens.

Analyze this detected cryptographic issue.

Cryptographic Primitive:
{req.algo}

File:
{req.file}

Code Context:
{req.code_context or "No code context was provided."}

Return a concise security assessment.

You must provide:

1. Security explanation.
2. Migration recommendation.
3. Practical remediation advice.
4. Code example where appropriate.

IMPORTANT TECHNICAL RULES:

- Do not invent NIST standards.
- Do not invent FIPS requirements.
- SHA-1 is a hash function.
- MD5 is a hash function.
- SHA-3 is a hash function.
- SHA-3 is NOT a post-quantum algorithm.
- RSA-4096 is NOT post-quantum.
- Ordinary Diffie-Hellman is NOT post-quantum.
- ML-KEM is for post-quantum key establishment.
- ML-DSA is for post-quantum digital signatures.
- Do not recommend ML-KEM as a replacement for SHA-1.
- Do not recommend ML-KEM as a replacement for MD5.
- Do not recommend Diffie-Hellman as a post-quantum replacement for RSA.
- Do not fabricate source code.
- Do not modify unrelated application logic.

Return ONLY valid JSON in this format:

{{
    "explanation": "Security explanation",
    "fix": "Migration recommendation",
    "codeSnippet": "Code example"
}}
"""

    try:

        # ----------------------------------------------------
        # CALL OLLAMA
        # ----------------------------------------------------

        response = ollama.chat(
            model="llama3.2",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a highly accurate cryptographic "
                        "security auditor. Never invent standards "
                        "or security properties."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            format="json",

            options={
                "temperature": 0.1
            }
        )

        # ----------------------------------------------------
        # PARSE OLLAMA RESPONSE
        # ----------------------------------------------------

        content = response["message"]["content"]

        result = json.loads(content)

        explanation = result.get(
            "explanation",
            ""
        )

        fix = result.get(
            "fix",
            ""
        )

        code_snippet = result.get(
            "codeSnippet",
            ""
        )

        # ----------------------------------------------------
        # NORMALIZE RESPONSE TYPES
        # ----------------------------------------------------

        if not isinstance(explanation, str):

            explanation = json.dumps(
                explanation,
                indent=2
            )

        if not isinstance(fix, str):

            fix = json.dumps(
                fix,
                indent=2
            )

        if isinstance(code_snippet, dict):

            insecure_code = code_snippet.get(
                "insecure",
                ""
            )

            secure_code = code_snippet.get(
                "secure",
                ""
            )

            code_snippet = (
                "// ❌ Insecure Code\n"
                + str(insecure_code)
                + "\n\n"
                + "// ✅ Secure Replacement\n"
                + str(secure_code)
            )

        elif not isinstance(code_snippet, str):

            code_snippet = json.dumps(
                code_snippet,
                indent=2
            )

        # ====================================================
        # TRUSTED SECURITY REMEDIATION
        #
        # Security-critical information is overridden with
        # deterministic knowledge so Ollama cannot hallucinate
        # migration recommendations.
        # ====================================================

        if trusted is not None:

            explanation = trusted["explanation"]
            fix = trusted["fix"]
            code_snippet = trusted["codeSnippet"]

        # ----------------------------------------------------
        # RETURN
        # ----------------------------------------------------

        return {
            "explanation": explanation,
            "fix": fix,
            "codeSnippet": code_snippet
        }

    # ========================================================
    # OLLAMA ERROR / FALLBACK
    # ========================================================

    except Exception as error:

        print(
            f"Ollama Remediation Error: {error}"
        )

        if trusted is not None:

            return {
                "explanation": trusted["explanation"],
                "fix": trusted["fix"],
                "codeSnippet": trusted["codeSnippet"]
            }

        return {
            "explanation": (
                f"The cryptographic primitive "
                f"'{req.algo}' has been flagged for "
                "potential security or compliance concerns."
            ),

            "fix": (
                "Review the detected cryptographic usage and "
                "migrate to a currently supported cryptographic "
                "construction appropriate for the application's "
                "purpose."
            ),

            "codeSnippet": (
                f"// ❌ Flagged primitive: {req.algo}\n\n"
                "// Review this usage and migrate to a "
                "modern supported cryptographic construction."
            )
        }


# ============================================================
# AI COPILOT CHAT
# ============================================================

@app.post("/api/chat")
async def chat_endpoint(
    req: ChatRequest
):

    prompt = f"""
You are the AI security copilot inside CryptoLens.

CURRENT DETECTED ALGORITHM:
{req.algo}

USER QUESTION:
{req.question}

Answer the user's question as a concise cybersecurity
and cryptography expert.

Focus on:

- Cryptography
- Secure coding
- FIPS
- NIST
- Cryptographic migration
- Post-Quantum Cryptography

IMPORTANT:

- Do not invent standards.
- Do not invent NIST recommendations.
- Clearly distinguish hashing, encryption,
  key establishment, and digital signatures.
- SHA-2 and SHA-3 are NOT post-quantum algorithms.
- RSA-4096 is NOT post-quantum.
- Ordinary Diffie-Hellman is NOT post-quantum.
- ML-KEM is for post-quantum key establishment.
- ML-DSA is for post-quantum digital signatures.
- Only recommend post-quantum algorithms when
  relevant to the user's question.

If the user's question is about a different
cryptographic primitive than the current finding,
explicitly acknowledge that.

For example:

"Your current finding is SHA-1, but you're asking
about RSA-1024. Regarding RSA-1024..."
"""

    try:

        response = ollama.chat(
            model="llama3.2",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a technically accurate "
                        "cybersecurity copilot specializing "
                        "in cryptography, FIPS/NIST standards, "
                        "post-quantum cryptography, and secure "
                        "code remediation."
                    )
                },

                {
                    "role": "user",
                    "content": prompt
                }
            ],

            options={
                "temperature": 0.2
            }
        )

        return {
            "reply": response["message"]["content"]
        }

    except Exception as error:

        print(
            f"Ollama Chat Error: {error}"
        )

        return {
            "reply": (
                "I couldn't reach the local Ollama model. "
                f"Error: {str(error)}"
            )
        }