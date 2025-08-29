from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.ai_generation import AIGeneration, ModelUsageStats

router = APIRouter()

@router.get("/usage/personal")
async def get_personal_usage(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personal usage analytics"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get generations in time period
    generations = db.query(AIGeneration).filter(
        AIGeneration.user_id == current_user.id,
        AIGeneration.created_at >= start_date
    ).all()
    
    # Calculate metrics
    total_generations = len(generations)
    total_tokens = sum(g.tokens_used for g in generations)
    total_cost = sum(g.cost for g in generations)
    
    # Group by provider
    provider_stats = {}
    model_stats = {}
    daily_usage = {}
    
    for gen in generations:
        # Provider stats
        if gen.provider not in provider_stats:
            provider_stats[gen.provider] = {"count": 0, "tokens": 0, "cost": 0}
        provider_stats[gen.provider]["count"] += 1
        provider_stats[gen.provider]["tokens"] += gen.tokens_used
        provider_stats[gen.provider]["cost"] += gen.cost
        
        # Model stats
        if gen.model not in model_stats:
            model_stats[gen.model] = {"count": 0, "tokens": 0, "cost": 0}
        model_stats[gen.model]["count"] += 1
        model_stats[gen.model]["tokens"] += gen.tokens_used
        model_stats[gen.model]["cost"] += gen.cost
        
        # Daily usage
        day = gen.created_at.date().isoformat()
        if day not in daily_usage:
            daily_usage[day] = {"count": 0, "tokens": 0, "cost": 0}
        daily_usage[day]["count"] += 1
        daily_usage[day]["tokens"] += gen.tokens_used
        daily_usage[day]["cost"] += gen.cost
    
    return {
        "overview": {
            "total_generations": total_generations,
            "total_tokens": total_tokens,
            "total_cost": round(total_cost, 4),
            "avg_tokens_per_generation": round(total_tokens / max(total_generations, 1), 2),
            "credits_remaining": current_user.credits_remaining
        },
        "by_provider": provider_stats,
        "by_model": model_stats,
        "daily_usage": daily_usage,
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days": days
        }
    }

@router.get("/usage/trends")
async def get_usage_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get usage trends and predictions"""
    
    # Get last 7 days of usage
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    daily_generations = db.query(
        func.date(AIGeneration.created_at).label('date'),
        func.count(AIGeneration.id).label('count'),
        func.sum(AIGeneration.tokens_used).label('tokens'),
        func.sum(AIGeneration.cost).label('cost')
    ).filter(
        AIGeneration.user_id == current_user.id,
        AIGeneration.created_at >= start_date
    ).group_by(
        func.date(AIGeneration.created_at)
    ).all()
    
    # Calculate growth rates
    if len(daily_generations) >= 2:
        recent_avg = sum(d.count for d in daily_generations[-3:]) / 3
        older_avg = sum(d.count for d in daily_generations[:3]) / 3
        growth_rate = ((recent_avg - older_avg) / max(older_avg, 1)) * 100
    else:
        growth_rate = 0
    
    return {
        "daily_trends": [
            {
                "date": d.date.isoformat(),
                "generations": d.count,
                "tokens": d.tokens or 0,
                "cost": float(d.cost or 0)
            }
            for d in daily_generations
        ],
        "growth_rate": round(growth_rate, 2),
        "insights": {
            "most_active_day": max(daily_generations, key=lambda x: x.count).date.isoformat() if daily_generations else None,
            "avg_daily_generations": round(sum(d.count for d in daily_generations) / max(len(daily_generations), 1), 2),
            "peak_usage_period": "afternoon"  # This would be calculated from hourly data
        }
    }

@router.get("/models/performance")
async def get_model_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get model performance analytics for user"""
    
    # Get user's generations with ratings
    generations_with_ratings = db.query(AIGeneration).filter(
        AIGeneration.user_id == current_user.id,
        AIGeneration.user_rating.isnot(None)
    ).all()
    
    model_performance = {}
    for gen in generations_with_ratings:
        if gen.model not in model_performance:
            model_performance[gen.model] = {
                "ratings": [],
                "generation_times": [],
                "usage_count": 0,
                "provider": gen.provider
            }
        
        model_performance[gen.model]["ratings"].append(gen.user_rating)
        model_performance[gen.model]["generation_times"].append(gen.generation_time)
        model_performance[gen.model]["usage_count"] += 1
    
    # Calculate averages
    for model, data in model_performance.items():
        data["avg_rating"] = round(sum(data["ratings"]) / len(data["ratings"]), 2)
        data["avg_generation_time"] = round(sum(data["generation_times"]) / len(data["generation_times"]), 2)
        del data["ratings"]  # Remove raw data
        del data["generation_times"]
    
    return {
        "model_performance": model_performance,
        "recommendations": {
            "highest_rated": max(model_performance.items(), key=lambda x: x[1]["avg_rating"])[0] if model_performance else None,
            "fastest": min(model_performance.items(), key=lambda x: x[1]["avg_generation_time"])[0] if model_performance else None,
            "most_used": max(model_performance.items(), key=lambda x: x[1]["usage_count"])[0] if model_performance else None
        }
    }

