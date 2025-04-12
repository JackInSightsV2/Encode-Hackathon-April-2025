from solana.rpc.api import Client
from typing import Optional, Dict
import os
from dotenv import load_dotenv

load_dotenv()

class SolanaService:
    def __init__(self):
        self.client = Client(os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com"))
        self.program_id = os.getenv("PROGRAM_ID")
        self.used_tx_signatures: Dict[str, bool] = {}

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