from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from tinydb import TinyDB, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
from datetime import datetime
import uuid

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins instead of just localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test endpoint for connectivity checks
@app.get("/test")
def test_connection():
    return {"status": "ok", "message": "API is working"}

# TinyDB setup
db_path = os.getenv("DATABASE_PATH", "./escrow.json")
db = TinyDB(db_path)
escrow_table = db.table('user_escrow')
transactions_table = db.table('transactions')

# Pydantic models
class DepositRequest(BaseModel):
    amount: float

class SpendRequest(BaseModel):
    cost: float

class Transaction(BaseModel):
    id: str
    user_id: str
    amount: float
    type: str
    timestamp: str

class WalletDetails(BaseModel):
    user_id: str
    balance: float
    transactions: list[Transaction] = []

# Helper function to record transactions
def record_transaction(user_id: str, amount: float, tx_type: str):
    tx_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    transactions_table.insert({
        'id': tx_id,
        'user_id': user_id,
        'amount': amount,
        'type': tx_type,
        'timestamp': timestamp
    })
    return {'id': tx_id, 'user_id': user_id, 'amount': amount, 'type': tx_type, 'timestamp': timestamp}

# Deposit endpoint (requires X-User-ID header)
@app.post("/deposit")
def deposit_funds(
    request: DepositRequest,
    user_id: str = Header(..., alias="X-User-ID")
):
    User = Query()
    user_record = escrow_table.get(User.user_id == user_id)
    
    if user_record:
        new_balance = user_record['balance'] + request.amount
        escrow_table.update({'balance': new_balance}, User.user_id == user_id)
    else:
        escrow_table.insert({'user_id': user_id, 'balance': request.amount})
        new_balance = request.amount
    
    # Record the transaction
    transaction = record_transaction(user_id, request.amount, 'deposit')
        
    return {"user_id": user_id, "balance": new_balance, "transaction": transaction}

# Get wallet details (balance and transactions)
@app.get("/wallet/{user_id}")
def get_wallet_details(user_id: str):
    User = Query()
    Tx = Query()
    
    # Get user balance
    user_record = escrow_table.get(User.user_id == user_id)
    balance = user_record['balance'] if user_record else 0
    
    # Get transactions for this user
    transactions = transactions_table.search(Tx.user_id == user_id)
    
    # Sort transactions by timestamp in descending order (newest first)
    transactions.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return {
        "user_id": user_id,
        "balance": balance,
        "transactions": transactions
    }

# Check balance
@app.get("/balance/{user_id}")
def get_balance(user_id: str):
    User = Query()
    user_record = escrow_table.get(User.user_id == user_id)
    
    if not user_record:
        return {"user_id": user_id, "balance": 0}
    
    return {"user_id": user_id, "balance": user_record['balance']}

# Spend funds endpoint (requires X-User-ID header)
@app.post("/spend")
def spend_funds(
    request: SpendRequest,
    user_id: str = Header(..., alias="X-User-ID")
):
    User = Query()
    user_record = escrow_table.get(User.user_id == user_id)
    
    if not user_record or user_record['balance'] < request.cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    new_balance = user_record['balance'] - request.cost
    escrow_table.update({'balance': new_balance}, User.user_id == user_id)
    
    # Record the transaction
    transaction = record_transaction(user_id, request.cost, 'spent')
    
    return {"user_id": user_id, "balance": new_balance, "transaction": transaction}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
