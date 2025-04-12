from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import os
from dotenv import load_dotenv

# Import models
from models import (
    Article, StoryGenRequest, SummarizeRequest, SummarizeResponse,
    TranslationRequest, TranslationResponse, TransactionHistory
)

# Import services
from news_summarizer import NewsSummarizer
from story_gen import StoryGen
from translator import Translator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Services API",
    description="API for AI-powered services including news summarization, story generation, and translation",
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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_article(request: SummarizeRequest):
    """
    Summarize a news article
    """
    try:
        result = await news_summarizer.summarize(
            article_url=request.article_url,
            article_text=request.article_text
        )
        return SummarizeResponse(
            **result,
            status="success",
            tx_verified=True  # TODO: Implement actual transaction verification
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/story/generate")
async def generate_story(request: StoryGenRequest):
    """
    Generate a story based on the given prompt
    """
    try:
        result = await story_gen.generate_story(request.prompt)
        return {
            **result,
            "status": "success",
            "tx_verified": True  # TODO: Implement actual transaction verification
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text to target language
    """
    try:
        result = await translator.translate(
            text=request.text,
            target_language=request.target_language,
            source_language=request.source_language
        )
        return TranslationResponse(
            **result,
            status="success",
            tx_verified=True  # TODO: Implement actual transaction verification
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/languages")
async def get_supported_languages():
    """
    Get list of supported languages for translation
    """
    return translator.get_supported_languages()

@app.get("/prices")
async def get_service_prices():
    """
    Get prices for all services in lamports
    """
    return {
        "news_summarizer": news_summarizer.get_price(),
        "story_generator": story_gen.get_price(),
        "translator": translator.get_price()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
