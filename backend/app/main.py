from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from app.services.news_summarizer import NewsSummarizer
from app.services.solana_service import SolanaService
from app.services.translator import Translator
import sqlite3
from app.services.database import DatabaseService

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
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
news_summarizer = NewsSummarizer()
solana_service = SolanaService()
translator = Translator()
db_service = DatabaseService()

# Dummy data for testing
DUMMY_ARTICLES = [
    {
        "id": 1,
        "title": "The Future of AI in Healthcare",
        "content": "Artificial Intelligence is revolutionizing healthcare with new diagnostic tools and treatment methods...",
        "url": "https://example.com/ai-healthcare"
    },
    {
        "id": 2,
        "title": "Blockchain Technology Trends 2024",
        "content": "Blockchain continues to evolve with new applications in finance, supply chain, and more...",
        "url": "https://example.com/blockchain-trends"
    }
]

# Models
class Article(BaseModel):
    id: int
    title: str
    content: str
    url: str

class SummarizeRequest(BaseModel):
    tx_signature: str
    article_url: str
    article_text: Optional[str] = None
    wallet_address: str

class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int
    url: str
    status: str
    tx_verified: bool

class TranslationRequest(BaseModel):
    tx_signature: str
    text: str
    target_language: str
    source_language: Optional[str] = None
    wallet_address: str

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    source_language_name: str
    target_language_name: str
    status: str
    tx_verified: bool

class TransactionHistory(BaseModel):
    id: int
    tx_signature: str
    wallet_address: str
    agent_id: str
    amount: int
    status: str
    created_at: str
    processed_at: Optional[str]

# Test endpoints
@app.get("/test/articles", response_model=List[Article])
async def get_test_articles():
    """Get list of dummy articles for testing"""
    return DUMMY_ARTICLES

@app.get("/test/article/{article_id}", response_model=Article)
async def get_test_article(article_id: int):
    """Get a specific dummy article by ID"""
    article = next((a for a in DUMMY_ARTICLES if a["id"] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@app.post("/test/summarize", response_model=SummarizeResponse)
async def test_summarize(article_id: int):
    """Test endpoint for summarization without Solana verification"""
    article = next((a for a in DUMMY_ARTICLES if a["id"] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    try:
        result = await news_summarizer.summarize(
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

# Original endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/news/summarize", response_model=SummarizeResponse)
async def summarize_article(request: SummarizeRequest) -> SummarizeResponse:
    try:
        # Check if transaction already used
        if db_service.is_transaction_used(request.tx_signature):
            raise HTTPException(
                status_code=403,
                detail="Transaction already used"
            )

        # Verify the transaction
        tx_verified = await solana_service.verify_transaction(
            tx_signature=request.tx_signature,
            expected_agent_id="news_summarizer",
            expected_price=news_summarizer.price,
            wallet_address=request.wallet_address
        )

        if not tx_verified:
            raise HTTPException(
                status_code=403,
                detail="Invalid transaction"
            )

        # Record the transaction
        transaction_id = db_service.record_transaction(
            tx_signature=request.tx_signature,
            wallet_address=request.wallet_address,
            agent_id="news_summarizer",
            amount=news_summarizer.price
        )

        # Process the summary
        result = await news_summarizer.summarize(
            article_url=request.article_url,
            article_text=request.article_text
        )

        # Record the usage
        db_service.record_usage(
            transaction_id=transaction_id,
            agent_id="news_summarizer",
            input_text=request.article_text or request.article_url,
            output_text=result["summary"]
        )

        return SummarizeResponse(
            **result,
            status="success",
            tx_verified=True
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/api/translator/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return translator.get_supported_languages()

@app.post("/api/translator/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest) -> TranslationResponse:
    try:
        # Check if transaction already used
        if db_service.is_transaction_used(request.tx_signature):
            raise HTTPException(
                status_code=403,
                detail="Transaction already used"
            )

        # Verify the transaction
        tx_verified = await solana_service.verify_transaction(
            tx_signature=request.tx_signature,
            expected_agent_id="translator",
            expected_price=translator.price,
            wallet_address=request.wallet_address
        )

        if not tx_verified:
            raise HTTPException(
                status_code=403,
                detail="Invalid transaction"
            )

        # Record the transaction
        transaction_id = db_service.record_transaction(
            tx_signature=request.tx_signature,
            wallet_address=request.wallet_address,
            agent_id="translator",
            amount=translator.price
        )

        # Process the translation
        result = await translator.translate(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )

        # Record the usage
        db_service.record_usage(
            transaction_id=transaction_id,
            agent_id="translator",
            input_text=request.text,
            output_text=result["translated_text"]
        )

        return TranslationResponse(
            **result,
            status="success",
            tx_verified=True
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/test/translate")
async def test_translate(request: dict):
    """Test endpoint for translation without Solana verification"""
    try:
        result = await translator.translate(
            text=request.get("text"),
            target_language=request.get("target_language"),
            source_language=request.get("source_language")
        )
        
        return {
            **result,
            "status": "success",
            "tx_verified": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/transactions/{wallet_address}", response_model=list[TransactionHistory])
async def get_transaction_history(wallet_address: str):
    """Get transaction history for a wallet"""
    conn = sqlite3.connect("backend/transactions.db")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 