import json
from dataclasses import asdict


def calculate_summary(findings):
    summary = {
        "critical": 0,
        "quantum_vulnerable": 0,
        "safe": 0
    }

    for finding in findings:
        if finding.severity in ["CRITICAL", "HIGH"]:
            summary["critical"] += 1

        elif finding.severity == "QUANTUM_VULNERABLE":
            summary["quantum_vulnerable"] += 1

        else:
            summary["safe"] += 1

    return summary


def calculate_health_score(findings):
    total_findings = len(findings)

    if total_findings == 0:
        return 100

    severity_weights = {
        "CRITICAL": 10,
        "HIGH": 8,
        "MEDIUM": 5,
        "LOW": 2,
        "SAFE": 0,
        "QUANTUM_VULNERABLE": 6
    }

    total_risk = sum(
        severity_weights.get(finding.severity, 3)
        for finding in findings
    )

    maximum_possible_risk = total_findings * 10

    health_score = round(
        100 - (total_risk / maximum_possible_risk) * 100
    )

    return max(0, min(100, health_score))


def calculate_quantum_score(findings):
    total_findings = len(findings)

    if total_findings == 0:
        return 100

    quantum_vulnerable_count = sum(
        1 for finding in findings
        if finding.severity == "QUANTUM_VULNERABLE"
    )

    quantum_score = round(
        ((total_findings - quantum_vulnerable_count) / total_findings) * 100
    )

    return quantum_score


def generate_report(findings):
    summary = calculate_summary(findings)

    report = {
        "health_score": calculate_health_score(findings),
        "quantum_score": calculate_quantum_score(findings),
        "summary": summary,
        "total_findings": len(findings),
        "findings": [
            asdict(finding)
            for finding in findings
        ]
    }

    return report


def save_report(findings, output_file="scan_report.json"):
    report = generate_report(findings)

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=4)

    return report