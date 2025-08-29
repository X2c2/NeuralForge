from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class CustomModel(Base):
    __tablename__ = "custom_models"
    
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, default=lambda: str(uuid.uuid4()), unique=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Model details
    name = Column(String, nullable=False)
    description = Column(Text)
    model_type = Column(String, nullable=False)  # text, image, code, etc.
    base_model = Column(String)  # What model this was fine-tuned from
    
    # Model files
    model_file_url = Column(String)
    config_file_url = Column(String)
    tokenizer_url = Column(String)
    
    # Training details
    training_data_size = Column(Integer)
    training_time = Column(Float)
    training_cost = Column(Float)
    performance_metrics = Column(JSON)
    
    # Marketplace
    is_public = Column(Boolean, default=False)
    is_for_sale = Column(Boolean, default=False)
    price = Column(Float, default=0.0)
    license_type = Column(String, default="private")  # private, open_source, commercial
    
    # Stats
    downloads_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    usage_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="models")