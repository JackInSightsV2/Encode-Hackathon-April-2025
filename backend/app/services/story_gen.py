from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

# Initialize FastAPI and OpenAI
app = FastAPI()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Security schemes
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StoryRequest(BaseModel):
    prompt: str
    wallet_address: str

async def verify_api_key(api_key: str = Depends(api_key_header)):
    """Verify the API key from the backend"""
    if not api_key or api_key != os.getenv('APP_API_KEY', 'default_key'):
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    return api_key

async def verify_wallet(wallet_address: str) -> bool:
    """Verify the wallet address from the backend"""
    # TODO: Replace with your actual wallet verification logic
    if not wallet_address or len(wallet_address) < 42:  # Basic Ethereum address check
        return False
    return True

@app.post("/generate")
async def generate_story(
    request: StoryRequest,
    api_key: str = Depends(verify_api_key)
):
    # Verify wallet
    if not await verify_wallet(request.wallet_address):
        raise HTTPException(
            status_code=403,
            detail="Invalid wallet address or insufficient permissions"
        )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": request.prompt}
            ]
        )
        return {
            "story": response.choices[0].message.content,
            "wallet_address": request.wallet_address
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check(api_key: str = Depends(verify_api_key)):
    return {
        "status": "healthy",
        "message": "API is running and API key is valid"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
