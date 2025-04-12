import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import toast from 'react-hot-toast';
import { Agent } from './mockAgents';

// Mock program ID - this would be the actual program ID in production
const PROGRAM_ID = new PublicKey('AGntPe4Naj9CXzeQpDKrJaAFvhB3MvXKQYhDQj1iHPZA');

// Store paid agents in local storage to persist between refreshes
const PAID_AGENTS_KEY = 'paid_agents';

/**
 * Save paid agent to local storage
 */
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

/**
 * Check if an agent is in the paid agents list
 */
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

/**
 * Simulates invoking an agent with payment
 * In a real implementation, this would make an actual Solana transaction
 */
export async function invokeAgent(
  agent: Agent, 
  wallet: any, // We should use proper type from wallet adapter
  connection: Connection,
  input?: string
): Promise<boolean> {
  if (!wallet.publicKey) {
    toast.error('Wallet not connected');
    return false;
  }

  const userPublicKey = wallet.publicKey.toString();
  
  // Check if user has already paid for this agent
  if (isPaidAgentInStorage(agent.id, userPublicKey)) {
    toast.success('You already have access to this agent!');
    return true;
  }

  // For now, we'll just simulate a transaction
  try {
    // Toast notification for starting transaction
    const toastId = toast.loading('Processing payment...');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real implementation, we would:
    // 1. Create a transaction to send SOL to the agent owner
    // 2. Also invoke the program's invoke_agent instruction
    // 3. Sign and send the transaction
    
    /*
    // Example of what a real implementation might look like:
    const transaction = new Transaction().add(
      // Transfer SOL to agent owner
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(agent.owner),
        lamports: agent.price,
      }),
      
      // Call the program's invoke_agent instruction
      new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: new PublicKey(agent.owner), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(agent.id), isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([...]) // Serialized instruction data
      })
    );

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.signTransaction]
    );
    */

    // For demonstration, we'll just simulate successful tx
    const mockSignature = 'tx_' + Math.random().toString(36).substring(2, 15);
    
    // Save the agent as paid
    savePaidAgent(agent.id, userPublicKey);
    
    // Simulate agent invocation with input if provided
    if (input) {
      console.log(`Agent ${agent.id} invoked with input: ${input}`);
      // In a real implementation, we would call the agent's API endpoint here
    }
    
    // Success toast
    toast.success(`Payment successful! Tx: ${mockSignature.slice(0, 8)}...${mockSignature.slice(-6)}`, 
      { id: toastId, duration: 4000 }
    );
    
    return true;
  } catch (error) {
    console.error('Error invoking agent:', error);
    toast.error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Simulates checking if a user has already paid for an agent
 * In a real implementation, this would query the blockchain
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
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demonstration, we'll just return a random result if not found in localStorage
  // In a real implementation, we would query the blockchain
  const randomPaid = Math.random() > 0.7; // 30% chance user has already paid
  
  // If randomly determined as paid, save to localStorage for consistency
  if (randomPaid) {
    savePaidAgent(agentId, userPublicKey.toString());
  }
  
  return randomPaid;
} 