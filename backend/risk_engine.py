from .models import Finding


RISK_RULES = {
    "MD5": {
        "severity": "HIGH",
        "description": "MD5 is a cryptographically weak hashing algorithm.",
        "recommendation": "Use SHA-256 or a password hashing algorithm such as Argon2 or bcrypt."
    },
    "SHA-1": {
        "severity": "HIGH",
        "description": "SHA-1 is cryptographically weak and should not be used for security-sensitive applications.",
        "recommendation": "Use SHA-256 or a stronger modern hashing algorithm."
    },
    "SHA-256": {
        "severity": "LOW",
        "description": "SHA-256 is a modern cryptographic hash algorithm.",
        "recommendation": "SHA-256 is generally suitable for integrity and hashing use cases."
    },
    "AES": {
        "severity": "LOW",
        "description": "AES is a modern symmetric encryption algorithm.",
        "recommendation": "Prefer authenticated encryption modes such as AES-GCM."
    },
    "DES": {
        "severity": "HIGH",
        "description": "DES is an obsolete encryption algorithm with an insufficient key size.",
        "recommendation": "Replace DES with AES-GCM or another modern authenticated encryption algorithm."
    },
    "RSA": {
        "severity": "LOW",
        "description": "RSA is a commonly used asymmetric cryptographic algorithm.",
        "recommendation": "Use a sufficiently large key size and modern padding schemes."
    }
}


def enrich_finding(finding: Finding) -> Finding:
    rule = RISK_RULES.get(finding.algorithm)

    if rule is None:
        return finding

    finding.severity = rule["severity"]
    finding.description = rule["description"]
    finding.recommendation = rule["recommendation"]

    return finding