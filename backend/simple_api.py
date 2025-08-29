from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import openai
import anthropic
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(title="NeuralForge API")

# Initialize AI clients
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# CORS settings
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
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

@app.get("/")
async def root():
    return {
        "message": "NeuralForge API is running!",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/ai/generate-simple")
async def generate_content(request: GenerateRequest):
    try:
        # Map model names to providers
        if request.model in ["chat", "gpt-4o", "gpt-4o-mini", "code", "analysis"]:
            # Use OpenAI
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": request.prompt}],
                max_tokens=request.max_tokens,
                temperature=request.temperature
            )
            content = response.choices[0].message.content
            
        elif request.model in ["claude", "anthropic"]:
            # Use Anthropic
            response = anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                messages=[{"role": "user", "content": request.prompt}]
            )
            content = response.content[0].text
            
        else:
            # Default to OpenAI
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": request.prompt}],
                max_tokens=request.max_tokens,
                temperature=request.temperature
            )
            content = response.choices[0].message.content

        return {
            "success": True,
            "content": content,
            "response": content,  # Alternative key for frontend compatibility
            "model": request.model,
            "provider": "openai" if request.model != "claude" else "anthropic"
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

# Alternative endpoint for frontend compatibility
@app.post("/api/generate")
async def generate_simple(request: GenerateRequest):
    return await generate_content(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)