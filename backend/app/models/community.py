from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

class CommunityPost(Base):
    __tablename__ = "community_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, default=lambda: str(uuid.uuid4()), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Content details
    title = Column(String, nullable=False)
    description = Column(Text)
    content_type = Column(String, nullable=False)  # text, image, video, code, bot
    media_url = Column(String)  # URL to generated content
    thumbnail_url = Column(String)  # Thumbnail for videos/images
    
    # AI generation details
    ai_model_used = Column(String)  # gpt-4o, claude-3.5, etc.
    ai_provider = Column(String)  # openai, anthropic, etc.
    prompt_used = Column(Text)
    generation_parameters = Column(JSON)
    
    # Metadata
    tags = Column(JSON)  # Array of tags
    category = Column(String)  # art, code, writing, business, etc.
    is_public = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_nsfw = Column(Boolean, default=False)
    
    # Engagement stats
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    downloads_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="posts")
    likes = relationship("PostLike", back_populates="post")
    comments = relationship("PostComment", back_populates="post")

class PostLike(Base):
    __tablename__ = "post_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    post = relationship("CommunityPost", back_populates="likes")

class PostComment(Base):
    __tablename__ = "post_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    parent_comment_id = Column(Integer, ForeignKey("post_comments.id"))  # For replies
    
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    post = relationship("CommunityPost", back_populates="comments")
    parent = relationship("PostComment", remote_side=[id])