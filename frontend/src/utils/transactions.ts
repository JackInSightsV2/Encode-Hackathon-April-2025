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

const PROGRAM_ID = new PublicKey('JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa');

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
