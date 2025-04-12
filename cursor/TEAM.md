## 🧑‍💻 **Team Structure – Roles & Responsibility**

---

### 🧠 **Team Member 1: Solana Program Lead (Anchor / Rust)**  
**Primary Goal:** Build and deploy the on-chain logic.

#### Responsibilities:
- [ ] Set up and scaffold Anchor program
- [ ] Implement `register_agent` and `invoke_agent`
- [ ] Handle account constraints and lamport transfers
- [ ] Emit events or logs for frontend/backend to track
- [ ] Test locally using Anchor’s test suite
- [ ] Deploy to **Solana Devnet**, share Program ID & IDL

#### Optional Skills:
- Rust, Anchor, Solana CLI

---

### 🔌 **Team Member 2: Backend Lead (Python FastAPI)**  
**Primary Goal:** Host the AI agents and verify transactions.

#### Responsibilities:
- [ ] Build FastAPI backend project
- [ ] Add route to receive user input and `tx_signature`
- [ ] Use `solana-py` to verify tx (sender, amount, target)
- [ ] Host at least one AI agent (e.g., summarizer or GPT bot)
- [ ] Integrate with frontend and support dynamic agent routing
- [ ] Deploy on **Render**, **Railway**, or **Fly.io**

#### Optional Skills:
- Python, FastAPI, Solana RPC, AI libraries (OpenAI, transformers)

---

### 🎨 **Team Member 3: Frontend Lead (Next.js + Tailwind)**  
**Primary Goal:** Build the agent marketplace and connect wallets.

#### Responsibilities:
- [ ] Set up Next.js + Tailwind
- [ ] Integrate Solana wallet (Phantom/Backpack) using `@solana/wallet-adapter`
- [ ] Build AgentCard UI and modal for invoking agents
- [ ] Handle tx signing and invoking program methods
- [ ] Display AI response from backend
- [ ] Deploy frontend via **Vercel**

#### Optional Skills:
- React, Tailwind, Solana web3.js, UX polish

---

### 🧰 **Team Member 4: Dev Tools & Integration Lead**  
**Primary Goal:** Build registration tooling + coordinate system-wide integration.

#### Responsibilities:
- [ ] Create `/register-agent` admin page (form + tx)
- [ ] Write CLI script for devs to register agents (optional)
- [ ] Help test end-to-end flow (wallet → tx → AI response)
- [ ] Assist with error handling and logging
- [ ] Help deploy and debug frontend/backend cross-issues

#### Bonus:
- [ ] Build `/health`, `/status`, and test utilities
- [ ] Track all program IDs, RPC URLs, test wallets, and endpoints

---

## 🧩 **How You Collaborate**

- 🗂️ Shared **GitHub repo** with monorepo-style structure:
  ```
  /solana-program/
  /backend/
  /frontend/
  /shared-docs/
  ```

- ✅ Setup basic contracts on Day 1 so frontend/backend can start integrating early
- 🔁 Daily quick stand-ups (30 mins) to realign + pair on blockers
- 📋 Use Notion/Board/Discord to track task checklist & owners

---

Use rules.mcp to guide AI conversaions, you have TASKS.md to see what needs to be done. 