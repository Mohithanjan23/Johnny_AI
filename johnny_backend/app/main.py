# app/main.py
from fastapi import FastAPI
from app.api.v1.endpoints import health

app = FastAPI(
    title="Johnny AI Backend",
    description="The core API for the Johnny personalized AI assistant.",
    version="1.0.0"
)

# Include the v1 API routers
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])

@app.get("/", tags=["Root"])
def read_root():
    """
    A welcome message for the root endpoint.
    """
    return {"message": "Johnny system online. Awaiting commands."}