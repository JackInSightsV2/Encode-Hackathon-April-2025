from pydantic import BaseModel
from typing import Optional, List

class Article(BaseModel):
    id: int
    title: str
    content: str
    url: str

class StoryGenRequest(BaseModel):
    prompt: str
    wallet_address: str

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