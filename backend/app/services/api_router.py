from typing import Dict, Any, Optional
from fastapi import HTTPException
from ..external_apis.translator import TranslatorAPI
from .solana_service import SolanaService
from .database import DatabaseService

class APIRouter:
    def __init__(self):
        self.solana_service = SolanaService()
        self.db_service = DatabaseService()
        self.apis = {
            "translator": TranslatorAPI(),
            # Add more APIs here as they are moved
        }

    async def route_request(
        self,
        wallet_address: str,
        api_name: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Route a request to the appropriate API after verifying wallet balance
        """
        # Get the API instance
        api = self.apis.get(api_name)
        if not api:
            raise HTTPException(status_code=404, detail=f"API {api_name} not found")

        # Get the required price
        required_price = api.get_price()

        # Verify wallet balance
        has_enough_balance = await self.solana_service.verify_wallet_balance(
            wallet_address=wallet_address,
            required_amount=required_price
        )

        if not has_enough_balance:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient balance. Required: {required_price} lamports"
            )

        try:
            # Make the API call
            result = await api.call(**kwargs)

            # Record the transaction
            transaction_id = self.db_service.record_transaction(
                tx_signature="",  # Will be updated when actual transaction is made
                wallet_address=wallet_address,
                agent_id=api_name,
                amount=required_price,
                status="pending"
            )

            # Record the usage
            self.db_service.record_usage(
                transaction_id=transaction_id,
                agent_id=api_name,
                input_text=str(kwargs),
                output_text=str(result)
            )

            return {
                **result,
                "status": "success",
                "price": required_price
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def get_api_price(self, api_name: str) -> Optional[int]:
        """Get the price for a specific API"""
        api = self.apis.get(api_name)
        return api.get_price() if api else None 