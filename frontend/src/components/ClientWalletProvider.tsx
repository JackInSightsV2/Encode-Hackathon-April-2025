"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Import the wallet provider dynamically to avoid SSR issues
const WalletContextProvider = dynamic(
  () => import("../context/WalletContextProvider"),
  {
    ssr: false,
  }
);

export default function ClientWalletProvider({ children }: { children: ReactNode }) {
  return <WalletContextProvider>{children}</WalletContextProvider>;
} 