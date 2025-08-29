from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.community import CommunityPost, Comment, Like
from app.services.community_hub import CommunityHub

router = APIRouter()
community_hub = CommunityHub()

class PostCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: str
    media_url: Optional[str] = None
    ai_model_used: Optional[str] = None
    prompt_used: Optional[str] = None
    tags: Optional[List[str]] = []
    is_public: bool = True

class PostResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    content_type: str
    media_url: Optional[str]
    ai_model_used: Optional[str]
    tags: List[str]
    likes_count: int
    views_count: int
    shares_count: int
    created_at: str
    user: dict

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None

@router.post("/posts", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new community post"""
    try:
        post_data = await community_hub.create_quick_share(
            user_id=current_user.id,
            content=post.dict(),
            db=db
        )
        return post_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/feed")
async def get_community_feed(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized community feed"""
    posts = db.query(CommunityPost).filter(
        CommunityPost.is_public == True
    ).order_by(CommunityPost.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": post.id,
            "title": post.title,
            "description": post.description,
            "content_type": post.content_type,
            "media_url": post.media_url,
            "ai_model_used": post.ai_model_used,
            "tags": post.tags,
            "likes_count": post.likes_count,
            "views_count": post.views_count,
            "shares_count": post.shares_count,
            "created_at": post.created_at.isoformat(),
            "user": {
                "id": post.user.id,
                "username": post.user.username,
                "avatar_url": post.user.avatar_url
            }
        }
        for post in posts
    ]

@router.get("/trending")
async def get_trending_posts(
    timeframe: str = "24h",
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get trending posts"""
    # Simple trending algorithm based on likes and recency
    posts = db.query(CommunityPost).filter(
        CommunityPost.is_public == True
    ).order_by(
        CommunityPost.likes_count.desc(),
        CommunityPost.created_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": post.id,
            "title": post.title,
            "content_type": post.content_type,
            "media_url": post.media_url,
            "likes_count": post.likes_count,
            "views_count": post.views_count,
            "user": {
                "username": post.user.username,
                "avatar_url": post.user.avatar_url
            }
        }
        for post in posts
    ]

@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like or unlike a post"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already liked this post
    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike the post
        db.delete(existing_like)
        post.likes_count -= 1
        liked = False
    else:
        # Like the post
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count += 1
        liked = True
    
    db.commit()
    return {"liked": liked, "likes_count": post.likes_count}

@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a post"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment.content,
        parent_id=comment.parent_id
    )
    db.add(new_comment)
    post.comments_count += 1
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "created_at": new_comment.created_at.isoformat(),
        "user": {
            "username": current_user.username,
            "avatar_url": current_user.avatar_url
        }
    }

@router.get("/posts/{post_id}/comments")
async def get_post_comments(
    post_id: str,
    db: Session = Depends(get_db)
):
    """Get comments for a post"""
    comments = db.query(Comment).filter(
        Comment.post_id == post_id
    ).order_by(Comment.created_at.asc()).all()
    
    return [
        {
            "id": comment.id,
            "content": comment.content,
            "parent_id": comment.parent_id,
            "created_at": comment.created_at.isoformat(),
            "user": {
                "username": comment.user.username,
                "avatar_url": comment.user.avatar_url
            }
        }
        for comment in comments
    ]

@router.get("/search")
async def search_posts(
    q: str,
    content_type: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search community posts"""
    query = db.query(CommunityPost).filter(
        CommunityPost.is_public == True
    )
    
    # Add search filters
    if q:
        query = query.filter(
            CommunityPost.title.contains(q) | 
            CommunityPost.description.contains(q)
        )
    
    if content_type:
        query = query.filter(CommunityPost.content_type == content_type)
    
    posts = query.order_by(CommunityPost.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": post.id,
            "title": post.title,
            "description": post.description,
            "content_type": post.content_type,
            "media_url": post.media_url,
            "user": {
                "username": post.user.username,
                "avatar_url": post.user.avatar_url
            }
        }
        for post in posts
    ]