from solana.rpc.api import Client
from typing import Optional, Dict
import os
from dotenv import load_dotenv
import base58
import re

load_dotenv()

class SolanaService:
    def __init__(self):
        self.client = Client(os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com"))
        self.program_id = os.getenv("PROGRAM_ID")
        self.used_tx_signatures: Dict[str, bool] = {}

    def is_valid_solana_address(self, address: str) -> bool:
        """
        Validate if a string is a valid Solana address
        Solana addresses are base58-encoded and 32 bytes long
        """
        try:
            # Check if the address is a string
            if not isinstance(address, str):
                return False

            # Check if the address matches the Solana address pattern
            if not re.match(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$', address):
                return False

            # Decode the base58 address
            decoded = base58.b58decode(address)
            
            # Check if the decoded address is 32 bytes long
            return len(decoded) == 32

        except Exception:
            return False

    async def verify_transaction(
        self,
        tx_signature: str,
        expected_agent_id: str,
        expected_price: int,
        wallet_address: str
    ) -> bool:
        """
        Verify a Solana transaction:
        1. Check if transaction exists on chain
        2. Verify it hasn't been used before
        3. Verify it was sent to the correct program
        4. Verify the correct amount was sent
        5. Verify the correct agent was specified
        """
        try:
            # Check if transaction has already been used
            if tx_signature in self.used_tx_signatures:
                return False

            # Get transaction details
            tx_info = self.client.get_transaction(tx_signature)
            if not tx_info:
                return False

            # Verify transaction was successful
            if not tx_info["result"]["meta"]["err"] is None:
                return False

            # Verify program ID
            if not any(
                account["pubkey"] == self.program_id
                for account in tx_info["result"]["transaction"]["message"]["accountKeys"]
            ):
                return False

            # Verify sender matches provided wallet address
            sender = tx_info["result"]["transaction"]["message"]["accountKeys"][0]
            if sender != wallet_address:
                return False

            # Verify amount transferred
            pre_balance = tx_info["result"]["meta"]["preBalances"][0]
            post_balance = tx_info["result"]["meta"]["postBalances"][0]
            amount_transferred = pre_balance - post_balance

            if amount_transferred < expected_price:
                return False

            # Mark transaction as used
            self.used_tx_signatures[tx_signature] = True

            return True

        except Exception as e:
            print(f"Error verifying transaction: {str(e)}")
            return False

    def clear_used_transactions(self):
        """Clear the used transactions cache (useful for testing)"""
        self.used_tx_signatures.clear() 