@router.get("/costs/breakdown")
async def get_cost_breakdown(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed cost breakdown"""
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    generations = db.query(AIGeneration).filter(
        AIGeneration.user_id == current_user.id,
        AIGeneration.created_at >= start_date
    ).all()
    
    # Calculate cost breakdown
    total_cost = sum(g.cost for g in generations)
    provider_costs = {}
    content_type_costs = {}
    
    for gen in generations:
        # Provider costs
        if gen.provider not in provider_costs:
            provider_costs[gen.provider] = 0
        provider_costs[gen.provider] += gen.cost
        
        # Content type costs
        content_type = gen.content_type or "text"
        if content_type not in content_type_costs:
            content_type_costs[content_type] = 0
        content_type_costs[content_type] += gen.cost
    
    # Calculate projected monthly cost
    if days > 0:
        daily_avg_cost = total_cost / days
        projected_monthly = daily_avg_cost * 30
    else:
        projected_monthly = 0
    
    return {
        "period_cost": round(total_cost, 4),
        "projected_monthly": round(projected_monthly, 4),
        "by_provider": {k: round(v, 4) for k, v in provider_costs.items()},
        "by_content_type": {k: round(v, 4) for k, v in content_type_costs.items()},
        "cost_per_generation": round(total_cost / max(len(generations), 1), 4),
        "savings_opportunities": {
            "switch_to_cheaper_models": projected_monthly * 0.3,  # Potential 30% savings
            "batch_requests": projected_monthly * 0.1  # Potential 10% savings
        }
    }

@router.get("/leaderboard")
async def get_community_leaderboard(
    metric: str = "generations",
    timeframe: str = "week",
    db: Session = Depends(get_db)
):
    """Get community leaderboard (anonymized)"""
    
    # Calculate timeframe
    if timeframe == "week":
        start_date = datetime.utcnow() - timedelta(days=7)
    elif timeframe == "month":
        start_date = datetime.utcnow() - timedelta(days=30)
    else:
        start_date = datetime.utcnow() - timedelta(days=1)
    
    # Get top users by metric
    if metric == "generations":
        query = db.query(
            User.username,
            func.count(AIGeneration.id).label('count')
        ).join(AIGeneration).filter(
            AIGeneration.created_at >= start_date
        ).group_by(User.id, User.username).order_by(desc('count')).limit(10)
    else:
        query = db.query(
            User.username,
            func.sum(AIGeneration.tokens_used).label('count')
        ).join(AIGeneration).filter(
            AIGeneration.created_at >= start_date
        ).group_by(User.id, User.username).order_by(desc('count')).limit(10)
    
    results = query.all()
    
    return {
        "leaderboard": [
            {
                "rank": i + 1,
                "username": result.username[:3] + "***",  # Anonymize
                "value": int(result.count),
                "metric": metric
            }
            for i, result in enumerate(results)
        ],
        "timeframe": timeframe,
        "metric": metric
    }