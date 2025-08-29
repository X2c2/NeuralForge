from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
from typing import Dict, List, Optional
import json
import logging
from datetime import datetime

from app.core.config import settings
from app.core.security import get_current_user
from app.api.routes import auth, ai_generation, community, models, analytics
from app.db.database import engine, Base, get_db
from app.services.ai_router import AIRouter
from app.services.community_hub import CommunityHub
from app.models.user import User

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="NeuralForge API",
    description="The Ultimate AI Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Static files for uploaded content
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize services
ai_router = AIRouter()
community_hub = CommunityHub()

# WebSocket connection manager for real-time features
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
        self.community_connections: List[WebSocket] = []

    async def connect_user(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    async def connect_community(self, websocket: WebSocket):
        await websocket.accept()
        self.community_connections.append(websocket)

    def disconnect_user(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    def disconnect_community(self, websocket: WebSocket):
        if websocket in self.community_connections:
            self.community_connections.remove(websocket)

    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))

    async def broadcast_to_community(self, message: dict):
        disconnected = []
        for connection in self.community_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect_community(conn)

manager = ConnectionManager()

# Include API routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(ai_generation.router, prefix="/api/v1/ai", tags=["ai-generation"])
app.include_router(ai_generation.router, prefix="/api/ai", tags=["ai-simple"])  # Frontend compatibility
app.include_router(community.router, prefix="/api/v1/community", tags=["community"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to NeuralForge API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "services": {
            "database": "connected",
            "redis": "connected",
            "ai_providers": await ai_router.health_check()
        }
    }

# WebSocket endpoint for real-time AI generation
@app.websocket("/ws/ai/{user_id}")
async def websocket_ai_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect_user(websocket, user_id)
    try:
        while True:
            # Receive AI generation request via WebSocket
            data = await websocket.receive_text()
            request_data = json.loads(data)
            
            # Process AI request
            result = await ai_router.generate_streaming(
                provider=request_data.get("provider"),
                prompt=request_data.get("prompt"),
                user_id=user_id,
                stream_callback=lambda chunk: manager.send_to_user(
                    user_id, 
                    {"type": "ai_chunk", "data": chunk}
                )
            )
            
            # Send final result
            await manager.send_to_user(user_id, {
                "type": "ai_complete",
                "data": result
            })
            
    except WebSocketDisconnect:
        manager.disconnect_user(user_id)

# WebSocket endpoint for community real-time updates
@app.websocket("/ws/community")
async def websocket_community_endpoint(websocket: WebSocket):
    await manager.connect_community(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_community(websocket)

# Community quick share endpoint
@app.post("/api/v1/community/quick-share")
async def quick_share(
    share_data: dict,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        # Process quick share
        post = await community_hub.create_quick_share(
            user_id=current_user.id,
            content=share_data,
            db=db
        )
        
        # Broadcast to community in real-time
        await manager.broadcast_to_community({
            "type": "new_share",
            "data": post
        })
        
        return {"success": True, "post": post}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Multi-model AI generation endpoint
@app.post("/api/v1/ai/generate")
async def generate_ai_content(
    request: dict,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        # Check user credits/limits
        if not await check_user_limits(current_user.id, request.get("provider")):
            raise HTTPException(status_code=429, detail="Usage limit exceeded")
        
        # Generate content using AI router
        result = await ai_router.generate(
            provider=request.get("provider"),
            model=request.get("model"),
            prompt=request.get("prompt"),
            parameters=request.get("parameters", {}),
            user_id=current_user.id
        )
        
        # Log usage for analytics
        await log_ai_usage(current_user.id, request.get("provider"), result)
        
        return {"success": True, "result": result}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def check_user_limits(user_id: int, provider: str) -> bool:
    # Implementation for checking subscription limits
    # This will integrate with your billing system
    return True  # Placeholder

async def log_ai_usage(user_id: int, provider: str, result: dict):
    # Implementation for usage analytics
    # Track tokens, cost, performance metrics
    pass

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )