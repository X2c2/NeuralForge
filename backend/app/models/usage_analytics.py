from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class UsageAnalytics(Base):
    __tablename__ = "usage_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Usage details
    date = Column(DateTime(timezone=True), nullable=False)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    
    # Metrics
    generations_count = Column(Integer, default=1)
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    average_generation_time = Column(Float, default=0.0)
    
    # Relationships
    user = relationship("User")