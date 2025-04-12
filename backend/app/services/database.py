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

        # Create api_keys table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet_address TEXT NOT NULL,
                name TEXT NOT NULL,
                api_key TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP,
                usage_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                UNIQUE(wallet_address, name)
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

    def add_api_key(self, wallet_address: str, name: str) -> tuple[str, datetime]:
        """Add a new API key for a wallet address"""
        try:
            # Generate a 64-character API key with alphanumeric characters
            import random
            import string
            api_key = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO api_keys (wallet_address, name, api_key)
                VALUES (?, ?, ?)
            ''', (wallet_address, name, api_key))
            conn.commit()
            conn.close()
            return api_key, datetime.now()
        except sqlite3.IntegrityError:
            raise ValueError("API key name already exists for this wallet")

    def delete_api_key(self, wallet_address: str, name: str) -> bool:
        """Delete an API key for a wallet address by name"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            DELETE FROM api_keys
            WHERE wallet_address = ? AND name = ?
        ''', (wallet_address, name))
        affected_rows = cursor.rowcount
        conn.commit()
        conn.close()
        return affected_rows > 0

    def get_api_keys(self, wallet_address: str) -> list[dict]:
        """Get all API keys for a wallet address with their details"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT name, api_key, created_at, last_used, usage_count
            FROM api_keys
            WHERE wallet_address = ? AND is_active = TRUE
            ORDER BY created_at DESC
        ''', (wallet_address,))
        
        api_keys = []
        for row in cursor.fetchall():
            api_keys.append({
                "name": row[0],
                "api_key": row[1],
                "created_at": row[2],
                "last_used": row[3],
                "usage_count": row[4]
            })
        conn.close()
        return api_keys

    def record_api_key_usage(self, api_key: str):
        """Record API key usage and update last_used and usage_count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE api_keys
            SET last_used = CURRENT_TIMESTAMP,
                usage_count = usage_count + 1
            WHERE api_key = ?
        ''', (api_key,))
        conn.commit()
        conn.close()

    def validate_api_key(self, wallet_address: str, api_key: str) -> bool:
        """Validate if an API key belongs to a wallet address"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT COUNT(*) FROM api_keys
            WHERE wallet_address = ? AND api_key = ? AND is_active = TRUE
        ''', (wallet_address, api_key))
        count = cursor.fetchone()[0]
        conn.close()
        return count > 0 