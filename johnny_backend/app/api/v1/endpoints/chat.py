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
import google.generativeai as genai
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@router.post("/", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    Handles incoming chat messages using Google Gemini Pro.
    """
    try:
        response = model.generate_content(request.message)
        reply_message = response.text
    except Exception as e:
        reply_message = f"Error communicating with AI: {str(e)}"
    
    return ChatResponse(reply=reply_message)
