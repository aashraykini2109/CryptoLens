from pathlib import Path

from .detection_rules import DETECTION_RULES
from .models import Finding
from .risk_engine import enrich_finding


EXCLUDED_DIRECTORIES = {
    ".git",
    "__pycache__",
    "venv",
    ".venv",
    "node_modules",
}


def scan_project(project_path):
    project_path = Path(project_path)

    findings = []

    if not project_path.exists():
        raise FileNotFoundError(
            f"Project path not found: {project_path}"
        )

    for file_path in project_path.rglob("*"):

        if not file_path.is_file():
            continue

        if any(
            excluded_directory in file_path.parts
            for excluded_directory in EXCLUDED_DIRECTORIES
        ):
            continue

        try:
            content = file_path.read_text(
                encoding="utf-8",
                errors="ignore"
            )

        except Exception:
            continue

        lines = content.splitlines()

        for line_number, line in enumerate(lines, start=1):

            for algorithm, patterns in DETECTION_RULES.items():

                for pattern in patterns:

                    if pattern in line:

                        finding = Finding(
                            algorithm=algorithm,
                            file=str(file_path),
                            line=line_number,
                            evidence=line.strip()
                        )

                        finding = enrich_finding(finding)

                        findings.append(finding)

                        break

    return findings