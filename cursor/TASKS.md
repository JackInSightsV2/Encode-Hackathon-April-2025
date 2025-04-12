**Part 1: Solana Program (Rust via Anchor)** 

to power your **AI Agent Marketplace** on Solana.

---

## 🔧 **1. Solana Program (Rust via Anchor)**  
This is the core of your project — it defines and manages agents, handles registrations, and validates payments.

---

### 🏗️ **Setup & Boilerplate**
- [ ] Install Solana CLI, Anchor CLI, and set up a wallet (e.g., `solana-keygen new`)
- [ ] Initialize project:  
  ```bash
  anchor init agentx --javascript
  ```
- [ ] Set cluster to devnet:  
  ```bash
  solana config set --url https://api.devnet.solana.com
  ```

---

### 📦 **Accounts & Structs**
Define the two core account types.

#### ✅ Agent Account
```rust
#[account]
pub struct Agent {
    pub name: String,
    pub description: String,
    pub endpoint: String,
    pub price: u64, // in lamports
    pub owner: Pubkey,
}
```

- [ ] Add size limit for fields (`#[max_len]` for name/description if using Anchor 0.29+)
- [ ] Calculate account space and initialize accordingly in registration

#### ✅ AgentInvocation Log (optional)
You can track invocations on-chain, or just verify them off-chain.

---

### 🧠 **Instructions (Functions in Anchor)**

#### 1. `register_agent(ctx, name, description, endpoint, price)`
- [ ] Validate input size
- [ ] Allocate and initialize Agent account
- [ ] Store all details in the Agent struct
- [ ] Set agent owner as `ctx.accounts.user.key()`

```rust
#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(init, payer = user, space = 8 + MAX_AGENT_SIZE)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

---

#### 2. `invoke_agent(ctx, agent: Pubkey)`
- [ ] Ensure enough lamports are sent via CPI to agent owner
- [ ] Validate the Agent exists
- [ ] Optionally emit an event or store a log

```rust
#[derive(Accounts)]
pub struct InvokeAgent<'info> {
    #[account(mut)]
    pub agent: Account<'info, Agent>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

- [ ] Transfer lamports from user to agent.owner
- [ ] Optional: add basic reentrancy guard or rate-limit via timestamp

---

### 🧪 **Testing (Local)**

- [ ] Add tests in `/tests/agentx.js` (Anchor auto-generates test file)
- [ ] Write test to:
  - Register an agent
  - Call `invoke_agent`
  - Assert balances and state updates

---

### 🚀 **Build & Deploy**
- [ ] Build program:  
  ```bash
  anchor build
  ```
- [ ] Deploy to devnet:  
  ```bash
  anchor deploy
  ```
- [ ] Note the program ID from `.anchor/program-id.json`

---

### 📝 **IDL Generation**
- [ ] Anchor will generate the IDL in `/target/idl/agentx.json`
- [ ] Use this in your **frontend** and **backend** to interact with the program

---

### ✅ Optional Features
- [ ] Add a `category` or `tags` field to Agent
- [ ] Add a `rating` or `usage_counter` to Agent
- [ ] Emit custom events (e.g., `AgentInvoked`, `AgentRegistered`)
- [ ] Use PDA for deterministic agent account address (based on owner + name)

---


**Part 2: Backend (Python FastAPI)** 

---

## ⚙️ **2. Backend – Python (FastAPI)**  
This service receives user input + a transaction signature, verifies the payment on Solana, and responds by calling the appropriate AI agent (e.g., GPT-powered).

---

### 📁 **Project Structure**
```bash
backend/
├── main.py
├── routes/
│   └── agent.py
├── services/
│   ├── solana.py         # Payment verification
│   └── ai_agent.py       # Logic for each AI agent
├── utils/
│   └── hash.py           # Optional input hashing or validation
├── models/
│   └── request.py        # Pydantic request models
├── requirements.txt
└── README.md
```

