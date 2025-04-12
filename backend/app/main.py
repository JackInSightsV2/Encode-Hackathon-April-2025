from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import sqlite3

# Import models
from app.models.models import (
    Article, TransactionHistory
)

# Import services
from app.services import (
    SolanaService, DatabaseService, SessionManager, APIRouter
)

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

# Main endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/{api_name}")
async def route_api_request(
    api_name: str,
    request: dict,
    wallet_address: str = Header(..., alias="WalletAddress")
):
    """
    Route API requests based on the API name and verify wallet balance
    """
    try:
        # Validate wallet address
        if not api_router.solana_service.is_valid_solana_address(wallet_address):
            raise HTTPException(
                status_code=400,
                detail="Invalid Solana wallet address"
            )

        # Route the request
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

@app.post("/api/session/create")
async def create_session(wallet_address: str = Header(..., alias="WalletAddress")):
    """
    Create a new session for a wallet address
    The wallet address should be provided in the WalletAddress header
    """
    try:
        # Validate Solana address
        if not SolanaService().is_valid_solana_address(wallet_address):
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
    session_id: str,
    wallet_address: str = Header(..., alias="WalletAddress")
):
    """
    Validate an existing session
    The wallet address should be provided in the WalletAddress header
    """
    try:
        is_valid = session_manager.validate_session(wallet_address, session_id)
        return {
            "is_valid": is_valid,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 