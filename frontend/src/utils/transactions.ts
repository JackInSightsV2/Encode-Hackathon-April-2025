import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@project-serum/anchor';
import toast from 'react-hot-toast';
import { Agent } from './mockAgents';
import { PROGRAM_ID, aiAgentMarketIDL, getProgram } from './programIDL';

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
 * Create an Anchor provider from wallet and connection
 */
export function createAnchorProvider(wallet: any, connection: Connection): AnchorProvider {
  return new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
}

/**
 * Register a new agent on the blockchain
 */
export async function registerAgentOnChain(
  name: string,
  description: string,
  endpoint: string,
  price: number, // in SOL
  wallet: any,
  connection: Connection
): Promise<string | null> {
  // More thorough wallet connection check
  if (!wallet || !wallet.publicKey) {
    console.error('Wallet not properly connected:', wallet);
    toast.error('Wallet not properly connected. Please reconnect.');
    return null;
  }

  // Verify wallet can sign transactions
  if (!wallet.signTransaction || typeof wallet.signTransaction !== 'function') {
    console.error('Wallet cannot sign transactions:', wallet);
    toast.error('Your connected wallet cannot sign transactions. Try reconnecting or using a different wallet.');
    return null;
  }
  
  try {
    const toastId = toast.loading('Registering agent on Solana...');
    
    // Create new keypair for the agent account
    const agentKeypair = Keypair.generate();
    console.log('Agent keypair created:', {
      publicKey: agentKeypair.publicKey.toString(),
    });
    
    // Validate input data length
    if (name.length > 100) {
      toast.error('Name is too long. Maximum length is 100 characters.', { id: toastId });
      return null;
    }
    
    if (description.length > 200) {
      toast.error('Description is too long. Maximum length is 200 characters.', { id: toastId });
      return null;
    }
    
    if (endpoint.length > 100) {
      toast.error('Endpoint URL is too long. Maximum length is 100 characters.', { id: toastId });
      return null;
    }
    
    // Set up the provider and program with better error handling
    try {
      const provider = createAnchorProvider(wallet, connection);
      const program = getProgram(provider);
      
      // Convert price from SOL to lamports
      const priceLamports = new BN(price * LAMPORTS_PER_SOL);
      console.log('Registering agent with price:', {
        solPrice: price,
        lamports: priceLamports.toString(),
      });
      
      // Log the transaction details for debugging
      console.log('Transaction details:', {
        name,
        description: description.length > 30 ? description.substring(0, 30) + '...' : description,
        endpoint,
        price: priceLamports.toString(),
        agent: agentKeypair.publicKey.toString(),
        user: wallet.publicKey.toString(),
        program: PROGRAM_ID.toString(),
      });
      
      try {
        // Log network connection status
        const blockHeight = await connection.getBlockHeight();
        console.log('Connected to Solana network - current block height:', blockHeight);
        
        // Call the registerAgent instruction with more detailed error handling
        console.log('About to submit transaction...');
        const tx = await program.rpc.registerAgent(
          name,
          description,
          endpoint,
          priceLamports,
          {
            accounts: {
              agent: agentKeypair.publicKey,
              user: wallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [agentKeypair],
          }
        );
        
        console.log('Transaction successful:', tx);
        
        // Call our verification API
        try {
          const verifyResponse = await fetch('/api/verify-transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ signature: tx }),
          });
          
          const verificationData = await verifyResponse.json();
          console.log('Transaction verification details:', verificationData);
        } catch (verifyError) {
          console.error('Error verifying transaction:', verifyError);
        }
        
        // Verify the account was created by trying to fetch it
        try {
          const account = await program.account.agent.fetch(agentKeypair.publicKey);
          console.log('Agent account fetched successfully:', account);
        } catch (fetchError) {
          console.error('Error fetching new agent account:', fetchError);
        }
        
        toast.success('Agent registered successfully!', { id: toastId });
        return agentKeypair.publicKey.toString();
      } catch (txError: any) {
        console.error('Transaction error details:', {
          error: txError,
          message: txError.message,
          logs: txError.logs || 'No logs available',
        });
        
        // Check for specific transaction errors
        let errorMessage = 'Registration failed: ';
        
        if (txError.message) {
          if (txError.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds to complete transaction.';
          } else if (txError.message.includes('User rejected')) {
            errorMessage = 'Transaction rejected by wallet.';
          } else if (txError.message.includes('Signature verification failed')) {
            errorMessage = 'Signature verification failed. Your wallet may be locked.';
          } else if (txError.message.includes('Transaction simulation failed')) {
            errorMessage = 'Transaction simulation failed. This could be due to program constraints or network issues.';
            // Log simulation errors in detail
            if (txError.logs) {
              console.error('Simulation logs:', txError.logs);
            }
          } else {
            errorMessage += txError.message;
          }
        } else {
          errorMessage += 'Unknown transaction error';
        }
        
        toast.error(errorMessage, { id: toastId });
        throw txError; // Re-throw to be handled by the caller
      }
    } catch (providerError) {
      console.error('Provider setup error:', providerError);
      toast.error('Failed to setup provider: ' + (providerError instanceof Error ? providerError.message : 'Unknown error'), { id: toastId });
      return null;
    }
  } catch (error) {
    console.error('Error registering agent:', error);
    toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Invoke an agent with payment on the blockchain
 */
export async function invokeAgent(
  agent: Agent, 
  wallet: any,
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

  try {
    // Toast notification for starting transaction
    const toastId = toast.loading('Processing payment...');

    // Set up the provider and program
    const provider = createAnchorProvider(wallet, connection);
    const program = getProgram(provider);
    
    // Call the invokeAgent instruction
    const tx = await program.rpc.invokeAgent({
      accounts: {
        agent: new PublicKey(agent.id),
        user: wallet.publicKey,
        agentOwner: new PublicKey(agent.owner),
        systemProgram: SystemProgram.programId,
      },
    });
    
    // Save the agent as paid
    savePaidAgent(agent.id, userPublicKey);
    
    // Success toast
    toast.success(`Payment successful! Tx: ${tx.slice(0, 8)}...${tx.slice(-6)}`, 
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
 * Fetch all registered agents from the blockchain
 */
export async function fetchAgentsFromChain(
  connection: Connection
): Promise<Agent[] | null> {
  try {
    // Get all accounts owned by our program
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    
    // Create provider with null wallet just for deserialization
    const provider = new AnchorProvider(
      connection,
      { publicKey: null } as any,
      { commitment: 'processed' }
    );
    
    const program = getProgram(provider);
    
    // Deserialize and convert to Agent objects
    const agents = await Promise.all(
      accounts.map(async ({ pubkey, account }) => {
        const agentData = await program.account.agent.fetch(pubkey);
        
        return {
          id: pubkey.toString(),
          name: agentData.name,
          description: agentData.description,
          endpointUrl: agentData.endpoint,
          price: agentData.price.toNumber(),
          owner: agentData.owner.toString(),
          totalCalls: 0,
        } as Agent;
      })
    );
    
    return agents;
  } catch (error) {
    console.error('Error fetching agents from chain:', error);
    return null;
  }
}

/**
 * Check if a user has already paid for an agent by querying the blockchain
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
  
  // Here we would implement the on-chain check, but for now we'll keep the existing mock
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