---

### ✅ **Core Tasks**

### 1. 🧠 **AI Agent Handler**
Create endpoints to run your AI agents.

- [ ] Endpoint: `POST /agent/{agent_id}/invoke`
  - Input: `tx_signature`, `user_input`
  - Logic:
    - Verify the transaction with Solana RPC
    - If valid, route to agent function (e.g., summarizer, joke bot)
    - Return response

**Example Pydantic model:**
```python
class InvokeRequest(BaseModel):
    tx_signature: str
    user_input: str
```

---

### 2. 🔍 **Solana Payment Verification**
- [ ] Use `solana-py` or raw HTTP call to devnet RPC:
  - Confirm tx exists
  - Confirm lamports ≥ expected price
  - Confirm `agent_program_id` as destination
- [ ] Cache or store recent txs (optional)

```bash
pip install solana
```

**Example check:**
```python
from solana.rpc.api import Client
solana = Client("https://api.devnet.solana.com")
tx = solana.get_confirmed_transaction(tx_signature)
```

- [ ] Make sure the tx used `invoke_agent` on your program
- [ ] Confirm user paid agent owner or program address

---

### 3. 🧠 **Agent Logic Module**
- [ ] Add function for each agent (you can hardcode them)
  - e.g., `summarize_text(prompt)`, `joke_bot()`, etc.
- [ ] Use `openai`, `transformers`, or custom logic
- [ ] Protect against prompt injection or abuse

---

### 4. 🚦 **FastAPI App & Routing**
- [ ] Basic `main.py` to include routes from `routes/agent.py`
- [ ] Exception handling (bad tx, invalid input)
- [ ] JSON response structure:
```json
{
  "status": "success",
  "result": "Here's your summary..."
}
```

---

### 5. 🔐 **Security & Abuse Protection**
- [ ] Add simple abuse throttling (rate limit by IP or session)
- [ ] Reject txs older than X minutes (optional)
- [ ] Validate inputs (no empty prompts, max length, etc.)

---

### 6. 🚀 **Deployment**
- [ ] Deploy to **Replit**, **Render**, **Railway**, or **Fly.io**
- [ ] Enable CORS for frontend calls
- [ ] Add `.env` for config:
  - RPC URL, OpenAI key (if used), trusted program ID

---

### 7. 🧪 **Testing**
- [ ] Local test script with:
  - Simulated tx_signature
  - Sample user input
- [ ] Add FastAPI test with `TestClient`

---

### 🔁 Bonus (Optional)
- [ ] Add webhook from the frontend after `invoke_agent` is called
- [ ] Add Redis or SQLite to log past invocations per agent
- [ ] Expose a `/health` and `/version` endpoint

---

## 🎨 **3. Frontend – Next.js + Tailwind + Solana Wallet Adapter**

---

### 🧱 **Project Structure**
```
frontend/
├── app/ or pages/
├── components/
│   ├── AgentCard.tsx
│   ├── WalletConnectButton.tsx
│   ├── InvokeModal.tsx
├── lib/
│   ├── solana.ts          # Solana connection & program interaction
│   └── agents.ts          # Agent IDL + helper functions
├── styles/
├── public/
├── tailwind.config.ts
├── wallet/
│   └── provider.tsx       # Solana wallet adapter config
└── tsconfig.json
```

---

### 🧠 **Core Tasks**

---

### **1. Wallet Integration**
- [ ] Install and configure `@solana/wallet-adapter` packages
- [ ] Setup `WalletProvider` in `_app.tsx` or layout file
- [ ] Support Phantom and Backpack wallets
- [ ] Build `WalletConnectButton` component
  - Show wallet address when connected
  - Disable interaction if not connected

---

### **2. Agent Marketplace UI**
- [ ] Fetch all agent accounts from Solana program (via Anchor IDL or direct RPC)
- [ ] Build and style `AgentCard` component:
  - Display: name, description, price (converted to SOL), owner address
  - Include "Invoke Agent" button
