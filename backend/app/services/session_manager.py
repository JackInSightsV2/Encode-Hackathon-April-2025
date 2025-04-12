from typing import Dict, Optional
import uuid
from datetime import datetime, timedelta

class SessionManager:
    def __init__(self):
        # Dictionary to store active sessions: {wallet_address: (session_id, expiry_time)}
        self.sessions: Dict[str, tuple[str, datetime]] = {}
        # Session duration in hours
        self.session_duration = 24  # 24 hours

    def create_session(self, wallet_address: str) -> str:
        """
        Create a new session for a wallet address
        Returns the session ID
        """
        # Generate a new UUID
        session_id = str(uuid.uuid4())
        
        # Calculate expiry time
        expiry_time = datetime.now() + timedelta(hours=self.session_duration)
        
        # Store the session
        self.sessions[wallet_address] = (session_id, expiry_time)
        
        return session_id

    def get_session(self, wallet_address: str) -> Optional[str]:
        """
        Get the active session ID for a wallet address
        Returns None if no valid session exists
        """
        if wallet_address not in self.sessions:
            return None
            
        session_id, expiry_time = self.sessions[wallet_address]
        
        # Check if session has expired
        if datetime.now() > expiry_time:
            del self.sessions[wallet_address]
            return None
            
        return session_id

    def validate_session(self, wallet_address: str, session_id: str) -> bool:
        """
        Validate if a session is active and valid
        """
        stored_session_id = self.get_session(wallet_address)
        return stored_session_id == session_id

    def clear_expired_sessions(self):
        """
        Remove all expired sessions
        """
        current_time = datetime.now()
        expired_wallets = [
            wallet for wallet, (_, expiry) in self.sessions.items()
            if current_time > expiry
        ]
        
        for wallet in expired_wallets:
            del self.sessions[wallet] 