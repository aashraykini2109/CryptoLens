from dataclasses import dataclass


@dataclass
class Finding:
    algorithm: str
    file: str
    line: int
    evidence: str
    severity: str = ""
    description: str = ""
    recommendation: str = ""