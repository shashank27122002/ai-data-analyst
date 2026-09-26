from datetime import datetime, timedelta

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Response,
    status,
)
from sqlalchemy.orm import Session

from database.models import User, RefreshToken
from database.postgres import get_db

from auth.password import hash_password, verify_password
from auth.jwt import (
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from auth.schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
)
from auth.dependencies import get_current_user
from auth.refresh_tokens import (
    generate_refresh_token,
    hash_refresh_token,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# =========================================================
# REFRESH TOKEN SETTINGS
# =========================================================

REFRESH_TOKEN_EXPIRE_DAYS = 30

# Local development:
# False because the local API uses HTTP.
#
# Production:
# Change this to True when the application runs on HTTPS.
REFRESH_COOKIE_SECURE = False

REFRESH_COOKIE_NAME = "refresh_token"


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = request.email.lower().strip()

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to register with these credentials",
        )

    password_hash = hash_password(request.password)

    user = User(
        email=email,
        password_hash=password_hash,
        role="user",
        is_active=1,
        is_verified=0,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return RegisterResponse(
        message="User registered successfully",
        user_id=user.id,
        email=user.email,
    )


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    email = request.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # Do not reveal whether the email exists.
    if not user or not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    # -----------------------------------------------------
    # Update last login
    # -----------------------------------------------------

    user.last_login_at = datetime.utcnow()

    # -----------------------------------------------------
    # Create short-lived access JWT
    # -----------------------------------------------------

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    # -----------------------------------------------------
    # Create secure refresh token
    # -----------------------------------------------------

    raw_refresh_token = generate_refresh_token()

    refresh_token_hash = hash_refresh_token(
        raw_refresh_token
    )

    refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=refresh_token_hash,
        created_at=datetime.utcnow(),
        expires_at=(
            datetime.utcnow()
            + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        ),
    )

    db.add(refresh_token)
    db.commit()

    # -----------------------------------------------------
    # Store refresh token in HttpOnly cookie
    # -----------------------------------------------------

    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_refresh_token,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth",
    )

    # -----------------------------------------------------
    # Return only access token
    #
    # Refresh token is NOT returned in JSON.
    # -----------------------------------------------------

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# =========================================================
# REFRESH ACCESS TOKEN
# =========================================================

@router.post(
    "/refresh",
    response_model=LoginResponse,
)
def refresh_access_token(
    response: Response,
    refresh_token: str | None = Cookie(
        default=None,
        alias=REFRESH_COOKIE_NAME,
    ),
    db: Session = Depends(get_db),
):
    """
    Issue a new access token using the refresh token
    stored in the HttpOnly cookie.

    The refresh token is rotated after successful use.
    """

    # -----------------------------------------------------
    # Check cookie
    # -----------------------------------------------------

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    # -----------------------------------------------------
    # Hash incoming refresh token
    # -----------------------------------------------------

    token_hash = hash_refresh_token(refresh_token)

    # -----------------------------------------------------
    # Find active refresh-token session
    # -----------------------------------------------------

    stored_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
        )
        .first()
    )

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # -----------------------------------------------------
    # Check expiration
    # -----------------------------------------------------

    if stored_token.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    # -----------------------------------------------------
    # Find active user
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == stored_token.user_id,
            User.is_active == 1,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # -----------------------------------------------------
    # Revoke old refresh token
    # -----------------------------------------------------

    stored_token.revoked_at = datetime.utcnow()

    # -----------------------------------------------------
    # Generate new refresh token
    # -----------------------------------------------------

    new_raw_refresh_token = generate_refresh_token()

    new_refresh_token_hash = hash_refresh_token(
        new_raw_refresh_token
    )

    new_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=new_refresh_token_hash,
        created_at=datetime.utcnow(),
        expires_at=(
            datetime.utcnow()
            + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        ),
    )

    db.add(new_refresh_token)

    # -----------------------------------------------------
    # Generate new access token
    # -----------------------------------------------------

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    db.commit()

    # -----------------------------------------------------
    # Replace old refresh-token cookie
    # -----------------------------------------------------

    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=new_raw_refresh_token,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth",
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# =========================================================
# LOGOUT
# =========================================================

@router.post("/logout")
def logout(
    response: Response,
    refresh_token: str | None = Cookie(
        default=None,
        alias=REFRESH_COOKIE_NAME,
    ),
    db: Session = Depends(get_db),
):
    """
    Revoke the current refresh token and remove
    the refresh-token cookie.
    """

    # -----------------------------------------------------
    # Revoke refresh token in database
    # -----------------------------------------------------

    if refresh_token:
        token_hash = hash_refresh_token(refresh_token)

        stored_token = (
            db.query(RefreshToken)
            .filter(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
            )
            .first()
        )

        if stored_token:
            stored_token.revoked_at = datetime.utcnow()
            db.commit()

    # -----------------------------------------------------
    # Delete browser cookie
    # -----------------------------------------------------

    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/auth",
    )

    return {
        "message": "Logged out successfully"
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
    }