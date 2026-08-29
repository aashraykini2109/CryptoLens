import json
from dataclasses import asdict

from .models import Finding


def generate_report(findings):
    report = {
        "total_findings": len(findings),
        "findings": [asdict(finding) for finding in findings]
    }

    return report


def save_report(findings, output_file="scan_report.json"):
    report = generate_report(findings)

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=4)

    return report