// transaction.ts (Corrected: Pure @solana/web3.js for Anchor program without manual account creation)

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  SendTransactionError
} from '@solana/web3.js';
import toast from 'react-hot-toast';
import crypto from 'crypto';
import { Agent } from './mockAgents';

const PROGRAM_ID = new PublicKey('JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa');

// Store paid agents in local storage to persist between refreshes
const PAID_AGENTS_KEY = 'paid_agents';

function savePaidAgent(agentId: string, userPublicKey: string): void {
  try {
    const existingData = localStorage.getItem(PAID_AGENTS_KEY);
    const paidAgents = existingData ? JSON.parse(existingData) : {};
    
    if (!paidAgents[userPublicKey]) {
      paidAgents[userPublicKey] = [];
    }
    
    if (!paidAgents[userPublicKey].includes(agentId)) {
      paidAgents[userPublicKey].push(agentId);
      localStorage.setItem(PAID_AGENTS_KEY, JSON.stringify(paidAgents));
    }
  } catch (error) {
    console.error('Error saving paid agent data:', error);
  }
}

function isPaidAgentInStorage(agentId: string, userPublicKey: string): boolean {
  try {
    const existingData = localStorage.getItem(PAID_AGENTS_KEY);
    if (!existingData) return false;
    
    const paidAgents = JSON.parse(existingData);
    return paidAgents[userPublicKey] && paidAgents[userPublicKey].includes(agentId);
  } catch (error) {
    console.error('Error reading paid agent data:', error);
    return false;
  }
}

const discriminator = crypto.createHash('sha256')
  .update('global:register_agent')
  .digest()
  .slice(0, 8);

function serializeRegisterAgentInstruction(
  name: string,
  description: string,
  endpoint: string,
  priceLamports: number
): Buffer {
  const nameBuffer = Buffer.from(name, 'utf8');
  const descriptionBuffer = Buffer.from(description, 'utf8');
  const endpointBuffer = Buffer.from(endpoint, 'utf8');

  const buffer = Buffer.alloc(
    discriminator.length +
    4 + nameBuffer.length +
    4 + descriptionBuffer.length +
    4 + endpointBuffer.length +
    8
  );

  let offset = 0;
  discriminator.copy(buffer, offset);
  offset += discriminator.length;

  buffer.writeUInt32LE(nameBuffer.length, offset);
  offset += 4;
  nameBuffer.copy(buffer, offset);
  offset += nameBuffer.length;

  buffer.writeUInt32LE(descriptionBuffer.length, offset);
  offset += 4;
  descriptionBuffer.copy(buffer, offset);
  offset += descriptionBuffer.length;

  buffer.writeUInt32LE(endpointBuffer.length, offset);
  offset += 4;
  endpointBuffer.copy(buffer, offset);
  offset += endpointBuffer.length;

  buffer.writeBigUInt64LE(BigInt(priceLamports), offset);

  return buffer;
}

