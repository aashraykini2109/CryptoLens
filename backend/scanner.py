import ast
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


def _get_call_name(node):
    """
    Convert an AST expression into a dotted function/class name.

    Examples:

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
    Build a mapping between local names used in the source code
    and their original imported Python names.

    Examples:

        import hashlib

        becomes:

        hashlib -> hashlib


        import hashlib as crypto

        becomes:

        crypto -> hashlib


        from hashlib import md5

        becomes:

        md5 -> hashlib.md5


        from hashlib import md5 as weak_hash

        becomes:

        weak_hash -> hashlib.md5
    """

    import_map = {}

    for node in ast.walk(tree):

        # ---------------------------------------------------------
        # import hashlib
        # import hashlib as crypto
        # ---------------------------------------------------------

        if isinstance(node, ast.Import):

            for alias in node.names:

                original_name = alias.name

                if alias.asname:
                    local_name = alias.asname
                else:
                    local_name = original_name.split(".")[0]

                import_map[local_name] = original_name

        # ---------------------------------------------------------
        # from hashlib import md5
        # from hashlib import md5 as weak_hash
        # ---------------------------------------------------------

        elif isinstance(node, ast.ImportFrom):

            if node.module is None:
                continue

            for alias in node.names:

                # Ignore wildcard imports.
                if alias.name == "*":
                    continue

                original_name = f"{node.module}.{alias.name}"

                local_name = alias.asname or alias.name

                import_map[local_name] = original_name

    return import_map


def _resolve_call_name(call_name, import_map):
    """
    Resolve imported module/function aliases.

    Example:

        import hashlib as crypto

        crypto.md5(...)

    Initially:

        crypto.md5

    After resolution:

        hashlib.md5
    """

    if not call_name:
        return None

    parts = call_name.split(".")

    first_part = parts[0]

    if first_part not in import_map:
        return call_name

    imported_name = import_map[first_part]

    remaining_parts = parts[1:]

    if remaining_parts:
        return (
            imported_name
            + "."
            + ".".join(remaining_parts)
        )

    return imported_name


def _match_algorithm(resolved_name):
    """
    Match a resolved Python API name against DETECTION_RULES.

    Example:

        resolved_name = "hashlib.md5"

        returns:

        "MD5"
    """

    if not resolved_name:
        return None

    for module_name, functions in DETECTION_RULES.items():

        prefix = module_name + "."

        if not resolved_name.startswith(prefix):
            continue

        function_name = resolved_name[len(prefix):]

        if function_name in functions:
            return functions[function_name]

    return None


def _detect_python_file(file_path):
    """
    Parse and scan a single Python file using Python's AST module.

    The scanner examines the actual structure of the Python code.

    It does not depend on:
        - the filename
        - directory name
        - keywords in the filename

    It resolves:
        - normal imports
        - module aliases
        - direct function imports
        - function aliases
    """

    # -------------------------------------------------------------
    # Read source code
    # -------------------------------------------------------------

    try:
        content = file_path.read_text(
            encoding="utf-8",
            errors="ignore"
        )

    except Exception:
        return []

    # -------------------------------------------------------------
    # Parse source code into an Abstract Syntax Tree.
    # -------------------------------------------------------------

    try:
        tree = ast.parse(
            content,
            filename=str(file_path)
        )

    except (SyntaxError, ValueError, TypeError):
        # Invalid Python syntax should not crash the whole scan.
        return []

    # -------------------------------------------------------------
    # Resolve imports and aliases.
    # -------------------------------------------------------------

    import_map = _build_import_map(tree)

    lines = content.splitlines()

    findings = []

    # -------------------------------------------------------------
    # Walk through the AST.
    # -------------------------------------------------------------

    for node in ast.walk(tree):

        # We are interested in function/class calls.
        if not isinstance(node, ast.Call):
            continue

        # Example:
        #
        # hashlib.md5(...)
        #
        # AST gives us the function expression.
        call_name = _get_call_name(node.func)

        if not call_name:
            continue

        # ---------------------------------------------------------
        # Resolve aliases.
        # ---------------------------------------------------------

        resolved_name = _resolve_call_name(
            call_name,
            import_map
        )

        # ---------------------------------------------------------
        # Check the resolved API against our crypto rules.
        # ---------------------------------------------------------

        algorithm = _match_algorithm(
            resolved_name
        )

        if algorithm is None:
            continue

        # ---------------------------------------------------------
        # Get line number.
        # ---------------------------------------------------------

        line_number = getattr(
            node,
            "lineno",
            1
        )

        # ---------------------------------------------------------
        # Get the actual source line as evidence.
        # ---------------------------------------------------------

        evidence = ""

        if 1 <= line_number <= len(lines):
            evidence = lines[line_number - 1].strip()

        # ---------------------------------------------------------
        # Create finding.
        # ---------------------------------------------------------

        finding = Finding(
            algorithm=algorithm,
            file=str(file_path),
            line=line_number,
            evidence=evidence
        )

        # ---------------------------------------------------------
        # Add severity, description and recommendation.
        # ---------------------------------------------------------

        finding = enrich_finding(finding)

        findings.append(finding)

    return findings


def scan_project(project_path):
    """
    Scan a project directory.

    Python files are analyzed using Python's AST parser.

    Non-Python files are currently skipped.

    Returns:
        list[Finding]
    """

    project_path = Path(project_path)

    if not project_path.exists():
        raise FileNotFoundError(
            f"Project path not found: {project_path}"
        )

    findings = []

    # -------------------------------------------------------------
    # Recursively walk through the project.
    # -------------------------------------------------------------

    for file_path in project_path.rglob("*"):

        if not file_path.is_file():
            continue

        # ---------------------------------------------------------
        # Skip dependency/build/system directories.
        # ---------------------------------------------------------

        if any(
            excluded_directory in file_path.parts
            for excluded_directory in EXCLUDED_DIRECTORIES
        ):
            continue

        # ---------------------------------------------------------
        # Currently AST scanning is for Python files.
        # ---------------------------------------------------------

        if file_path.suffix.lower() != ".py":
            continue

        findings.extend(
            _detect_python_file(file_path)
        )

    return findings