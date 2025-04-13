from fastapi import FastAPI, Header, HTTPException, Request
import httpx
import os
from fastapi.middleware.cors import CORSMiddleware
from tinydb import TinyDB, Query
import uuid
from datetime import datetime

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service/verify")
ESCROW_SERVICE_URL = os.getenv("ESCROW_SERVICE_URL", "http://escrow-service")
COST_PER_REQUEST = 0.01  # Fixed cost per request as per requirements

# Set up TinyDB for API call logging
db_path = os.getenv("DATABASE_PATH", "./api_calls.json")
db = TinyDB(db_path)
api_call_logs = db.table('api_calls')

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "api-gateway"}

def log_api_call(agent_id: str, api_key: str, success: bool):
    """Log an API call with timestamp and details"""
    api_call_logs.insert({
        "id": str(uuid.uuid4()),
        "agent_id": agent_id,
        "api_key": api_key,
        "timestamp": datetime.now().isoformat(),
        "success": success
    })

@app.post("/api/test")
async def test_api(
    x_api_key: str = Header(..., alias="X-API-Key"),
    x_agent_id: str = Header(None, alias="X-Agent-ID")
):
    # For demo purposes, we'll just validate the API key format
    # and return success without hitting the auth service
    if x_api_key and x_api_key.startswith('sk_'):
        return {
            "status": "success", 
            "message": "API tested successfully"
        }
    
    raise HTTPException(status_code=401, detail="Invalid API key format")

@app.post("/api/test-with-auth")
async def test_api_with_auth(
    x_api_key: str = Header(..., alias="X-API-Key"),
    x_agent_id: str = Header(None, alias="X-Agent-ID")
):
    # Verify the API key only without charging or forwarding the request
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                AUTH_SERVICE_URL,
                headers={"X-API-Key": x_api_key}
            )

            if auth_response.status_code != 200:
                if x_agent_id:
                    log_api_call(x_agent_id, x_api_key, False)
                raise HTTPException(status_code=401, detail="Invalid API key")

            if x_agent_id:
                log_api_call(x_agent_id, x_api_key, True)

            return {
                "status": "success", 
                "message": "API tested successfully"
            }
        except Exception as e:
            if x_agent_id:
                log_api_call(x_agent_id, x_api_key, False)
            raise HTTPException(status_code=500, detail=f"Error testing API: {str(e)}")

@app.post("/api/proxy")
async def proxy_request(
    request: Request,
    x_api_key: str = Header(..., alias="X-API-Key"),
    x_target_url: str = Header(..., alias="X-Target-URL"),
    x_agent_id: str = Header(None, alias="X-Agent-ID")
):
    # Step 1: Verify API Key with Auth Service
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                AUTH_SERVICE_URL,
                headers={"X-API-Key": x_api_key}
            )

            if auth_response.status_code != 200:
                if x_agent_id:
                    log_api_call(x_agent_id, x_api_key, False)
                raise HTTPException(status_code=401, detail="Invalid API key")

            user_data = auth_response.json()
            user_id = user_data.get("uuid")
            if not user_id:
                if x_agent_id:
                    log_api_call(x_agent_id, x_api_key, False)
                raise HTTPException(status_code=400, detail="Wallet not found")

            # Step 2: Check escrow balance
            escrow_balance_url = f"{ESCROW_SERVICE_URL}/balance/{user_id}"
            balance_response = await client.get(escrow_balance_url)
            
            if balance_response.status_code != 200:
                if x_agent_id:
                    log_api_call(x_agent_id, x_api_key, False)
                raise HTTPException(status_code=500, detail="Failed to check balance")
                
            balance = balance_response.json().get("balance", 0.0)

            if balance < COST_PER_REQUEST:
                if x_agent_id:
                    log_api_call(x_agent_id, x_api_key, False)
                raise HTTPException(status_code=402, detail="Credits unavailable")

            # Step 3: Spend the funds
            spend_response = await client.post(
                f"{ESCROW_SERVICE_URL}/spend",
                headers={
                    "X-User-ID": user_id,
                    "X-Agent-ID": x_agent_id if x_agent_id else None
                },
                json={"cost": COST_PER_REQUEST}
            )
            
            if spend_response.status_code != 200:
                if x_agent_id:
                    log_api_call(x_agent_id, x_api_key, False)
                raise HTTPException(status_code=500, detail="Failed to deduct balance")

            # We always log the call for tracking purposes
            if x_agent_id:
                log_api_call(x_agent_id, x_api_key, True)

            # Step 4: Forward original request to target URL
            try:
                body = await request.body()
                headers = dict(request.headers)
                
                # Remove gateway-specific headers
                headers.pop("x-api-key", None)
                headers.pop("x-target-url", None)
                headers.pop("x-agent-id", None)
                
                # For this example, we're just returning success instead of forwarding
                # In a real implementation, you would do:
                # target_response = await client.request(
                #     request.method,
                #     x_target_url,
                #     headers=headers,
                #     content=body
                # )
                # return target_response.json()
                
                return {
                    "status": "success", 
                    "message": "Request was successful"
                }
                
            except Exception as e:
                if x_agent_id:
                    log_api_call(x_agent_id, x_api_key, False)
                raise HTTPException(status_code=500, detail=f"Error forwarding request: {str(e)}")
        except HTTPException:
            raise
        except Exception as e:
            if x_agent_id:
                log_api_call(x_agent_id, x_api_key, False)
            raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
