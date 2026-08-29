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


# Number of health-score points deducted for each finding.
#
# The project starts with a score of 100.
# More serious findings cause a larger deduction.
SEVERITY_DEDUCTIONS = {
    "CRITICAL": 25,
    "HIGH": 15,
    "MEDIUM": 8,
    "LOW": 2,
}


def enrich_finding(finding: Finding) -> Finding:
    """
    Add severity, description, and recommendation information
    to a detected finding.
    """

    rule = RISK_RULES.get(finding.algorithm)

    if rule is None:
        return finding

    finding.severity = rule["severity"]
    finding.description = rule["description"]
    finding.recommendation = rule["recommendation"]

    return finding


def calculate_health_score(findings):
    """
    Calculate the Crypto Health Score for a scanned project.

    Every project starts with a score of 100.

    Points are deducted according to the severity of each
    cryptographic finding.

    CRITICAL -> -25
    HIGH     -> -15
    MEDIUM   -> -8
    LOW      -> -2

    The final score is always kept between 0 and 100.
    """

    score = 100

    for finding in findings:
        severity = str(finding.severity or "").upper()

        deduction = SEVERITY_DEDUCTIONS.get(severity, 0)

        score -= deduction

    return max(0, min(100, score))


def calculate_severity_summary(findings):
    """
    Count findings according to their severity.

    Returns a dictionary that can be sent to the frontend.
    """

    summary = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
    }

    for finding in findings:
        severity = str(finding.severity or "").upper()

        if severity == "CRITICAL":
            summary["critical"] += 1

        elif severity == "HIGH":
            summary["high"] += 1

        elif severity == "MEDIUM":
            summary["medium"] += 1

        elif severity == "LOW":
            summary["low"] += 1

    return summary