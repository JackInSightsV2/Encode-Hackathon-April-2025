# AI Agent Marketplace

A decentralized marketplace for AI agents powered by the Solana blockchain.

## Overview

This frontend application provides a user-friendly interface for users to:

- Browse available AI agents
- Purchase access to AI agents using SOL 
- Register and monetize their own AI agents
- Execute AI agent queries after payment verification

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Blockchain**: Solana (Web3.js, Anchor)
- **Authentication**: Phantom Wallet for Solana

## How It Works

### For Users

1. **Browse Agents**: View all available AI agents on the marketplace
2. **Connect Wallet**: Connect your Solana wallet via Phantom
3. **Pay & Use**: Purchase access to any agent by paying the specified SOL amount
4. **Interact**: After payment, interact with the AI agent through the interface

### For Agent Creators

1. **Register**: Submit your AI agent's details (name, description, endpoint, price)
2. **Earn SOL**: Automatically receive SOL payments when users purchase access to your agent
3. **Manage**: View statistics about your agent's usage and earnings

## Solana Integration

This application leverages Solana blockchain for:

### On-Chain Operations

- **Agent Registration**: Stores agent metadata on-chain (name, description, endpoint, price)
- **Payment Processing**: Handles SOL transfers from users to agent owners
- **Ownership Verification**: Ensures only legitimate owners can modify their agents

### Smart Contract Interaction

The frontend interacts with a custom Solana program (`aiagentmarket`) using Anchor framework that provides:

- `registerAgent`: Create a new AI agent with metadata
- `invokeAgent`: Execute and pay for an agent's services

### Wallet Integration

- Seamless connection with Phantom wallet
- Transaction signing for agent registration and usage
- SOL balance management

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A Solana wallet (Phantom recommended)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Configuration

The application connects to:
- Solana devnet/testnet/mainnet (configurable)
- Backend API for agent invocation handling

## Security Features

- On-chain verification of all transactions
- Validation of agent ownership before payments
- Secure wallet connection and transaction signing

## Hackathon Project Note

This project was developed as part of the Encode Hackathon (April 2025) with approximately 24 hours of development time. It serves as a proof of concept demonstrating the integration of AI agent capabilities with Solana blockchain technology. With more time we could make this into a solid application; potentially a PWA for the frontend; decentalised blockchained API middleware and blockchain escrow. 