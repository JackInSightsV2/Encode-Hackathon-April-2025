from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import datetime
from newspaper import Article
import nltk
from typing import Optional
from pydantic import BaseModel
import platform
import sys
from importlib.metadata import version, PackageNotFoundError

# Download required NLTK data
nltk.download('punkt')

app = FastAPI(title="News Summarizer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArticleRequest(BaseModel):
    url: str
    category: Optional[str] = None

class ArticleSummary(BaseModel):
    headline: str
    summary: str
    category: str

class HealthStatus(BaseModel):
    status: str
    timestamp: str
    python_version: str
    system_info: dict
    dependencies: dict

@app.get("/")
async def root():
    return {"message": "Welcome to News Summarizer API"}

@app.get("/health", response_model=HealthStatus)
async def health_check():
    # Get installed package versions
    dependencies = {}
    for package in ['fastapi', 'uvicorn', 'pydantic', 'newspaper3k', 'nltk', 'lxml']:
        try:
            dependencies[package] = version(package)
        except PackageNotFoundError:
            dependencies[package] = "Not installed"

    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "python_version": sys.version,
        "system_info": {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor()
        },
        "dependencies": dependencies
    }

@app.post("/summarize", response_model=ArticleSummary)
async def summarize_article(request: ArticleRequest):
    try:
        # Download and parse the article
        article = Article(request.url)
        article.download()
        article.parse()
        article.nlp()
        
        # Create summary
        summary = {
            "headline": article.title[:100],  # Limit headline length
            "summary": article.summary,
            "category": request.category or "Other"
        }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 