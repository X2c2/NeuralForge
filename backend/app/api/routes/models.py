from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, List
from app.db.database import get_db
from app.models.ai_generation import ModelUsageStats

router = APIRouter()

@router.get("/available")
async def get_available_models():
    """Get all available AI models with their capabilities"""
    return {
        "text_generation": [
            {
                "id": "gpt-4o",
                "provider": "openai",
                "name": "GPT-4o",
                "description": "Most capable OpenAI model for complex tasks",
                "max_tokens": 4096,
                "cost_per_1k_tokens": 0.03,
                "features": ["text", "reasoning", "code"],
                "speed": "fast"
            },
            {
                "id": "gpt-4o-mini",
                "provider": "openai", 
                "name": "GPT-4o Mini",
                "description": "Faster, more affordable version of GPT-4o",
                "max_tokens": 4096,
                "cost_per_1k_tokens": 0.015,
                "features": ["text", "reasoning", "code"],
                "speed": "very_fast"
            },
            {
                "id": "claude-3.5-sonnet",
                "provider": "anthropic",
                "name": "Claude 3.5 Sonnet",
                "description": "Anthropic's most capable model for complex tasks",
                "max_tokens": 4096,
                "cost_per_1k_tokens": 0.03,
                "features": ["text", "reasoning", "analysis", "code"],
                "speed": "fast"
            },
            {
                "id": "gemini-pro",
                "provider": "google",
                "name": "Gemini Pro",
                "description": "Google's advanced multimodal AI model",
                "max_tokens": 2048,
                "cost_per_1k_tokens": 0.0125,
                "features": ["text", "vision", "reasoning"],
                "speed": "fast"
            }
        ],
        "image_generation": [
            {
                "id": "dall-e-3",
                "provider": "openai",
                "name": "DALL-E 3",
                "description": "OpenAI's most advanced image generation model",
                "max_resolution": "1024x1024",
                "cost_per_image": 0.04,
                "features": ["high_quality", "prompt_following", "style_variety"],
                "speed": "medium"
            },
            {
                "id": "stable-diffusion-xl",
                "provider": "stability",
                "name": "Stable Diffusion XL",
                "description": "High-quality open-source image generation",
                "max_resolution": "1024x1024",
                "cost_per_image": 0.04,
                "features": ["high_quality", "style_control", "fine_tuning"],
                "speed": "fast"
            }
        ],
        "audio_generation": [
            {
                "id": "eleven-labs-v2",
                "provider": "elevenlabs",
                "name": "ElevenLabs Voice AI",
                "description": "Ultra-realistic voice synthesis",
                "max_characters": 5000,
                "cost_per_1k_chars": 0.30,
                "features": ["voice_cloning", "emotions", "multiple_languages"],
                "speed": "fast"
            }
        ]
    }

@router.get("/popular")
async def get_popular_models(
    timeframe: str = "7d",
    db: Session = Depends(get_db)
):
    """Get most popular models based on usage"""
    # This would typically aggregate from ModelUsageStats
    # For now, return static popular models
    return {
        "most_used": [
            {
                "model": "gpt-4o-mini",
                "provider": "openai",
                "usage_count": 15420,
                "avg_rating": 4.8,
                "trend": "up"
            },
            {
                "model": "claude-3.5-sonnet", 
                "provider": "anthropic",
                "usage_count": 12890,
                "avg_rating": 4.9,
                "trend": "up"
            },
            {
                "model": "dall-e-3",
                "provider": "openai",
                "usage_count": 8340,
                "avg_rating": 4.7,
                "trend": "stable"
            }
        ],
        "trending": [
            {
                "model": "gemini-pro",
                "provider": "google",
                "growth_rate": 45.2,
                "recent_usage": 3420
            }
        ]
    }

@router.get("/comparison")
async def compare_models(
    models: str,  # Comma-separated model IDs
    metric: str = "performance"
):
    """Compare different AI models"""
    model_list = models.split(",")
    
    # This would typically pull real comparison data
    # For now, return mock comparison data
    comparisons = {}
    for model in model_list:
        comparisons[model] = {
            "speed": {"score": 8.5, "rating": "fast"},
            "quality": {"score": 9.2, "rating": "excellent"},
            "cost": {"score": 7.8, "rating": "moderate"},
            "accuracy": {"score": 9.0, "rating": "high"},
            "user_satisfaction": {"score": 4.7, "max": 5.0}
        }
    
    return {
        "comparison": comparisons,
        "recommendation": model_list[0],  # Would be based on real analysis
        "best_for": {
            "speed": "gpt-4o-mini",
            "quality": "claude-3.5-sonnet", 
            "cost": "gemini-pro",
            "overall": "gpt-4o"
        }
    }

@router.get("/benchmarks")
async def get_model_benchmarks():
    """Get model performance benchmarks"""
    return {
        "text_models": {
            "gpt-4o": {
                "mmlu": 86.4,
                "hellaswag": 95.3,
                "arc": 96.3,
                "truthfulqa": 59.0,
                "avg_response_time": 2.1
            },
            "claude-3.5-sonnet": {
                "mmlu": 88.7,
                "hellaswag": 95.4,
                "arc": 96.4,
                "truthfulqa": 71.6,
                "avg_response_time": 2.3
            },
            "gemini-pro": {
                "mmlu": 83.7,
                "hellaswag": 87.8,
                "arc": 87.2,
                "truthfulqa": 51.8,
                "avg_response_time": 1.8
            }
        },
        "image_models": {
            "dall-e-3": {
                "aesthetic_score": 7.8,
                "prompt_following": 8.9,
                "photorealism": 8.2,
                "avg_generation_time": 12.5
            },
            "stable-diffusion-xl": {
                "aesthetic_score": 7.6,
                "prompt_following": 8.1,
                "photorealism": 7.9,
                "avg_generation_time": 8.2
            }
        }
    }

@router.get("/recommendations")
async def get_model_recommendations(
    use_case: str,
    budget: str = "medium",
    speed_priority: bool = False
):
    """Get AI model recommendations based on use case"""
    recommendations = {
        "creative_writing": {
            "primary": "claude-3.5-sonnet",
            "alternative": "gpt-4o",
            "budget": "gpt-4o-mini",
            "reason": "Excellent at creative tasks and storytelling"
        },
        "code_generation": {
            "primary": "gpt-4o",
            "alternative": "claude-3.5-sonnet", 
            "budget": "gpt-4o-mini",
            "reason": "Strong programming capabilities and debugging"
        },
        "image_creation": {
            "primary": "dall-e-3",
            "alternative": "stable-diffusion-xl",
            "budget": "stable-diffusion-xl",
            "reason": "High-quality image generation with good prompt following"
        },
        "data_analysis": {
            "primary": "claude-3.5-sonnet",
            "alternative": "gpt-4o",
            "budget": "gemini-pro",
            "reason": "Excellent analytical and reasoning capabilities"
        }
    }
    
    if use_case in recommendations:
        rec = recommendations[use_case]
        if budget == "low":
            suggested = rec["budget"]
        elif speed_priority:
            suggested = rec["alternative"] if "mini" in rec["alternative"] else rec["budget"]
        else:
            suggested = rec["primary"]
            
        return {
            "recommended_model": suggested,
            "reason": rec["reason"],
            "alternatives": [rec["primary"], rec["alternative"], rec["budget"]],
            "use_case": use_case
        }
    
    return {
        "error": "Use case not recognized",
        "available_cases": list(recommendations.keys())
    }