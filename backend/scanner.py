from pathlib import Path

from detection_rules import DETECTION_RULES
from models import Finding


EXCLUDED_DIRECTORIES = {
    ".git",
    "__pycache__",
    "venv",
    ".venv",
    "node_modules",
}


def scan_file(file_path):
    file_path = Path(file_path)

    with open(file_path, "r", encoding="utf-8") as file:
        lines = file.readlines()

    findings = []

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

                    findings.append(finding)

    return findings


def scan_project(project_path):
    project_path = Path(project_path)

    all_findings = []

    for file_path in project_path.rglob("*.py"):

        if any(part in EXCLUDED_DIRECTORIES for part in file_path.parts):
            continue

        findings = scan_file(file_path)
        all_findings.extend(findings)

    return all_findings


if __name__ == "__main__":
    results = scan_project("sample_project")

    for finding in results:
        print(finding)