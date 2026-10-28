"""FastAPI main application entry point with security middleware and hardening."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import init_db
from app.api.auth import router as auth_router
from app.api.trips import router as trips_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    # Hide Swagger/OpenAPI docs when in production mode to prevent information disclosure
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# CORS middleware with strict allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Inject industry-standard HTTP security headers and strip sensitive server banners."""
    response: Response = await call_next(request)

    # Protect against MIME sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Protect against clickjacking
    response.headers["X-Frame-Options"] = "DENY"
    # Cross-site scripting filter
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Strict referrer policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Content security policy basics for API
    response.headers["Content-Security-Policy"] = "default-src 'self'"

    # Remove or mask server software details
    if "Server" in response.headers:
        del response.headers["Server"]

    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Sanitize internal errors to prevent leaking stack traces or system paths."""
    if settings.DEBUG:
        # In debug mode, return details for developer convenience
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)},
        )
    # In production, return an opaque generic error
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Register API routers
app.include_router(auth_router)
app.include_router(trips_router)


@app.get("/api/health")
async def health_check():
    """Sanitized health check endpoint."""
    return {
        "status": "healthy",
        "app": "WanderAI",
    }
