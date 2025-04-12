from typing import Dict, List, Optional
import uuid
from datetime import datetime
import sqlite3
import os

class APIKeyManager:
    def __init__(self):
        # Create database directory if it doesn't exist
        db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend", "data")
        os.makedirs(db_dir, exist_ok=True)
        
        # Use a simpler path for the database
        self.db_path = os.path.join(db_dir, "api_keys.db")
        self._init_db()

    def _init_db(self):
        """Initialize the database with the required table"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS api_keys (
                    wallet_address TEXT NOT NULL,
                    name TEXT NOT NULL,
                    api_key TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used TIMESTAMP,
                    usage_count INTEGER DEFAULT 0
                )
            ''')
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error initializing database: {e}")
            raise

    def generate_api_key(self) -> str:
        """Generate a 64-character API key"""
        return str(uuid.uuid4()).replace('-', '') + str(uuid.uuid4()).replace('-', '')

    def create_api_key(self, wallet_address: str, name: str) -> Dict:
        """Create a new API key for a wallet"""
        api_key = self.generate_api_key()
        created_at = datetime.now().isoformat()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO api_keys (wallet_address, name, api_key, created_at)
            VALUES (?, ?, ?, ?)
        ''', (wallet_address, name, api_key, created_at))
        
        conn.commit()
        conn.close()
        
        return {
            "name": name,
            "api_key": api_key,
            "created_at": created_at,
            "last_used": None,
            "usage_count": 0
        }

    def get_api_keys(self, wallet_address: str) -> List[Dict]:
        """Get all API keys for a wallet"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT name, api_key, created_at, last_used, usage_count
            FROM api_keys
            WHERE wallet_address = ?
            ORDER BY created_at DESC
        ''', (wallet_address,))
        
        keys = []
        for row in cursor.fetchall():
            keys.append({
                "name": row[0],
                "api_key": row[1],
                "created_at": row[2],
                "last_used": row[3],
                "usage_count": row[4]
            })
        
        conn.close()
        return keys

    def record_api_key_usage(self, api_key: str):
        """Record API key usage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE api_keys
            SET last_used = ?,
                usage_count = usage_count + 1
            WHERE api_key = ?
        ''', (datetime.now().isoformat(), api_key))
        
        conn.commit()
        conn.close()

    def delete_api_key(self, wallet_address: str, key_name: str) -> bool:
        """
        Delete an API key by name
        
        Args:
            wallet_address: The wallet address that owns the key
            key_name: The name of the key to delete
            
        Returns:
            bool: True if the key was deleted, False if it wasn't found
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Delete the key
            cursor.execute('''
                DELETE FROM api_keys 
                WHERE wallet_address = ? AND name = ?
            ''', (wallet_address, key_name))
            
            # Check if any rows were affected
            success = cursor.rowcount > 0
            
            conn.commit()
            conn.close()
            
            return success
            
        except Exception as e:
            print(f"Error deleting API key: {str(e)}")
            return False 