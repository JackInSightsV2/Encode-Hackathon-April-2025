import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Import default styles for wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Set up Solana network (devnet, testnet, or mainnet-beta)
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  // Configure the wallets you want to use
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Devnet,
        options: {
          projectId: 'solana-wallet-connect-project',
          metadata: {
            name: 'Solana Hackathon App',
            description: 'Solana Hackathon Application',
            url: 'https://solanahackathon.com',
            icons: ['https://solana.com/favicon.ico']
          }
        }
      }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 