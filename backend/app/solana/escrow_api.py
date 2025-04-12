from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from sqlalchemy import Column, String, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os

app = FastAPI()

# SQLite DB setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./escrow.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class UserEscrow(Base):
    __tablename__ = "user_escrow"
    user_id = Column(String, primary_key=True, index=True)
    balance = Column(Float, default=0.0)

Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models (user_id no longer used from here directly)
class DepositRequest(BaseModel):
    amount: float

class SpendRequest(BaseModel):
    cost: float

# Deposit endpoint (requires X-User-ID header)
@app.post("/deposit")
def deposit_funds(
    request: DepositRequest,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    # Trust that user_id is already verified by another backend
    user = db.query(UserEscrow).filter_by(user_id=user_id).first()
    if user:
        user.balance += request.amount
    else:
        user = UserEscrow(user_id=user_id, balance=request.amount)
        db.add(user)
    db.commit()
    return {"user_id": user_id, "new_balance": user.balance}

# Check balance (same as before)
@app.get("/balance/{user_id}")
def get_balance(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserEscrow).filter_by(user_id=user_id).first()
    if not user:
        return {"user_id": user_id, "balance": 0}
    return {"user_id": user_id, "balance": user.balance}

# Spend funds endpoint (requires X-User-ID header)
@app.post("/spend")
def spend_funds(
    request: SpendRequest,
    user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db)
):
    user = db.query(UserEscrow).filter_by(user_id=user_id).first()
    if not user or user.balance < request.cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    user.balance -= request.cost
    db.commit()
    return {"user_id": user_id, "remaining_balance": user.balance}