export async function registerAgentOnChain(
  name: string,
  description: string,
  endpoint: string,
  price: number,
  wallet: any,
  connection: Connection
): Promise<string | null> {
  if (!wallet.adapter?.publicKey || !wallet.adapter?.signTransaction) {
    toast.error('Wallet not properly connected or unable to sign.');
    console.error('Wallet connection issue:', wallet);
    return null;
  }

  const toastId = toast.loading('Registering agent on Solana...');

  const agentKeypair = Keypair.generate();
  const priceLamports = Math.floor(price * LAMPORTS_PER_SOL);
  const instructionData = serializeRegisterAgentInstruction(name, description, endpoint, priceLamports);

  const registerAgentIx = new TransactionInstruction({
    keys: [
      { pubkey: agentKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: wallet.adapter.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });

  const transaction = new Transaction().add(registerAgentIx);

  try {
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.adapter.publicKey;

    transaction.partialSign(agentKeypair);
    const signedTx = await wallet.adapter.signTransaction(transaction);

    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature, 'confirmed');

    toast.success('Agent registered successfully!', { id: toastId });
    return agentKeypair.publicKey.toString();
  } catch (error: any) {
    if (error instanceof SendTransactionError && error.logs) {
      console.error('Transaction failed with logs:', error.logs);
      toast.error(`Transaction failed: ${error.message}`, { id: toastId });
    } else {
      console.error('Transaction failed:', error);
      toast.error(`Transaction failed: ${error.message}`, { id: toastId });
    }
    return null;
  }
}

export async function fetchAgentsFromChain(connection: Connection): Promise<Agent[] | null> {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    const agents: Agent[] = accounts.map(({ pubkey, account }) => {
      let offset = 8; // Anchor accounts start with an 8-byte discriminator

      // Deserialize Name
      const nameLength = account.data.readUInt32LE(offset);
      offset += 4;
      const name = account.data.slice(offset, offset + nameLength).toString('utf8');
      offset += nameLength;

      // Deserialize Description
      const descLength = account.data.readUInt32LE(offset);
      offset += 4;
      const description = account.data.slice(offset, offset + descLength).toString('utf8');
      offset += descLength;

      // Deserialize Endpoint URL
      const endpointLength = account.data.readUInt32LE(offset);
      offset += 4;
      const endpointUrl = account.data.slice(offset, offset + endpointLength).toString('utf8');
      offset += endpointLength;

      // Deserialize Price
      const price = Number(account.data.readBigUInt64LE(offset));
      offset += 8;

      // Deserialize Owner PublicKey
      const owner = new PublicKey(account.data.slice(offset, offset + 32)).toString();

      return {
        id: pubkey.toString(),
        name,
        description,
        endpointUrl,
        price,
        owner,
        totalCalls: 0, // You might track this separately
      } as Agent;
    });

    return agents;
  } catch (error) {
    console.error('Error fetching agents from chain:', error);
    return null;
  }
}

/**
 * Invoke an agent with payment - this creates and sends a transaction to the Solana blockchain
 */
export async function invokeAgent(
  agent: Agent, 
  wallet: any,
  connection: Connection,
  input?: string
): Promise<boolean> {
  if (!wallet.adapter?.publicKey) {
    toast.error('Wallet not connected');
    return false;
  }

  const userPublicKey = wallet.adapter.publicKey.toString();
  
  // Check if user has already paid for this agent
  if (isPaidAgentInStorage(agent.id, userPublicKey)) {
    toast.success('You already have access to this agent!');
    return true;
  }

  try {
    // Toast notification for starting transaction
    const toastId = toast.loading('Processing payment...');

    // Create transaction instruction data
    // First byte is instruction index (1 for invokeAgent)
    const data = Buffer.from([1]);
    
    // Define the accounts that will be read from or written to
    const keys = [
      { pubkey: new PublicKey(agent.id), isSigner: false, isWritable: true },
      { pubkey: wallet.adapter.publicKey, isSigner: true, isWritable: true },
      { pubkey: new PublicKey(agent.owner), isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];
    
    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys,
      programId: PROGRAM_ID,
      data,
    });
    
    // Create a new transaction and add our instruction
    const transaction = new Transaction().add(instruction);
    
    // Set recent blockhash and fee payer
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.adapter.publicKey;
    
    // Sign the transaction
    if (wallet.adapter.signTransaction) {
      const signedTx = await wallet.adapter.signTransaction(transaction);
      
      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      // Save the agent as paid
      savePaidAgent(agent.id, userPublicKey);
      
      // Success toast
      toast.success(`Payment successful! Tx: ${signature.slice(0, 8)}...${signature.slice(-6)}`, 
        { id: toastId, duration: 4000 }
      );
      
      return true;
    } else {
      toast.error('Wallet does not support signing transactions', { id: toastId });
      return false;
    }
  } catch (error) {
    console.error('Error invoking agent:', error);
    toast.error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Check if a user has already paid for an agent
 */
export async function hasUserPaid(
  agentId: string,
  userPublicKey: PublicKey,
  connection: Connection
): Promise<boolean> {
  // First check local storage for faster response
  if (isPaidAgentInStorage(agentId, userPublicKey.toString())) {
    return true;
  }
  
  // For demo purposes, we'll simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a random result to simulate some users having paid
  const randomPaid = Math.random() > 0.7; // 30% chance user has already paid
  
  // If randomly determined as paid, save to localStorage for consistency
  if (randomPaid) {
    savePaidAgent(agentId, userPublicKey.toString());
  }
  
  return randomPaid;
}
