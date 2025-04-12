from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import sqlite3

# Import models
from app.models.models import (
    Article, SummarizeRequest, SummarizeResponse,
    TranslationRequest, TranslationResponse, TransactionHistory, StoryGenRequest
)

# Import services
from app.services import (
    NewsSummarizer, Translator, SolanaService, DatabaseService
)

# Import dummy datagiy
from app.data.dummy_data import DUMMY_ARTICLES

# Import story generation
from app.services.story_gen import StoryGen

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
news_summarizer = NewsSummarizer()
story_gen = StoryGen()
translator = Translator()
solana_service = SolanaService()
db_service = DatabaseService()

# Test endpoints
@app.get("/test/articles", response_model=list[Article])
async def get_test_articles():
    return DUMMY_ARTICLES

@app.get("/test/article/{article_id}", response_model=Article)
async def get_test_article(article_id: int):
    article = next((a for a in DUMMY_ARTICLES if a["id"] == article_id), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@app.post("/test/summarize", response_model=SummarizeResponse)
async def test_summarize(article_id: int):
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
    
@app.post("/test/story_gen", response_model=StoryGenRequest)
async def test_story_gen(request: StoryGenRequest):
    try:
        result = await story_gen.generate_story(request)
        return StoryGenRequest(
            **result,
            status="success",
            tx_verified=True    
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Main endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/news/summarize", response_model=SummarizeResponse)
async def summarize_article(request: SummarizeRequest) -> SummarizeResponse:
    try:
        if db_service.is_transaction_used(request.tx_signature):
            raise HTTPException(status_code=403, detail="Transaction already used")

        tx_verified = await solana_service.verify_transaction(
            tx_signature=request.tx_signature,
            expected_agent_id="news_summarizer",
            expected_price=news_summarizer.price,
            wallet_address=request.wallet_address
        )

        if not tx_verified:
            raise HTTPException(status_code=403, detail="Invalid transaction")

        transaction_id = db_service.record_transaction(
            tx_signature=request.tx_signature,
            wallet_address=request.wallet_address,
            agent_id="news_summarizer",
            amount=news_summarizer.price
        )

        result = await news_summarizer.summarize(
            article_url=request.article_url,
            article_text=request.article_text
        )

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
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/translator/languages")
async def get_supported_languages():
    return translator.get_supported_languages()

@app.post("/api/translator/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest) -> TranslationResponse:
    try:
        if db_service.is_transaction_used(request.tx_signature):
            raise HTTPException(status_code=403, detail="Transaction already used")

        tx_verified = await solana_service.verify_transaction(
            tx_signature=request.tx_signature,
            expected_agent_id="translator",
            expected_price=translator.price,
            wallet_address=request.wallet_address
        )

        if not tx_verified:
            raise HTTPException(status_code=403, detail="Invalid transaction")

        transaction_id = db_service.record_transaction(
            tx_signature=request.tx_signature,
            wallet_address=request.wallet_address,
            agent_id="translator",
            amount=translator.price
        )

        result = await translator.translate(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )

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
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/translate")
async def test_translate(request: dict):
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
    conn = sqlite3.connect(db_service.db_path)
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