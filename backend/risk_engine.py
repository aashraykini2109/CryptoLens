from .models import Finding


RISK_RULES = {
    "MD5": {
        "severity": "CRITICAL",
        "description": (
            "MD5 is a cryptographically broken hashing algorithm and "
            "is vulnerable to collision attacks."
        ),
        "recommendation": (
            "Replace MD5 with SHA-256 or SHA-3. For password storage, "
            "use a dedicated password hashing algorithm such as Argon2 or bcrypt."
        )
    },
    "SHA-1": {
        "severity": "CRITICAL",
        "description": (
            "SHA-1 is cryptographically weak and collision attacks against "
            "it have been demonstrated."
        ),
        "recommendation": (
            "Replace SHA-1 with SHA-256, SHA-3, or another modern "
            "cryptographic hash algorithm."
        )
    },
    "DES": {
        "severity": "CRITICAL",
        "description": (
            "DES is an obsolete encryption algorithm with an insufficient "
            "key size and can be broken using modern computing resources."
        ),
        "recommendation": (
            "Replace DES with AES using an authenticated encryption mode "
            "such as AES-GCM."
        )
    },
    "RSA": {
        "severity": "QUANTUM_VULNERABLE",
        "description": (
            "RSA is currently widely used but is vulnerable to future "
            "large-scale quantum attacks based on Shor's algorithm."
        ),
        "recommendation": (
            "Plan migration toward NIST-standardized post-quantum "
            "cryptography for long-term protection."
        )
    },
    "SHA-256": {
        "severity": "SAFE",
        "description": (
            "SHA-256 is a modern cryptographic hash algorithm suitable "
            "for many integrity and hashing use cases."
        ),
        "recommendation": (
            "Continue using SHA-256 appropriately and ensure it is used "
            "with suitable constructions for the application's use case."
        )
    },
    "AES": {
        "severity": "SAFE",
        "description": (
            "AES is a modern symmetric encryption algorithm when used "
            "with secure key sizes and modes."
        ),
        "recommendation": (
            "Prefer authenticated encryption modes such as AES-GCM and "
            "use securely generated keys."
        )
    }
}


def enrich_finding(finding: Finding) -> Finding:
    rule = RISK_RULES.get(finding.algorithm)

    if rule is None:
        finding.severity = "SAFE"
        finding.description = (
            "No specific high-risk rule is currently defined for this "
            "detected algorithm."
        )
        finding.recommendation = (
            "Review the algorithm usage and configuration to ensure it "
            "follows current cryptographic best practices."
        )
        return finding

    finding.severity = rule["severity"]
    finding.description = rule["description"]
    finding.recommendation = rule["recommendation"]

    return finding