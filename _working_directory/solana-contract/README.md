Install WSL
Install Python
Install Python-Pip
Install NodeJS

curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash

const idl = { /* your explicit IDL here */ };
const programId = new PublicKey("JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa");
const provider = anchor.AnchorProvider.env();
const program = new anchor.Program(idl, programId, provider);

- **Program ID:**  
  `JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa`  
  *(this never changes—store it safely!)*

- **Cluster:**  
  Solana **Devnet**

- **Transaction Signature:**  
  `3ts1zVo8hGHMuoZVu9hSP3NUCBt9KB2Po4LThQtva7nNRAtUnw11btQmRR3Y642hCSqo9iunEi384VfVKvEs5RRP`

---

### 🚩 **Immediate Next Steps:**

1. **Verify on-chain:**

Check your deployed contract explicitly on [Solana Explorer (devnet)](https://explorer.solana.com/?cluster=devnet). Paste your **Program ID** there.

2. **Integrate Frontend:**

Update your React/Next.js frontend to explicitly reference your **Program ID** and your explicitly defined **IDL JSON**.

Example (React Anchor Client):
```javascript
const idl = { /* your explicit IDL here */ };
const programId = new PublicKey("JA9FE7qcuSHQTgeGBzQHWP8ZaeLGBHag8gU6D4ZaCnRa");
const provider = anchor.AnchorProvider.env();
const program = new anchor.Program(idl, programId, provider);
```