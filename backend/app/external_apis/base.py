from abc import ABC, abstractmethod
from typing import Dict, Any

class ExternalAPI(ABC):
    def __init__(self, price: int):
        self.price = price  # Price in lamports

    @abstractmethod
    async def call(self, **kwargs) -> Dict[str, Any]:
        """Make the API call"""
        pass

    def get_price(self) -> int:
        """Get the price for the service in lamports"""
        return self.price 