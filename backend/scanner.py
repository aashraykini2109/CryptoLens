import ast
from pathlib import Path

from .models import Finding
from .risk_engine import enrich_finding


EXCLUDED_DIRECTORIES = {
    ".git",
    "__pycache__",
    "venv",
    ".venv",
    "node_modules",
}


# Python cryptographic APIs we want to recognize.
#
# The scanner resolves imports and aliases first, so these can be detected:
#
#     import hashlib
#     hashlib.md5(...)
#
#     import hashlib as crypto
#     crypto.md5(...)
#
#     from hashlib import md5
#     md5(...)
#
#     from hashlib import md5 as weak_hash
#     weak_hash(...)

PYTHON_CRYPTO_FUNCTIONS = {
    "hashlib": {
        "md5": "MD5",
        "sha1": "SHA-1",
        "sha256": "SHA-256",
        "sha384": "SHA-384",
        "sha512": "SHA-512",
    },
}


def _get_call_name(node):
    """
    Convert an AST call target into a dotted name.

    Example:

        hashlib.md5(...)
        -> "hashlib.md5"

        crypto.md5(...)
        -> "crypto.md5"

        md5(...)
        -> "md5"
    """

    if isinstance(node, ast.Name):
        return node.id

    if isinstance(node, ast.Attribute):
        parent = _get_call_name(node.value)

        if parent:
            return f"{parent}.{node.attr}"

        return node.attr

    return None


def _build_import_map(tree):
    """
    Build a map of names used in the Python file to their original
    cryptographic module/function.

    Example:

        import hashlib as crypto

    becomes:

        {
            "crypto": "hashlib"
        }

    And:

        from hashlib import md5 as weak_hash

    becomes:

        {
            "weak_hash": "hashlib.md5"
        }
    """

    import_map = {}

    for node in ast.walk(tree):

        if isinstance(node, ast.Import):

            for alias in node.names:

                original_name = alias.name

                if alias.asname:
                    local_name = alias.asname
                else:
                    local_name = original_name.split(".")[0]

                import_map[local_name] = original_name

        elif isinstance(node, ast.ImportFrom):

            if node.module is None:
                continue

            for alias in node.names:

                if alias.name == "*":
                    continue

                original_name = f"{node.module}.{alias.name}"

                local_name = alias.asname or alias.name

                import_map[local_name] = original_name

    return import_map


def _detect_python_file(file_path):
    """
    Parse a Python file using Python's AST module and detect
    cryptographic API calls.
    """

    try:
        content = file_path.read_text(
            encoding="utf-8",
            errors="ignore"
        )

    except Exception:
        return []

    try:
        tree = ast.parse(
            content,
            filename=str(file_path)
        )

    except (SyntaxError, ValueError):
        return []

    import_map = _build_import_map(tree)

    lines = content.splitlines()

    findings = []

    for node in ast.walk(tree):

        if not isinstance(node, ast.Call):
            continue

        call_name = _get_call_name(node.func)

        if not call_name:
            continue

        resolved_name = call_name

        # Resolve aliases.
        #
        # Example:
        #     crypto.md5(...)
        #
        # import_map:
        #     crypto -> hashlib
        #
        # becomes:
        #     hashlib.md5

        first_part = call_name.split(".")[0]

        if first_part in import_map:

            imported_name = import_map[first_part]

            remaining_parts = call_name.split(".")[1:]

            if remaining_parts:
                resolved_name = (
                    imported_name
                    + "."
                    + ".".join(remaining_parts)
                )
            else:
                resolved_name = imported_name

        algorithm = None

        # Direct module.function form:
        #
        # hashlib.md5
        # hashlib.sha1
        # etc.
        for module_name, functions in PYTHON_CRYPTO_FUNCTIONS.items():

            prefix = module_name + "."

            if resolved_name.startswith(prefix):

                function_name = resolved_name[len(prefix):]

                if function_name in functions:
                    algorithm = functions[function_name]

                    break

        # Imported function form:
        #
        # from hashlib import md5
        # md5(...)
        #
        if algorithm is None:

            for module_name, functions in PYTHON_CRYPTO_FUNCTIONS.items():

                for function_name, algorithm_name in functions.items():

                    expected_name = (
                        module_name
                        + "."
                        + function_name
                    )

                    if resolved_name == expected_name:
                        algorithm = algorithm_name
                        break

                if algorithm:
                    break

        if algorithm is None:
            continue

        line_number = getattr(
            node,
            "lineno",
            1
        )

        evidence = ""

        if 1 <= line_number <= len(lines):
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
    """
    Scan a project directory.

    Python files are analyzed using the AST parser.

    Non-Python files are currently ignored by the AST scanner.
    """

    project_path = Path(project_path)

    if not project_path.exists():
        raise FileNotFoundError(
            f"Project path not found: {project_path}"
        )

    findings = []

    for file_path in project_path.rglob("*"):

        if not file_path.is_file():
            continue

        if any(
            excluded_directory in file_path.parts
            for excluded_directory in EXCLUDED_DIRECTORIES
        ):
            continue

        # AST analysis for Python files.
        if file_path.suffix.lower() == ".py":

            findings.extend(
                _detect_python_file(file_path)
            )

    return findings