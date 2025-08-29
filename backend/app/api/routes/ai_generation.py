from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.ai_generation import AIGeneration
from app.services.ai_router import AIRouter

router = APIRouter()
ai_router = AIRouter()

# Simplified request model for frontend compatibility
class SimpleGenerationRequest(BaseModel):
    prompt: str
    model: str
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class GenerationRequest(BaseModel):
    provider: str
    model: str
    prompt: str
    parameters: Optional[Dict[str, Any]] = {}

class GenerationResponse(BaseModel):
    id: int
    content: Dict[str, Any]
    model: str
    provider: str
    generation_time: float
    tokens_used: int
    cost: float

@router.post("/generate", response_model=GenerationResponse)
async def generate_content(
    request: GenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI content using specified provider and model"""
    try:
        # Check user credits
        if current_user.credits_remaining <= 0:
            raise HTTPException(status_code=429, detail="Insufficient credits")
        
        # Generate content
        result = await ai_router.generate(
            provider=request.provider,
            model=request.model,
            prompt=request.prompt,
            parameters=request.parameters,
            user_id=current_user.id
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Calculate cost and tokens
        tokens_used = result.get("content", {}).get("usage", {}).get("total_tokens", 0)
        cost = calculate_cost(request.provider, request.model, tokens_used)
        
        # Save generation to database
        db_generation = AIGeneration(
            user_id=current_user.id,
            provider=request.provider,
            model=request.model,
            prompt=request.prompt,
            generated_content=str(result["content"]),
            parameters=request.parameters,
            content_type=result["content"].get("type", "text"),
            generation_time=result["generation_time"],
            tokens_used=tokens_used,
            cost=cost,
            status="completed"
        )
        db.add(db_generation)
        
        # Update user credits and stats
        current_user.credits_remaining -= max(1, int(cost * 100))  # Deduct credits
        current_user.total_generations += 1
        current_user.tokens_used += tokens_used
        
        db.commit()
        db.refresh(db_generation)
        
        return GenerationResponse(
            id=db_generation.id,
            content=result["content"],
            model=request.model,
            provider=request.provider,
            generation_time=result["generation_time"],
            tokens_used=tokens_used,
            cost=cost
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models")
async def get_available_models():
    """Get list of available AI models"""
    return {
        "text_models": [
            {"id": "gpt-4o", "provider": "openai", "name": "GPT-4o", "type": "text"},
            {"id": "gpt-4o-mini", "provider": "openai", "name": "GPT-4o Mini", "type": "text"},
            {"id": "claude-3.5-sonnet", "provider": "anthropic", "name": "Claude 3.5 Sonnet", "type": "text"},
            {"id": "gemini-pro", "provider": "google", "name": "Gemini Pro", "type": "text"},
        ],
        "image_models": [
            {"id": "dall-e-3", "provider": "openai", "name": "DALL-E 3", "type": "image"},
            {"id": "stable-diffusion-xl", "provider": "stability", "name": "Stable Diffusion XL", "type": "image"},
        ],
        "audio_models": [
            {"id": "eleven-labs-v2", "provider": "elevenlabs", "name": "ElevenLabs V2", "type": "audio"},
        ]
    }

@router.get("/history")
async def get_generation_history(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's generation history"""
    generations = db.query(AIGeneration).filter(
        AIGeneration.user_id == current_user.id
    ).order_by(AIGeneration.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": gen.id,
            "provider": gen.provider,
            "model": gen.model,
            "prompt": gen.prompt[:100] + "..." if len(gen.prompt) > 100 else gen.prompt,
            "content_type": gen.content_type,
            "tokens_used": gen.tokens_used,
            "cost": gen.cost,
            "created_at": gen.created_at,
            "user_rating": gen.user_rating
        }
        for gen in generations
    ]

@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's AI usage statistics"""
    return {
        "total_generations": current_user.total_generations,
        "tokens_used": current_user.tokens_used,
        "credits_remaining": current_user.credits_remaining,
        "favorite_models": current_user.preferred_models,
        "account_type": "premium" if current_user.is_premium else "free"
    }

@router.post("/feedback/{generation_id}")
async def submit_feedback(
    generation_id: int,
    rating: int,
    feedback: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit feedback for a generation"""
    generation = db.query(AIGeneration).filter(
        AIGeneration.id == generation_id,
        AIGeneration.user_id == current_user.id
    ).first()
    
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    generation.user_rating = rating
    generation.user_feedback = feedback
    db.commit()
    
    return {"success": True}

def calculate_cost(provider: str, model: str, tokens: int) -> float:
    """Calculate cost for AI generation"""
    cost_per_token = {
        "gpt-4o": 0.00003,
        "gpt-4o-mini": 0.000015,
        "claude-3.5-sonnet": 0.00003,
        "gemini-pro": 0.0000125,
    }
    
    return tokens * cost_per_token.get(model, 0.00002)

# Simplified endpoint for frontend compatibility
@router.post("/generate-simple")
async def generate_simple(request: SimpleGenerationRequest):
    """Simplified AI generation endpoint for frontend"""
    try:
        # Map frontend model names to backend providers
        model_mapping = {
            "chat": {"provider": "openai", "model": "gpt-4o-mini"},
            "image": {"provider": "openai", "model": "dall-e-3"},
            "video": {"provider": "openai", "model": "gpt-4o-mini"},  # Placeholder
            "code": {"provider": "openai", "model": "gpt-4o-mini"},
            "voice": {"provider": "openai", "model": "gpt-4o-mini"},  # Placeholder
            "analysis": {"provider": "openai", "model": "gpt-4o-mini"},
            "gpt-4o": {"provider": "openai", "model": "gpt-4o-mini"},
            "claude": {"provider": "anthropic", "model": "claude-3-haiku-20240307"}
        }
        
        config = model_mapping.get(request.model)
        if not config:
            config = {"provider": "openai", "model": "gpt-4o-mini"}
        
        # Generate content
        result = await ai_router.generate(
            provider=config["provider"],
            model=config["model"],
            prompt=request.prompt,
            parameters={
                "max_tokens": request.max_tokens,
                "temperature": request.temperature
            }
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Return simplified response
        content = result.get("content", {})
        if content.get("type") == "text":
            response_content = content.get("text", "")
        elif content.get("type") == "image":
            response_content = content.get("url", "")
        else:
            response_content = str(content)
        
        return {
            "success": True,
            "content": response_content,
            "response": response_content,  # Alternative key for frontend
            "model": request.model,
            "provider": config["provider"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))