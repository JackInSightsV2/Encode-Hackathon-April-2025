from fastapi import FastAPI, HTTPException, Request, Header
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
from typing import List
from tinydb import TinyDB, Query
from tinydb.operations import add, set
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS - ensure these settings match your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB setup
db = TinyDB("auth_db.json")
users_table = db.table("users")

# Log all requests middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Schemas
class WalletRequest(BaseModel):
    wallet_address: str

class APIKeyRequest(BaseModel):
    wallet_address: str
    name: str

class DeleteAPIKeyRequest(BaseModel):
    wallet_address: str
    key: str

class UseAPIKeyRequest(BaseModel):
    key: str

# Helpers
def get_user(wallet_address: str):
    UserQ = Query()
    return users_table.get(UserQ.wallet_address == wallet_address)

# Routes
@app.get("/")
def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy", "service": "auth-api"}

@app.post("/auth")
def authenticate(wallet: WalletRequest):
    existing_user = get_user(wallet.wallet_address)
    if existing_user:
        return {"session_id": existing_user["session_id"]}

    session_id = str(uuid4())
    users_table.insert({
        "wallet_address": wallet.wallet_address,
        "session_id": session_id,
        "created_at": datetime.utcnow().isoformat(),
        "api_keys": []
    })
    return {"session_id": session_id}

@app.post("/apikeys/add")
def add_api_key(req: APIKeyRequest):
    UserQ = Query()
    user = get_user(req.wallet_address)
    if not user:
        raise HTTPException(status_code=404, detail="Wallet not found. Authenticate first.")

    api_key = {
        "name": req.name,
        "key": uuid4().hex,
        "created_at": datetime.utcnow().isoformat(),
        "last_used": None,
        "use_count": 0
    }
    user["api_keys"].append(api_key)
    users_table.update({"api_keys": user["api_keys"]}, UserQ.wallet_address == req.wallet_address)
    return {"message": "API key added", "key": api_key["key"]}

@app.post("/apikeys/delete")
def delete_api_key(req: DeleteAPIKeyRequest):
    UserQ = Query()
    user = get_user(req.wallet_address)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    filtered_keys = [k for k in user["api_keys"] if k["key"] != req.key]
    if len(filtered_keys) == len(user["api_keys"]):
        raise HTTPException(status_code=404, detail="API key not found.")

    users_table.update({"api_keys": filtered_keys}, UserQ.wallet_address == req.wallet_address)
    return {"message": "API key deleted"}

@app.get("/apikeys/{wallet_address}")
def list_api_keys(wallet_address: str):
    user = get_user(wallet_address)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user["api_keys"]

@app.post("/apikeys/use")
def use_api_key(req: UseAPIKeyRequest):
    UserQ = Query()
    all_users = users_table.all()
    for user in all_users:
        for key in user["api_keys"]:
            if key["key"] == req.key:
                key["use_count"] += 1
                key["last_used"] = datetime.utcnow().isoformat()
                users_table.update({"api_keys": user["api_keys"]}, UserQ.wallet_address == user["wallet_address"])
                return {
                    "message": "Usage recorded",
                    "name": key["name"],
                    "wallet_address": user["wallet_address"]
                }
    raise HTTPException(status_code=404, detail="Invalid API key.")

@app.get("/verify")
def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    # Look for a user with the given API key
    all_users = users_table.all()
    for user in all_users:
        for key in user["api_keys"]:
            if key["key"] == x_api_key:
                # Update key usage
                UserQ = Query()
                key["use_count"] += 1
                key["last_used"] = datetime.utcnow().isoformat()
                users_table.update({"api_keys": user["api_keys"]}, UserQ.wallet_address == user["wallet_address"])
                
                # Return user data
                return {
                    "name": key["name"],
                    "wallet_address": user["wallet_address"],
                    "uuid": user["wallet_address"],  # Using wallet address as UUID
                    "valid": True
                }
    
    # If no matching API key is found
    raise HTTPException(status_code=401, detail="Invalid API key")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)