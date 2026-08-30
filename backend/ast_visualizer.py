import ast
import json
from pathlib import Path

from .detection_rules import DETECTION_RULES


def get_call_name(node):
    """
    Convert an AST function expression into a dotted name.

    Examples:
        hashlib.md5      -> hashlib.md5
        hashlib.sha256   -> hashlib.sha256
        md5              -> md5
    """

    if isinstance(node, ast.Name):
        return node.id

    if isinstance(node, ast.Attribute):
        parent = get_call_name(node.value)

        if parent:
            return f"{parent}.{node.attr}"

        return node.attr

    return None


def get_expression_name(node):
    """
    Convert an AST expression into a simple readable string.
    """

    if isinstance(node, ast.Name):
        return node.id

    if isinstance(node, ast.Attribute):
        parent = get_expression_name(node.value)

        if parent:
            return f"{parent}.{node.attr}"

        return node.attr

    if isinstance(node, ast.Call):

        function_name = get_call_name(node.func)

        if not function_name:
            return type(node).__name__

        arguments = [
            get_expression_name(argument)
            for argument in node.args
        ]

        if arguments:
            return f"{function_name}({', '.join(arguments)})"

        return f"{function_name}()"

    if isinstance(node, ast.Constant):
        return repr(node.value)

    return type(node).__name__


def build_import_map(tree):
    """
    Resolve normal imports and aliases.

    Examples:

        import hashlib
        import hashlib as crypto

        from hashlib import md5
        from hashlib import md5 as weak_hash
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


def resolve_call_name(call_name, import_map):
    """
    Resolve imported aliases.

    Example:

        crypto.md5
            ↓
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


def match_algorithm(resolved_name):
    """
    Match an API against the actual CryptoLens
    detection rules.
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


def find_crypto_calls(source_code):
    """
    Parse source code and find cryptographic calls.

    The actual detection rules are reused from
    detection_rules.py.
    """

    tree = ast.parse(source_code)

    import_map = build_import_map(tree)

    matches = []

    for node in ast.walk(tree):

        if not isinstance(node, ast.Call):
            continue

        call_name = get_call_name(node.func)

        if not call_name:
            continue

        resolved_name = resolve_call_name(
            call_name,
            import_map
        )

        algorithm = match_algorithm(
            resolved_name
        )

        if algorithm is None:
            continue

        matches.append({
            "node": node,
            "algorithm": algorithm,
            "call_name": call_name,
            "resolved_name": resolved_name,
            "line": getattr(node, "lineno", None)
        })

    return matches


def create_simple_tree(match):
    """
    Create the SIMPLE AST branch that the frontend
    can render as a tree.

    We intentionally do NOT expose the complete AST.

    Example:

        MD5
        └── hashlib.md5
            └── password.encode()
    """

    node = match["node"]

    algorithm = match["algorithm"]

    resolved_name = match["resolved_name"]

    arguments = []

    for argument in node.args:

        arguments.append({
            "label": get_expression_name(argument),
            "type": "argument",
            "children": []
        })

    function_node = {
        "label": resolved_name,
        "type": "function",
        "children": arguments
    }

    return {
        "label": algorithm,
        "type": "algorithm",
        "line": match["line"],
        "children": [
            function_node
        ]
    }


def generate_simple_ast_tree(source_code):
    """
    Generate simple AST trees for all cryptographic
    findings in the source code.
    """

    matches = find_crypto_calls(source_code)

    trees = []

    for match in matches:

        trees.append(
            create_simple_tree(match)
        )

    return {
        "trees": trees
    }


def read_source_file(file_path):
    """
    Read a Python source file.
    """

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    return file_path.read_text(
        encoding="utf-8",
        errors="ignore"
    )


if __name__ == "__main__":

    # ---------------------------------------------------------
    # Demo file
    # ---------------------------------------------------------

    test_file = Path("ast_test.py")

    try:

        source_code = read_source_file(
            test_file
        )

        print(
            "=== SIMPLE CRYPTOLENS AST TREE ==="
        )

        result = generate_simple_ast_tree(
            source_code
        )

        print(
            json.dumps(
                result,
                indent=2
            )
        )

    except Exception as error:

        print(
            f"AST Error: {error}"
        )