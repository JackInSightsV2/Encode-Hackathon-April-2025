Nice — here's a full **frontend task list** tailored to your updated plan:

---

## ✅ **Goal**  
Build a React or Next.js frontend that:
1. Connects to a Solana wallet (e.g. Phantom or Backpack, *not* MetaMask — since Solana ≠ EVM)
2. Lets users **register AI agents**
3. Lets users **view and invoke** agents
4. Shows the **endpoint URL** of each agent (after payment)

---

## 🧩 **Frontend Task List**

### 🔌 1. Wallet Integration
- [x] Install `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets`, `@solana/web3.js`, `@project-serum/anchor`
- [x] Set up wallet adapter provider
- [x] Add connect/disconnect wallet button
- [x] Show connected public key

---

### 🗂️ 2. Agent Registration Form
- [x] UI form:
  - Agent name (string)
  - Description (textarea)
  - Endpoint URL (string)
  - Price (in SOL or lamports)
- [x] On submit:
  - Call Anchor `register_agent()` instruction
  - Show tx status + toast notification
- [x] Display confirmation on success (maybe with agent preview)
- [x] Added live preview toggle to see agent card before registration

---

### 📜 3. Fetch & Display Agent List
- [x] Query all `Agent` accounts on-chain (via Anchor or `getProgramAccounts`)
- [x] Render agents in a card/grid view:
  - Name
  - Description
  - Price (formatted as SOL)
- [x] Show "Use Agent" button for each

---

### 💰 4. Invoke Agent (Pay-to-Use Flow)
- [x] On "Use Agent" click:
  - Prompt for optional input (if needed)
  - Call `invoke_agent()` and send required lamports
- [x] On tx confirmation:
  - Unlock the **API endpoint URL**
  - Optionally: show it in a modal or auto-copy to clipboard
  - Added simulated agent response based on input
  - Added confetti effect on unlock

---

### 🧠 5. My Registered Agents View
- [x] Add a tab or page: "My Agents"
- [x] Filter by `agent.owner == wallet.publicKey`
- [x] Show call count (`total_calls`)
- [x] Add edit/delete actions (optional)

---

### 🎁 6. UI/UX & Styling
- [x] Clean dashboard layout with Solana-themed design (dark mode with purple accents)
- [x] Responsive design (mobile-optimized)
- [x] Status indicators for transactions (loading/success/error)
- [x] SOL price formatting helper
- [x] Tooltips for "What is this?" (e.g., endpoint)
- [x] Consistent navigation with Navbar
- [x] Glowing effects and gradients matching Solana style
- [x] Proper typography and spacing
- [x] Improved card components with hover effects
- [x] Enhanced registration form with live preview

---

### ⚒️ Optional / Stretch Tasks
- [x] Animate endpoint reveal with confetti 🎉
- [x] Custom background effects (glowing orbs, grid patterns)
- [ ] Support real-time agent logs (via WebSocket + Solana logs)
- [x] Page layout components for consistent UI
- [ ] ENS-style domain names for agents
- [ ] Rating system or ❤️ button

---

## 🧱 Suggested File Structure (Next.js)
```
/src
  /components
    /ui
      AgentCard.tsx
      StatusIndicator.tsx
      Tooltip.tsx
    AgentForm.tsx
    WalletConnectButton.tsx
    Navbar.tsx
    PageLayout.tsx
  /app
    page.tsx          ← all agents
    /my-agents
    /register
  /utils
    solanaFormatters.ts     ← SOL price helpers
    solanaStyling.ts     ← Styling constants
```
