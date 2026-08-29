import json
from dataclasses import asdict

from .models import Finding
from .risk_engine import calculate_health_score, calculate_severity_summary


def generate_report(findings):
    health_score = calculate_health_score(findings)
    severity_summary = calculate_severity_summary(findings)

    report = {
        "health_score": health_score,
        "total_findings": len(findings),
        "severity_summary": severity_summary,
        "findings": [asdict(finding) for finding in findings]
    }

    return report


def save_report(findings, output_file="scan_report.json"):
    report = generate_report(findings)

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=4)

    return report