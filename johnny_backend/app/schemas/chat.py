# johnny_backend/app/schemas/chat.py
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    user_id: str # We will use this later for context

class ChatResponse(BaseModel):
    reply: str
