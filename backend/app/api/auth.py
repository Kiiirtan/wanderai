"""Authentication API routes with input validation, rate limiting, and brute-force protection."""
import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.core.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_required_user,
)
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- In-Memory Rate Limiter for Auth Routes (Prevents Brute-Force Attacks) ---
_login_attempts: dict[str, list[float]] = defaultdict(list)
_register_attempts: dict[str, list[float]] = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
MAX_REGISTER_ATTEMPTS = 5
WINDOW_SECONDS = 60.0

# Dummy hash for timing-attack mitigation when user does not exist
_DUMMY_HASH = get_password_hash("dummy-safe-entropy-hash-constant-time")


def _check_rate_limit(request: Request, attempts_dict: dict, max_attempts: int, action: str):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    # Prune old timestamps
    attempts_dict[client_ip] = [t for t in attempts_dict[client_ip] if now - t < WINDOW_SECONDS]

    if len(attempts_dict[client_ip]) >= max_attempts:
        retry_after = int(WINDOW_SECONDS - (now - attempts_dict[client_ip][0])) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many {action} attempts. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )
    attempts_dict[client_ip].append(now)


# --- Strict Pydantic Schemas ---

class RegisterRequest(BaseModel):
    email: str = Field(
        ...,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        max_length=255,
        description="Valid email address.",
    )
    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_-]+$",
        description="Username must be 3-30 characters and only contain letters, numbers, underscores, and hyphens.",
    )
    password: str = Field(
        ...,
        min_length=settings.MIN_PASSWORD_LENGTH,
        max_length=settings.MAX_PASSWORD_LENGTH,
        description="Password must be between 8 and 72 characters.",
    )
    full_name: str = Field("", max_length=100)


class LoginRequest(BaseModel):
    email: str = Field(
        ...,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        max_length=255,
    )
    password: str = Field(..., min_length=1, max_length=settings.MAX_PASSWORD_LENGTH)


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str | None
    avatar_url: str | None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    req: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user with strict input hygiene and rate limiting."""
    _check_rate_limit(request, _register_attempts, MAX_REGISTER_ATTEMPTS, "registration")

    clean_email = req.email.strip().lower()
    clean_username = req.username.strip()

    # Check if email is already registered
    result = await db.execute(select(User).where(User.email == clean_email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Check if username is already taken
    result = await db.execute(select(User).where(User.username == clean_username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This username is already taken")

    user = User(
        email=clean_email,
        username=clean_username,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name.strip() or clean_username,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    req: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Login with constant-time verification and brute-force throttling."""
    _check_rate_limit(request, _login_attempts, MAX_LOGIN_ATTEMPTS, "login")

    clean_email = req.email.strip().lower()
    result = await db.execute(select(User).where(User.email == clean_email))
    user = result.scalar_one_or_none()

    # Mitigate timing attack: verify password even if user does not exist
    hash_to_check = user.hashed_password if user else _DUMMY_HASH
    is_valid = verify_password(req.password, hash_to_check)

    if not user or not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_required_user)):
    """Get authenticated user profile."""
    return UserResponse.model_validate(user)
