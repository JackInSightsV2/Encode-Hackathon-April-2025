# AI Agent Marketplace

This project consists of a frontend application built with Next.js and a backend authentication service built with FastAPI.

## Features

- Wallet-based authentication
- API key management
- Mock data toggle for development and testing

## Project Structure

- `frontend/` - Next.js application
- `backend/` - Backend services
  - `app/auth/` - Authentication and API key management service

## Running the Project

### Using Docker Compose (Recommended)

The easiest way to run both the frontend and backend services together is to use Docker Compose:

```bash
# Start all services
docker compose up

# In a separate terminal, you can check logs for a specific service
docker compose logs -f auth-service
docker compose logs -f frontend

# To rebuild after code changes
docker compose up --build
```

Once running:
- Frontend: http://localhost:3000
- Auth Backend: http://localhost:8000

### Running Services Separately

#### Auth Backend

```bash
cd backend/app/auth
pip install -r requirements.txt
uvicorn auth:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Key Management

The application allows users to:

1. Connect their wallet to authenticate
2. View existing API keys
3. Create new API keys with custom names
4. Delete API keys

Users can toggle between mock data and live data using the switch in the UI.

## Environment Variables

- `NEXT_PUBLIC_API_URL` - URL for the backend API (defaults to http://localhost:8000)

## API Endpoints

### Authentication Service

- `POST /auth` - Authenticate with wallet address
- `POST /apikeys/add` - Create a new API key
- `POST /apikeys/delete` - Delete an API key
- `GET /apikeys/{wallet_address}` - List all API keys for a wallet
- `POST /apikeys/use` - Record usage of an API key

## Development

The API key page in the frontend connects to the auth backend service running on localhost:8000. The page includes both a mock data mode for testing and a live data mode that integrates with the actual backend service.
