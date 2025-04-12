import sqlite3
from typing import Dict, Optional
import os
from datetime import datetime

class DatabaseService:
    def __init__(self):
        # Get the absolute path to the backend directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir))
        self.db_path = os.path.join(backend_dir, "transactions.db")
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        self.init_db()

    def init_db(self):
        """Initialize the database and create tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_signature TEXT UNIQUE NOT NULL,
                wallet_address TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                amount INTEGER NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP
            )
        ''')

        # Create usage_logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usage_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id INTEGER,
                agent_id TEXT NOT NULL,
                input_text TEXT,
                output_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (transaction_id) REFERENCES transactions (id)
            )
        ''')

        conn.commit()
        conn.close()

    def record_transaction(
        self,
        tx_signature: str,
        wallet_address: str,
        agent_id: str,
        amount: int,
        status: str = "pending"
    ) -> int:
        """Record a new transaction and return its ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            cursor.execute('''
                INSERT INTO transactions 
                (tx_signature, wallet_address, agent_id, amount, status)
                VALUES (?, ?, ?, ?, ?)
            ''', (tx_signature, wallet_address, agent_id, amount, status))
            
            transaction_id = cursor.lastrowid
            conn.commit()
            return transaction_id
        except sqlite3.IntegrityError:
            raise ValueError("Transaction already exists")
        finally:
            conn.close()

    def record_usage(
        self,
        transaction_id: int,
        agent_id: str,
        input_text: str,
        output_text: str
    ):
        """Record the usage of an agent"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO usage_logs 
            (transaction_id, agent_id, input_text, output_text)
            VALUES (?, ?, ?, ?)
        ''', (transaction_id, agent_id, input_text, output_text))

        # Update transaction status
        cursor.execute('''
            UPDATE transactions 
            SET status = 'completed', processed_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (transaction_id,))

        conn.commit()
        conn.close()

    def get_transaction(self, tx_signature: str) -> Optional[Dict]:
        """Get transaction details by signature"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM transactions WHERE tx_signature = ?
        ''', (tx_signature,))

        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "id": row[0],
                "tx_signature": row[1],
                "wallet_address": row[2],
                "agent_id": row[3],
                "amount": row[4],
                "status": row[5],
                "created_at": row[6],
                "processed_at": row[7]
            }
        return None

    def is_transaction_used(self, tx_signature: str) -> bool:
        """Check if a transaction has already been used"""
        transaction = self.get_transaction(tx_signature)
        return transaction is not None and transaction["status"] == "completed" 