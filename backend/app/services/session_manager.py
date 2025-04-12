from typing import Dict, Optional, Set, List
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from .database import DatabaseService

load_dotenv()

class SessionManager:
    def __init__(self):
        # Dictionary to store active sessions: {wallet_address: (session_id, expiry_time)}
        self.sessions: Dict[str, tuple[str, datetime]] = {}
        # Session duration in hours
        self.session_duration = 24  # 24 hours

    def create_session(self, wallet_address: str) -> str:
        """
        Create a new session for a wallet address (login)
        Returns session_id
        """
        # Generate a new UUID for session
        session_id = str(uuid.uuid4())
        
        # Calculate expiry time
        expiry_time = datetime.now() + timedelta(hours=self.session_duration)
        
        # Store the session
        self.sessions[wallet_address] = (session_id, expiry_time)
        
        return session_id

    def validate_session(self, wallet_address: str, session_id: str) -> bool:
        """
        Validate if a session is still active (like checking if user is logged in)
        """
        if wallet_address not in self.sessions:
            return False
            
        stored_session_id, expiry_time = self.sessions[wallet_address]
        
        # Check if session ID matches and session hasn't expired
        return session_id == stored_session_id and datetime.now() < expiry_time

    def get_wallet_from_session(self, session_id: str) -> Optional[str]:
        """
        Get wallet address from session ID
        """
        for wallet, (stored_session_id, expiry_time) in self.sessions.items():
            if stored_session_id == session_id and datetime.now() < expiry_time:
                return wallet
        return None

    def clear_expired_sessions(self):
        """
        Clear expired sessions from memory
        """
        current_time = datetime.now()
        expired_wallets = [
            wallet for wallet, (_, expiry_time) in self.sessions.items()
            if current_time >= expiry_time
        ]
        for wallet in expired_wallets:
            del self.sessions[wallet]

    def get_wallet_from_api_key(self, api_key: str) -> Optional[str]:
        """
        Get the wallet address associated with an API key
        """
        try:
            # Get all API keys for all wallets
            all_keys = self.db.get_all_api_keys()
            
            # Find the matching API key and return its wallet address
            for key_data in all_keys:
                if key_data['api_key'] == api_key:
                    return key_data['wallet_address']
            return None
            
        except Exception as e:
            print(f"Error getting wallet from API key: {e}")
            return None 