from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
import google.generativeai as genai
from app.core.config import settings

router = APIRouter()

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

@router.post("/", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    Handles incoming chat messages using Google Gemini Pro with conversation history.
    """
    try:
        formatted_history = []
        if request.history:
            for msg in request.history:
                role = "user" if msg.role == "user" else "model"
                formatted_history.append({"role": role, "parts": [msg.content]})
        
        chat = model.start_chat(history=formatted_history)
        response = chat.send_message(request.message)
        reply_message = response.text
    except Exception as e:
        reply_message = f"Error communicating with AI: {str(e)}"
    
    return ChatResponse(reply=reply_message)
