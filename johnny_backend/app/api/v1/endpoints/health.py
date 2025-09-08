# app/api/v1/endpoints/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_health_status():
    """
    Provides a simple health check endpoint.
    """
    return {"status": "ok", "service": "Johnny Backend API", "version": "1.0"}