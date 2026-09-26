"""Small reusable payload validators for the operations routes.

Kept intentionally simple (stub-level) — swap for Marshmallow/Pydantic
schemas if validation needs grow.
"""


def require_fields(payload: dict, fields: list[str]) -> str | None:
    """Returns an error message if a required field is missing/empty, else None."""
    for field in fields:
        if payload.get(field) in (None, "", []):
            return f"'{field}' is required"
    return None


def validate_lines(lines: list[dict], required=("product_id", "location_id", "quantity")) -> str | None:
    if not lines:
        return "At least one line is required"
    for i, line in enumerate(lines):
        missing = require_fields(line, list(required))
        if missing:
            return f"Line {i}: {missing}"
        if line.get("quantity", 0) <= 0:
            return f"Line {i}: quantity must be > 0"
    return None
