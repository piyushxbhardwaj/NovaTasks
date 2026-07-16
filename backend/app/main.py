from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
origins = [origin for origin in settings.CORS_ORIGINS if origin]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "NovaTasks API is running"
    }

@app.get("/")
def read_root():
    return {
        "message": "Welcome to NovaTasks API. Visit /docs for Swagger UI documentation."
    }
