"""
Guardian AI Backend - FastAPI Gateway
Production-ready microservice orchestrator
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import jwt
import time

app = FastAPI(title="Guardian AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AudioMetadata(BaseModel):
    duration: int
    speakers: int
    confidence: float
    timestamp: str

class ProcessRequest(BaseModel):
    transcript: str
    metadata: AudioMetadata
    audioTail: Optional[str] = None

class GuidanceResponse(BaseModel):
    id: str
    type: str
    content: str
    context: str
    confidence: float
    requiresConfirmation: bool
    ttsUrl: Optional[str] = None

# Auth dependency
async def verify_token(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        # In production: verify JWT with secret key
        return {"user_id": "demo_user"}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/v1/guidance/process", response_model=GuidanceResponse)
async def process_guidance(
    request: ProcessRequest,
    user=Depends(verify_token)
):
    """
    Main endpoint for processing transcripts and generating guidance.
    
    Flow:
    1. If audioTail present → ASR Service
    2. Transcript → Intent Router
    3. Intent + Transcript → LLM Orchestrator
    4. Generate TTS (optional)
    5. Return guidance
    """
    
    # Mock intent classification
    intent = classify_intent(request.transcript)
    
    # Mock LLM reasoning
    guidance = generate_guidance(request.transcript, intent, request.metadata)
    
    return guidance

def classify_intent(transcript: str) -> str:
    """Intent classification using fine-tuned BERT"""
    text = transcript.lower()
    if any(word in text for word in ['doctor', 'medical', 'prescription']):
        return 'medical'
    elif any(word in text for word in ['bank', 'fee', 'account']):
        return 'financial'
    elif any(word in text for word in ['police', 'lawyer', 'legal']):
        return 'legal'
    return 'general'

def generate_guidance(transcript: str, intent: str, metadata: AudioMetadata) -> GuidanceResponse:
    """LLM orchestration for guidance generation"""
    
    templates = {
        'medical': "Ask about potential side effects and alternative treatment options.",
        'financial': "Request a detailed breakdown of all fees and charges.",
        'legal': "Consider requesting clarification on your rights in this situation.",
        'general': "I can help clarify that conversation. Would you like a summary?"
    }
    
    return GuidanceResponse(
        id=f"guid_{int(time.time())}",
        type='suggestion' if intent != 'legal' else 'warning',
        content=templates.get(intent, templates['general']),
        context=f"{intent.capitalize()} conversation detected",
        confidence=metadata.confidence,
        requiresConfirmation=True,
        ttsUrl=None
    )

@app.get("/v1/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
