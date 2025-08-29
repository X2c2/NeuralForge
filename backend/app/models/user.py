from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, default=lambda: str(uuid.uuid4()), unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    avatar_url = Column(String)
    bio = Column(Text)
    
    # Authentication
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Subscription
    subscription_tier = Column(String, default="free")  # free, creator, enterprise
    subscription_status = Column(String, default="active")
    stripe_customer_id = Column(String)
    
    # Usage tracking
    total_ai_generations = Column(Integer, default=0)
    monthly_ai_generations = Column(Integer, default=0)
    total_tokens_used = Column(Integer, default=0)
    monthly_tokens_used = Column(Integer, default=0)
    
    # Social stats
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    likes_received = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    posts = relationship("CommunityPost", back_populates="user")
    ai_generations = relationship("AIGeneration", back_populates="user")
    models = relationship("CustomModel", back_populates="owner")
    subscriptions = relationship("Subscription", back_populates="user")