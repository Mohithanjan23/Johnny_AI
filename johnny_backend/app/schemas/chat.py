from pydantic import BaseModel
from typing import List, Optional

class MessageRole(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    user_id: str
    history: Optional[List[MessageRole]] = []

class ChatResponse(BaseModel):
    reply: str
