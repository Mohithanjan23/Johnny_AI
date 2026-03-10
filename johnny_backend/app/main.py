from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import health, chat

app = FastAPI(
    title="Johnny AI Backend",
    description="The core API for the Johnny personalized AI assistant.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the v1 API routers
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])

@app.get("/", tags=["Root"])
def read_root():
    """
    A welcome message for the root endpoint.
    """
    return {"message": "Johnny system online. Awaiting commands."}