from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class AIGeneration(Base):
    __tablename__ = "ai_generations"
    
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, default=lambda: str(uuid.uuid4()), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Generation details
    provider = Column(String, nullable=False)  # openai, anthropic, google
    model = Column(String, nullable=False)  # gpt-4o, claude-3.5, etc.
    content_type = Column(String, nullable=False)  # text, image, video, audio
    
    # Input/Output
    prompt = Column(Text, nullable=False)
    generated_content = Column(Text)
    media_url = Column(String)  # For images, videos, audio
    
    # Parameters used
    generation_parameters = Column(JSON)
    
    # Usage tracking
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    generation_time = Column(Float)  # in seconds
    
    # Status
    status = Column(String, default="pending")  # pending, completed, failed
    error_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="ai_generations")

class ModelUsageStats(Base):
    __tablename__ = "model_usage_stats"

    id = Column(Integer, primary_key=True, index=True)
    model = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    
    # Daily statistics
    date = Column(DateTime(timezone=True), nullable=False)
    total_requests = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    avg_response_time = Column(Float, default=0.0)
    
    # Quality metrics
    avg_user_rating = Column(Float, default=0.0)
    success_rate = Column(Float, default=100.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())