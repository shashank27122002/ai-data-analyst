import hashlib
import secrets


def generate_refresh_token() -> str:
    """
    Generate a cryptographically secure refresh token.
    """
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    """
    Store only the SHA-256 hash of the refresh token.
    """
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()