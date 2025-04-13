# Auth System

A basic authentication and API key management system.

## Installation

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/MacOS: `source venv/bin/activate`

3. Install the dependencies:
```
pip install -r requirements.txt
```

## Setup

Initialize the database:
```
python setup.py
```

## Running the Auth Service

Start the API server:
```
python run.py
```

## API Endpoints

- `POST /auth` - Authenticate with a wallet address
- `POST /apikeys/add` - Add a new API key for a wallet
- `POST /apikeys/delete` - Delete an API key
- `GET /apikeys/{wallet_address}` - List API keys for a wallet
- `POST /apikeys/use` - Use an API key (increment counter and update last used timestamp)

## Example Usage

### Authenticate a wallet
```
curl -X POST http://localhost:8000/auth -H "Content-Type: application/json" -d '{"wallet_address": "0x1234..."}'
```

### Add API key
```
curl -X POST http://localhost:8000/apikeys/add -H "Content-Type: application/json" -d '{"wallet_address": "0x1234...", "name": "My API Key"}' 