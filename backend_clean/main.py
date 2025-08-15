from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(title="NeuralForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://neural-forge-eight.vercel.app",
        "https://neuralforge.to",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    model: str = "gpt-4o-mini"

@app.get("/")
async def root():
    return {"message": "NeuralForge API is running!", "status": "healthy"}

@app.post("/api/generate")
async def generate_content(request: GenerateRequest):
    # Mock response for now - we'll add real AI later
    return {
        "success": True,
        "content": f"Mock AI response for: {request.prompt}",
        "model": request.model
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)