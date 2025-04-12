from fastapi import FastAPI, Header, HTTPException, Request
import httpx
import os

app = FastAPI()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service/verify")
ESCROW_SERVICE_URL = os.getenv("ESCROW_SERVICE_URL", "http://escrow-service")
COST_PER_REQUEST = 1.0  # Or however you want to configure this

@app.post("/ai")
async def proxy_to_ai(
    request: Request,
    x_api_key: str = Header(...),
    x_ai_url: str = Header(...)
):
    # Step 1: Verify API Key with Auth Service
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            AUTH_SERVICE_URL,
            headers={"X-API-Key": x_api_key}
        )

        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid API key")

        user_data = auth_response.json()
        user_id = user_data.get("uuid")
        if not user_id:
            raise HTTPException(status_code=400, detail="UUID not found")

        # Step 2: Check escrow balance
        escrow_balance_url = f"{ESCROW_SERVICE_URL}/balance/{user_id}"
        balance_response = await client.get(escrow_balance_url)
        balance = balance_response.json().get("balance", 0.0)

        if balance < COST_PER_REQUEST:
            raise HTTPException(status_code=402, detail="Balance Insufficient")

        # Step 3: Spend the funds
        spend_response = await client.post(
            f"{ESCROW_SERVICE_URL}/spend",
            headers={"X-User-ID": user_id},
            json={"cost": COST_PER_REQUEST}
        )
        if spend_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to deduct balance")

        # Step 4: Forward original request body to AI agent
        body = await request.body()
        ai_response = await client.post(
            x_ai_url,
            content=body,
            headers={"Content-Type": request.headers.get("Content-Type", "application/json")}
        )

    # Step 5: Return AI agent's response
    return ai_response.json()
