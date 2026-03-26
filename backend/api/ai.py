from fastapi import APIRouter, Depends, HTTPException
from services.ai_assistant import AIAssistant
from authentication.auth import get_current_user
from pydantic import BaseModel

class AIRequest(BaseModel):
    query: str
    context: str = ""

router = APIRouter(prefix="/ai", tags=["ai-assistant"])

@router.post("/chat")
async def chat_with_ai(request: AIRequest, current_user: dict = Depends(get_current_user)):
    """Chat with the AI security assistant."""
    response = await AIAssistant.explain_vulnerability(request.query, request.context)
    return {"response": response}

@router.post("/remediate")
async def get_remediation(vuln_name: str, current_user: dict = Depends(get_current_user)):
    """Get AI-generated remediation steps."""
    response = await AIAssistant.explain_vulnerability(f"How to fix {vuln_name}?")
    return {"remediation": response}