- [ ] Responsive grid layout of agents
- [ ] Add skeleton loader during fetch

---

### **3. Invoke Agent Flow**
- [ ] Build `InvokeModal`:
  - Show prompt input or form depending on agent
  - Submit button triggers Solana transaction
- [ ] On invoke:
  - Call `invoke_agent` instruction (pass lamports)
  - Await confirmation
  - Then send `txSignature`, `agentId`, and input to backend via `POST`
  - Show result in modal or message box

---

### **4. Solana Program Interaction**
- [ ] Create `lib/solana.ts`:
  - Setup Anchor provider and program instance
  - Expose `registerAgent()` and `invokeAgent()` helpers
- [ ] Use devnet and correct program ID from Anchor deployment
- [ ] Convert lamports → SOL for display

---

### **5. UI/UX & Styling (Tailwind)**
- [ ] Global styling using Tailwind (dark/light theme optional)
- [ ] Add loading spinners for wallet connect, tx in progress, and AI response
- [ ] Toast notifications for:
  - Wallet errors
  - Tx success/failure
  - Backend errors
- [ ] Handle all error states gracefully (e.g., wallet not connected)

---

### **6. Agent Upload (Admin-only / Dev Tool)**
- [ ] Build a dev-only page to register new agents
  - Form: name, description, endpoint URL, price in SOL
  - Calls `register_agent` on Solana program
- [ ] Protect access by wallet address or env flag

---

### **7. Deployment**
- [ ] Deploy to **Vercel**
- [ ] Set up `.env.local` with:
  - Solana cluster endpoint (e.g. devnet)
  - Program ID
  - Backend base URL

---

### **8. Extras / Nice-to-Have**
- [ ] Add agent filtering (e.g., "text", "image", "utility")
- [ ] Show agent usage count (from on-chain or backend logs)
- [ ] Store last used inputs per session (localStorage)
- [ ] Add “Try it” for guest mode with simulated tx

---

## 🛠️ **4. Developer Tooling**

> Focus: Enable AI developers to easily **register**, **test**, and **manage** their AI agents on the platform, either via a web UI or CLI script.

---

### 🧠 **Modes of Access**
- [ ] **Web-Based Admin Panel** (preferred for UX)
- [ ] **CLI Script** (optional, fast for devs)

---

### **1. Web Admin Interface (Protected Page)**
- [ ] Create `/register-agent` page in Next.js
- [ ] Restrict access:
  - [ ] Only show form if wallet is connected
  - [ ] Optional: Check if wallet is in an `ADMIN_WALLETS` allowlist
- [ ] Agent Registration Form:
  - [ ] Input fields: Name, Description, Price (in SOL), Endpoint URL
  - [ ] (Optional) Tags or category dropdown
  - [ ] Form validation (max length, price ≥ min, valid URL)

---

### **2. Agent Registration Transaction**
- [ ] On form submit:
  - [ ] Convert price from SOL → lamports
  - [ ] Call `register_agent()` instruction via Anchor
  - [ ] Await transaction confirmation
  - [ ] Show success toast or error

---

### **3. Local Agent Test Tool**
- [ ] Build a small `pages/dev-test.tsx` or CLI tool to:
  - [ ] Input an agent ID or public key
  - [ ] Prompt user input
  - [ ] Call backend with dummy tx_signature + input
  - [ ] Display output

---

### **4. CLI Script (Optional)**
- [ ] Write a Python or Node.js script that:
  - [ ] Takes in agent info from CLI args or JSON file
  - [ ] Connects to Solana devnet
  - [ ] Calls Anchor program `register_agent()`
  - [ ] Returns the agent public key and tx hash

---

### **5. Agent Management (Optional for MVP)**
- [ ] Add a dashboard view:
  - [ ] List all agents created by the connected wallet
  - [ ] Show name, description, price, total usage (if tracked)
  - [ ] Add edit or “retire agent” button (future feature)

