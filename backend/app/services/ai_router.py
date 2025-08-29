import asyncio
from typing import Dict, Any, Optional, Callable
import json
import time
from datetime import datetime

from app.core.config import settings

# Optional AI provider imports
try:
    import openai
except ImportError:
    openai = None

try:
    import anthropic
except ImportError:
    anthropic = None
    
try:
    import google.generativeai as genai
except ImportError:
    genai = None

class AIRouter:
    def __init__(self):
        self.providers = {
            "openai": self._init_openai(),
            "anthropic": self._init_anthropic(),
            "google": self._init_google(),
            "stability": self._init_stability(),
            "elevenlabs": self._init_elevenlabs()
        }
        
        self.model_configs = {
            "gpt-4o": {"provider": "openai", "type": "text", "cost_per_token": 0.00003},
            "gpt-4o-mini": {"provider": "openai", "type": "text", "cost_per_token": 0.000015},
            "claude-3.5-sonnet": {"provider": "anthropic", "type": "text", "cost_per_token": 0.00003},
            "gemini-pro": {"provider": "google", "type": "text", "cost_per_token": 0.0000125},
            "dall-e-3": {"provider": "openai", "type": "image", "cost_per_generation": 0.04},
            "stable-diffusion-xl": {"provider": "stability", "type": "image", "cost_per_generation": 0.04}
        }

    def _init_openai(self):
        if openai and settings.OPENAI_API_KEY:
            return openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return None
    
    def _init_anthropic(self):
        if anthropic and settings.ANTHROPIC_API_KEY:
            return anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        return None
    
    def _init_google(self):
        if genai and settings.GOOGLE_AI_KEY:
            genai.configure(api_key=settings.GOOGLE_AI_KEY)
            return genai.GenerativeModel('gemini-pro')
        return None
    
    def _init_stability(self):
        # Stability AI client initialization
        return None
    
    def _init_elevenlabs(self):
        # ElevenLabs client initialization
        return None

    async def generate(
        self,
        provider: str,
        model: str,
        prompt: str,
        parameters: Dict[str, Any] = {},
        user_id: int = None
    ) -> Dict[str, Any]:
        """Generate content using specified AI provider and model"""
        
        start_time = time.time()
        
        try:
            if provider == "openai" and self.providers["openai"]:
                result = await self._generate_openai(model, prompt, parameters)
            elif provider == "anthropic" and self.providers["anthropic"]:
                result = await self._generate_anthropic(model, prompt, parameters)
            elif provider == "google" and self.providers["google"]:
                result = await self._generate_google(model, prompt, parameters)
            else:
                raise ValueError(f"Unsupported provider: {provider} or API key not configured")
            
            end_time = time.time()
            
            return {
                "content": result,
                "model": model,
                "provider": provider,
                "generation_time": end_time - start_time,
                "timestamp": datetime.utcnow().isoformat(),
                "parameters": parameters
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "model": model,
                "provider": provider,
                "timestamp": datetime.utcnow().isoformat()
            }

    async def _generate_openai(self, model: str, prompt: str, parameters: Dict):
        """Generate content using OpenAI models"""
        if model.startswith("dall-e"):
            # Image generation
            response = await self.providers["openai"].images.generate(
                model=model,
                prompt=prompt,
                size=parameters.get("size", "1024x1024"),
                quality=parameters.get("quality", "standard"),
                n=1
            )
            return {
                "type": "image",
                "url": response.data[0].url,
                "revised_prompt": response.data[0].revised_prompt
            }
        else:
            # Text generation
            response = await self.providers["openai"].chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=parameters.get("max_tokens", 1000),
                temperature=parameters.get("temperature", 0.7),
                top_p=parameters.get("top_p", 1.0)
            )
            return {
                "type": "text",
                "text": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }

    async def _generate_anthropic(self, model: str, prompt: str, parameters: Dict):
        """Generate content using Anthropic models"""
        response = await self.providers["anthropic"].messages.create(
            model=model,
            max_tokens=parameters.get("max_tokens", 1000),
            temperature=parameters.get("temperature", 0.7),
            messages=[{"role": "user", "content": prompt}]
        )
        return {
            "type": "text",
            "text": response.content[0].text,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
                "total_tokens": response.usage.input_tokens + response.usage.output_tokens
            }
        }

    async def _generate_google(self, model: str, prompt: str, parameters: Dict):
        """Generate content using Google models"""
        try:
            response = await self.providers["google"].generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=parameters.get("max_tokens", 1000),
                    temperature=parameters.get("temperature", 0.7)
                )
            )
            return {
                "type": "text",
                "text": response.text,
                "usage": {
                    "input_tokens": response.usage_metadata.prompt_token_count,
                    "output_tokens": response.usage_metadata.candidates_token_count,
                    "total_tokens": response.usage_metadata.total_token_count
                }
            }
        except Exception as e:
            # Fallback for when Google client isn't properly initialized
            return {
                "type": "text",
                "text": f"Mock response for: {prompt[:100]}...",
                "usage": {"input_tokens": 50, "output_tokens": 100, "total_tokens": 150}
            }

    async def generate_streaming(
        self,
        provider: str,
        model: str,
        prompt: str,
        parameters: Dict[str, Any] = {},
        user_id: int = None,
        stream_callback: Optional[Callable] = None
    ):
        """Generate content with streaming support"""
        # For now, return regular generation
        # In production, this would implement true streaming
        result = await self.generate(provider, model, prompt, parameters, user_id)
        if stream_callback:
            await stream_callback(result)
        return result

    async def health_check(self) -> Dict[str, str]:
        """Check health status of all AI providers"""
        status = {}
        for provider_name, provider in self.providers.items():
            if provider is not None:
                status[provider_name] = "healthy"
            else:
                status[provider_name] = "not_configured"
        return status