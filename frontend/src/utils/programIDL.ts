import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';

// Explicitly constructed IDL from the contract
// Using 'as any' to avoid type conflicts with the Anchor Idl type
export const aiAgentMarketIDL = {
  "version": "0.1.0",
  "name": "aiagentmarket",
  "instructions": [
    {
      "name": "registerAgent",
      "accounts": [
        {"name": "agent", "isMut": true, "isSigner": true},
        {"name": "user", "isMut": true, "isSigner": true},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": [
        {"name": "name", "type": "string"},
        {"name": "description", "type": "string"},
        {"name": "endpoint", "type": "string"},
        {"name": "price", "type": "u64"}
      ]
    },
    {
      "name": "invokeAgent",
      "accounts": [
        {"name": "agent", "isMut": true, "isSigner": false},
        {"name": "user", "isMut": true, "isSigner": true},
        {"name": "agentOwner", "isMut": true, "isSigner": false},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Agent",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "name", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "endpoint", "type": "string"},
          {"name": "price", "type": "u64"},
          {"name": "owner", "type": "publicKey"}
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAgentOwner",
      "msg": "The provided agent owner does not match the stored owner."
    }
  ]
} as any;

// This is the program ID from the contract
export const PROGRAM_ID = new PublicKey("JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa");

/**
 * Get the Anchor program instance with the provided wallet and connection
 */
export function getProgram(provider: AnchorProvider) {
  return new Program(aiAgentMarketIDL as Idl, PROGRAM_ID, provider);
}

/**
 * Agent account data structure matching the on-chain data
 */
export type AgentAccount = {
  name: string;
  description: string;
  endpoint: string;
  price: bigint;
  owner: PublicKey;
} 