---

### **6. Input Validation & Safeguards**
- [ ] Ensure:
  - Agent name max length (32–64 chars)
  - Price > 0 SOL
  - Endpoint is a valid, reachable URL
  - Description is safe (prevent script injection)
- [ ] Optional backend ping to test if the agent endpoint is online

---

### **7. Metadata Publishing (Optional)**
- [ ] Store agent metadata on IPFS:
  - Name, Description, Endpoint, Price
  - Upload JSON to IPFS (web3.storage or Pinata)
  - Save IPFS hash in Solana agent struct

---

### **8. Dev Feedback & Debug Tools**
- [ ] Add console logs for dev/debug mode
- [ ] Track failed agent registration attempts
- [ ] Display last 5 registrations from the dev wallet
- [ ] (Optional) Slack webhook or Discord bot to log new agents

---

## 🚀 **5. Deployment**

> Focus: Deploy the **Solana Program**, **Backend (FastAPI)**, and **Frontend (Next.js)** — all live and integrated with each other.

---

### 🔷 **1. Solana Program Deployment (Anchor)**

- [ ] Set RPC cluster to `devnet`:  
  ```bash
  solana config set --url https://api.devnet.solana.com
  ```
- [ ] Build and deploy the Anchor program:
  ```bash
  anchor build
  anchor deploy
  ```
- [ ] Record and commit the `PROGRAM_ID` from `target/idl/*.json`
- [ ] Verify deployment via:  
  ```bash
  solana program show <PROGRAM_ID>
  ```

- [ ] Export and include **IDL JSON** in frontend and backend

---

### 🛰️ **2. Backend Deployment (FastAPI)**

#### Hosting Options:
- [ ] Use **Render**, **Railway**, **Fly.io**, or **Replit**

#### Tasks:
- [ ] Add `Procfile` or startup script:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port 8000
  ```
- [ ] Set environment variables:
  - `SOLANA_RPC_URL`
  - `PROGRAM_ID`
  - `ALLOWED_ORIGINS`
  - (Optional) `OPENAI_API_KEY`

- [ ] Enable CORS for frontend domain
- [ ] Add healthcheck route: `GET /health`
- [ ] Confirm it accepts POSTs from frontend with real Solana tx signatures
- [ ] Log invocations and backend agent activity (print or file)

---

### 🌐 **3. Frontend Deployment (Next.js + Tailwind)**

#### Hosting: [Vercel](https://vercel.com) (preferred for Next.js)

- [ ] Push code to GitHub (public or private repo)
- [ ] Connect GitHub to Vercel
- [ ] Set environment variables in Vercel:
  - `NEXT_PUBLIC_PROGRAM_ID`
  - `NEXT_PUBLIC_BACKEND_URL`
  - `NEXT_PUBLIC_SOLANA_RPC_URL`
- [ ] Configure base path or proxy if needed

- [ ] Confirm wallet connect works in deployed build
- [ ] Confirm agent call triggers tx and backend fetch

---

### ✅ **4. Final Integration Tests**

- [ ] Test full flow:
  1. Connect wallet
  2. View agent marketplace
  3. Register agent (if building dev tool)
  4. Invoke agent → pay → get response
- [ ] Use Phantom Wallet + Solana Devnet SOL
- [ ] Share test agent for demo

---

### 🪪 **5. DNS / Branding (Optional)**
- [ ] Set custom domain on Vercel (e.g. `agentx.ai`)
- [ ] Add favicon, meta tags, and preview image

---

### 🧪 **6. Debugging & Observability**
- [ ] Enable logging in:
  - Anchor (via `solana logs`)
  - FastAPI (`print` or structured logs)
  - Next.js (`console` in browser/devtools)
- [ ] Setup GitHub Actions or manual CI if needed

---
