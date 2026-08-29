import zipfile
import tempfile
import subprocess
from pathlib import Path
from urllib.parse import urlparse


from scanner import scan_project
from report_generator import save_report


EXCLUDED_DIRECTORIES = {
    ".git",
    "__pycache__",
    "venv",
    ".venv",
    "node_modules",
}


def extract_zip(zip_path):
    zip_path = Path(zip_path)

    if not zip_path.exists():
        raise FileNotFoundError(f"ZIP file not found: {zip_path}")

    if not zipfile.is_zipfile(zip_path):
        raise ValueError("The provided file is not a valid ZIP file.")

    temp_directory = tempfile.mkdtemp(prefix="cryptolens_")
    extraction_path = Path(temp_directory).resolve()

    with zipfile.ZipFile(zip_path, "r") as zip_file:

        for member in zip_file.infolist():

            member_path = (extraction_path / member.filename).resolve()

            if not str(member_path).startswith(str(extraction_path)):
                raise ValueError(
                    f"Unsafe ZIP entry detected: {member.filename}"
                )

        zip_file.extractall(extraction_path)

    return extraction_path


def parse_github_url(github_url):
    parsed_url = urlparse(github_url)

    if parsed_url.scheme != "https":
        raise ValueError("GitHub URL must use HTTPS.")

    if parsed_url.netloc.lower() != "github.com":
        raise ValueError("Please provide a valid GitHub URL.")

    parts = [part for part in parsed_url.path.split("/") if part]

    if len(parts) < 2:
        raise ValueError("Invalid GitHub repository URL.")

    owner = parts[0]
    repository = parts[1]

    if repository.endswith(".git"):
        repository = repository[:-4]

    branch = None

    # Handles URLs like:
    # https://github.com/user/repository/tree/branch
    if len(parts) >= 4 and parts[2] == "tree":
        branch = "/".join(parts[3:])

    return owner, repository, branch


def clone_github_repository(github_url):
    owner, repository, branch = parse_github_url(github_url)

    temp_directory = tempfile.mkdtemp(prefix="cryptolens_github_")
    clone_path = Path(temp_directory).resolve()

    repository_url = (
        f"https://github.com/{owner}/{repository}.git"
    )

    print(f"Cloning repository: {repository_url}")

    command = [
        "git",
        "clone",
        "--depth",
        "1",
    ]

    if branch:
        command.extend([
            "--branch",
            branch,
        ])

    command.extend([
        repository_url,
        str(clone_path),
    ])

    try:
        subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True
        )

    except FileNotFoundError:
        raise RuntimeError(
            "Git is not installed or is not available in PATH."
        )

    except subprocess.CalledProcessError as error:
        raise RuntimeError(
            f"Failed to clone GitHub repository.\n{error.stderr}"
        )

    return clone_path


def scan_zip(zip_path):
    print(f"Processing ZIP: {zip_path}")

    extracted_path = extract_zip(zip_path)

    print(f"ZIP extracted to: {extracted_path}")

    findings = scan_project(extracted_path)

    print("Scan completed!")
    print(f"Total findings: {len(findings)}")

    report = save_report(findings)

    print("Report generated: scan_report.json")

    return report


def scan_github(github_url):
    print(f"Processing GitHub repository: {github_url}")

    repository_path = clone_github_repository(github_url)

    print(f"Repository cloned to: {repository_path}")

    findings = scan_project(repository_path)

    print("Scan completed!")
    print(f"Total findings: {len(findings)}")

    report = save_report(findings)

    print("Report generated: scan_report.json")

    return report


if __name__ == "__main__":

    # -----------------------------------
    # TEST 1: ZIP
    # -----------------------------------

    test_zip = "sample_project.zip"

    try:
        scan_zip(test_zip)

    except Exception as error:
        print(f"ZIP Error: {error}")

    # -----------------------------------
    # TEST 2: GITHUB
    # -----------------------------------

    test_github_url = (
    "https://github.com/aashraykini2109/"
    "CryptoLens/tree/Tejareddy"
)

    try:
        scan_github(test_github_url)

    except Exception as error:
        print(f"GitHub Error: {error}")