# API Gateway

This is the entry point for clients to use the Marketplace AI Agents. 

It checks the Solana blockchain for the wallet balance and would deduct per API call (This wouldn't scale too well so credits would need to be introduced) We substituted this for a simple API backend. 

Ideally the gateway would have more secure auth and would allow the endpoint to pass directly back to the client application. 

We didn't have enough time to brainstorm how this could be hosted (decentralised) on the blockchain if it could be at all.
