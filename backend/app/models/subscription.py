from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Stripe details
    stripe_subscription_id = Column(String, unique=True)
    stripe_customer_id = Column(String)
    stripe_price_id = Column(String)
    
    # Subscription details
    tier = Column(String, nullable=False)  # free, creator, enterprise
    status = Column(String, nullable=False)  # active, cancelled, past_due
    
    # Billing
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    cancel_at_period_end = Column(Boolean, default=False)
    
    # Usage limits
    monthly_ai_generations_limit = Column(Integer)
    monthly_tokens_limit = Column(Integer)
    custom_models_limit = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")