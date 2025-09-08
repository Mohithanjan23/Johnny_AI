# johnny_backend/app/api/v1/endpoints/chat.py
from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    Handles incoming chat messages.
    For now, it simply echoes the message back.
    """
    # Placeholder for Gemini Pro API call
    reply_message = f"Backend acknowledges your message: '{request.message}'"
    
    return ChatResponse(reply=reply_message)
