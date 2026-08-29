import ast
from pathlib import Path

from detection_rules import DETECTION_RULES
from models import Finding
from risk_engine import enrich_finding
from report_generator import save_report


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
        source_code = file.read()

    try:
        tree = ast.parse(source_code)
    except SyntaxError:
        return []

    findings = []
    lines = source_code.splitlines()

    for node in ast.walk(tree):

        if isinstance(node, ast.Call):

            if isinstance(node.func, ast.Attribute):

                function_name = node.func.attr

                for algorithm, patterns in DETECTION_RULES.items():

                    for pattern in patterns:

                        if pattern.split(".")[-1] == function_name:

                            line_number = node.lineno
                            evidence = lines[line_number - 1].strip()

                            finding = Finding(
                                algorithm=algorithm,
                                file=str(file_path),
                                line=line_number,
                                evidence=evidence
                            )

                            finding = enrich_finding(finding)

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

    report = save_report(results)

    print("Scan completed!")
    print(f"Total findings: {report['total_findings']}")
    print("Report saved to scan_report.json")