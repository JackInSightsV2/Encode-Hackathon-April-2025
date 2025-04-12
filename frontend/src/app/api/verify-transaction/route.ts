import { NextResponse } from 'next/server';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { signature } = await req.json();
    
    if (!signature) {
      return NextResponse.json({ error: 'Transaction signature is required' }, { status: 400 });
    }
    
    // Fetch transaction details
    const txDetails = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    
    if (!txDetails) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Return transaction details for debugging
    return NextResponse.json({
      success: true,
      transaction: {
        blockTime: txDetails.blockTime,
        slot: txDetails.slot,
        meta: txDetails.meta,
      }
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return NextResponse.json({ error: 'Failed to verify transaction' }, { status: 500 });
  }
} 