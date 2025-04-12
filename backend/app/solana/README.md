# Solana Escrow API

This is a simple escrow API service for Solana that allows users to deposit, check balance, and spend funds. The service uses SQLite for storage and FastAPI for the API framework.

## What is an Escrow Service?

An escrow service acts as a trusted third party that temporarily holds funds until predefined conditions are met. This implementation provides a simple API for:
- Users to deposit funds into their escrow account
- Check their current balance
- Spend funds from their escrow account

## API Documentation

### Endpoints

#### 1. Deposit Funds
```
POST /deposit
```

**Headers:**
- X-User-ID: string (required) - Unique identifier for the user

**Request Body:**
```json
{
  "amount": 100.0
}
```

**Response:**
```json
{
  "user_id": "user123",
  "new_balance": 100.0
}
```

#### 2. Check Balance
```
GET /balance/{user_id}
```

**Response:**
```json
{
  "user_id": "user123",
  "balance": 100.0
}
```

#### 3. Spend Funds
```
POST /spend
```

**Headers:**
- X-User-ID: string (required) - Unique identifier for the user

**Request Body:**
```json
{
  "cost": 50.0
}
```

**Response:**
```json
{
  "user_id": "user123",
  "remaining_balance": 50.0
}
```

**Error Response (400):**
```json
{
  "detail": "Insufficient funds"
}
```

## Example Usage

### Using curl

1. Deposit funds:
```bash
curl -X POST "http://localhost:8000/deposit" \
  -H "X-User-ID: user123" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.0}'
```

2. Check balance:
```bash
curl -X GET "http://localhost:8000/balance/user123"
```

3. Spend funds:
```bash
curl -X POST "http://localhost:8000/spend" \
  -H "X-User-ID: user123" \
  -H "Content-Type: application/json" \
  -d '{"cost": 50.0}'
```

## Docker Setup

### Requirements
- Docker
- Docker Compose

### Building and Running with Docker Compose

```bash
# Navigate to the solana directory
cd backend/app/solana

# Build and start the container
docker-compose up -d

# To stop the container
docker-compose down
```

The API will be available at http://localhost:8000

## Technical Implementation

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLite**: Lightweight disk-based database
- **SQLAlchemy**: SQL toolkit and ORM for Python
- **Pydantic**: Data validation and settings management

The service uses a simple database schema with a single table `user_escrow` that stores user IDs and their balances.

## Environment Variables

- **DATABASE_URL** - SQLite database URL (default: sqlite:///./data/escrow.db)

## Data Persistence

The database is stored in the `/app/data` directory inside the container, which is mapped to the `./data` directory on the host for persistence. 