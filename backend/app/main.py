from fastapi import FastAPI, HTTPException, Header, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import sqlite3
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Import models
from app.models.models import (
    Article, SummarizeRequest, SummarizeResponse,
    TranslationRequest, TranslationResponse, TransactionHistory, StoryGenRequest
)

# Import services
from app.services import (
    SolanaService, DatabaseService, SessionManager, APIRouter
)
from app.services.api_key_manager import APIKeyManager

# Import external APIs
from app.external_apis import NewsSummarizerAPI
from app.external_apis.translator import TranslatorAPI
from app.external_apis.story_gen import StoryGenAPI

# Import dummy data
from app.data.dummy_data import DUMMY_ARTICLES

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Agent Backend",
    description="Backend service for AI agents with Solana payment verification",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
api_router = APIRouter()
session_manager = SessionManager()
solana_service = SolanaService()
api_key_manager = APIKeyManager()

# Test endpoints
@app.get("/test/articles", response_model=list[Article])
async def get_test_articles():
    return DUMMY_ARTICLES

@app.get("/test/article/{article_id}", response_model=Article)
async def get_test_article(article_id: int):
    article = next((a for a in DUMMY_ARTICLES if a["id"] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@app.post("/test/summarize", response_model=SummarizeResponse)
async def test_summarize(article_id: int):
    article = next((a for a in DUMMY_ARTICLES if a["id"] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    try:
        result = await NewsSummarizerAPI().summarize(
            article_url=article["url"],
            article_text=article["content"]
        )
        return SummarizeResponse(
            **result,
            status="success",
            tx_verified=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/test/story_gen")
async def test_story_gen(request: dict):
    try:
        result = await StoryGenAPI().call(prompt=request.get("prompt"))
        return {
            **result,
            "status": "success",
            "tx_verified": True    
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Main endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/session/create")
async def create_session(
    wallet_address: str = Header(..., alias="WalletAddress")
):
    """
    Create a new session for a wallet address (login)
    The wallet address should be provided in the WalletAddress header
    """
    try:
        # Validate Solana address
        if not solana_service.is_valid_solana_address(wallet_address):
            raise HTTPException(
                status_code=400,
                detail="Invalid Solana wallet address"
            )

        session_id = session_manager.create_session(wallet_address)
        return {
            "session_id": session_id,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/session/validate")
async def validate_session(
    session_id: str = Header(..., alias="Session-ID")
):
    """
    Validate an existing session (check if user is logged in)
    The session ID should be provided in the Session-ID header
    """
    try:
        wallet_address = session_manager.get_wallet_from_session(session_id)
        if not wallet_address:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired session"
            )
        return {
            "is_valid": True,
            "wallet_address": wallet_address,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/{api_name}")
async def route_api_request(
    api_name: str,
    request: dict = Body(default={}),
    session_id: str = Header(..., alias="Session-ID"),
    key_name: str = Header(None, alias="Key-Name")
):
    """
    Route API requests based on the API name and verify wallet balance and permissions
    
    - **api_name**: Name of the API to call
    - **request**: Request parameters for the API (optional)
    - **session_id**: Your session ID from the login (header)
    - **key_name**: Name for the API key (header, required for create_key)
    """
    try:
        # Get wallet from session
        wallet_address = session_manager.get_wallet_from_session(session_id)
        if not wallet_address:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired session"
            )

        # Handle create_key request
        if api_name == "create_key":
            if not key_name:
                raise HTTPException(status_code=400, detail="Key name is required in Key-Name header")
            return api_key_manager.create_api_key(wallet_address, key_name)

        # Route other requests
        result = await api_router.route_request(
            wallet_address=wallet_address,
            api_name=api_name,
            **request
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/prices/{api_name}")
async def get_api_price(api_name: str):
    """
    Get the price for a specific API
    """
    price = api_router.get_api_price(api_name)
    if price is None:
        raise HTTPException(status_code=404, detail=f"API {api_name} not found")
    
    return {
        "api_name": api_name,
        "price": price,
        "price_in_sol": price / 1_000_000_000  # Convert lamports to SOL
    }

@app.get("/api/transactions/{wallet_address}", response_model=list[TransactionHistory])
async def get_transaction_history(wallet_address: str):
    conn = sqlite3.connect(DatabaseService().db_path)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM transactions 
        WHERE wallet_address = ? 
        ORDER BY created_at DESC
    ''', (wallet_address,))

    transactions = []
    for row in cursor.fetchall():
        transactions.append({
            "id": row[0],
            "tx_signature": row[1],
            "wallet_address": row[2],
            "agent_id": row[3],
            "amount": row[4],
            "status": row[5],
            "created_at": row[6],
            "processed_at": row[7]
        })

    conn.close()
    return transactions

@app.post("/api/create_key", tags=["API Keys"])
async def create_api_key(
    key_name: str = Header(..., alias="Key-Name"),
    session_id: str = Header(..., alias="Session-ID")
):
    """
    Create a new API key
    
    Parameters:
    - Key-Name (header): Name for the API key
    - Session-ID (header): Your session ID
    
    Returns:
    - The created API key details
    """
    try:
        # Get wallet from session
        wallet_address = session_manager.get_wallet_from_session(session_id)
        if not wallet_address:
            raise HTTPException(status_code=401, detail="Invalid session")

        # Create the key
        api_key_data = api_key_manager.create_api_key(wallet_address, key_name)
        return api_key_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/keys")
async def get_api_keys(
    session_id: str = Header(..., alias="Session-ID")
):
    """
    Get all API keys for the authenticated wallet
    - Session-ID: Your session ID (header)
    """
    try:
        # Get wallet from session
        wallet_address = session_manager.get_wallet_from_session(session_id)
        if not wallet_address:
            raise HTTPException(status_code=401, detail="Invalid session")

        # Get all API keys
        api_keys = api_key_manager.get_api_keys(wallet_address)
        return {
            "wallet_address": wallet_address,
            "api_keys": api_keys,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/keys/{key_name}")
async def delete_api_key(
    key_name: str,
    session_id: str = Header(..., alias="Session-ID")
):
    """
    Delete an API key by name
    
    Parameters:
    - key_name: Name of the API key to delete (path parameter)
    - Session-ID (header): Your session ID
    
    Returns:
    - Success message
    """
    try:
        # Get wallet from session
        wallet_address = session_manager.get_wallet_from_session(session_id)
        if not wallet_address:
            raise HTTPException(status_code=401, detail="Invalid session")

        # Delete the key
        success = api_key_manager.delete_api_key(wallet_address, key_name)
        if not success:
            raise HTTPException(status_code=404, detail="API key not found")

        return {
            "message": "API key deleted successfully",
            "key_name": key_name
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 