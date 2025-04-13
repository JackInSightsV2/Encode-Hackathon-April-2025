# API Gateway with Escrow Payment System

This backend consists of three main microservices:

1. **Auth Service** - Manages API keys and user authentication
2. **Escrow Service** - Handles wallet balances and transactions
3. **API Gateway** - Main entry point that verifies API keys, checks wallet balances, and forwards requests

## How it Works

1. Clients send requests to the API Gateway with:
   - `X-API-Key` header - For authentication
   - `X-Target-URL` header - The destination URL for the request
   - Request body - The payload to forward

2. The API Gateway:
   - Verifies the API key with the Auth Service
   - Checks if the user's wallet has sufficient funds (0.01 credits per request)
   - Deducts funds from the wallet
   - Forwards the request to the target URL
   - Returns the response to the client

## Running the Services

Each service can be run independently:

```bash
# Auth Service
cd backend/app/auth
python auth.py

# Escrow Service
cd backend/app/solana
python escrow_api.py

# API Gateway
cd backend/app/api
python api_gateway.py
```

## Error Responses

- `401` - Invalid API key
- `400` - Wallet not found
- `402` - Credits unavailable (insufficient balance)
- `500` - Internal server error
