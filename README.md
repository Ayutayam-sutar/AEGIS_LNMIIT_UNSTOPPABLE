# 🛡️ AEGIS Protocol: The Decentralized Inheritance & Secure Vault

## Project Overview

The AEGIS Protocol is a non-custodial, self-sovereign Dead Man's Switch and Security Vault built for responsible digital asset management on the EVM. AEGIS empowers owners to protect their digital wealth while they are alive and guarantees its secure transfer upon death or permanent inactivity.

Developed during **The Unstoppable Hackathon**.

### Key Problems Solved:

1.  **Inheritance Loss:** Assets are protected from being permanently frozen or lost due to the owner's death or total loss of access.
2.  **Wallet Security:** Provides a vital layer of protection against hacks, phishing, or coercion by implementing mandatory security delays on unauthorized transfers.

---

## ✨ Core Features & Innovations

### 1. Robust Dead Man's Switch
* **Heartbeat Mechanism:** The owner must periodically click the **"Pulse"** icon (`ping()` function) on the dashboard to reset the inactivity timer (`lastSeen`).
* **Automatic Unlock:** If the owner remains inactive for the predefined duration (e.g., 365 days), the vault unlocks for the beneficiary.
* **Manual Claim:** The designated beneficiary can execute the `claimInheritance()` function via the dashboard to securely receive all assets.

### 2. Secure Time-Lock Vault
* **Whitelist for Speed:** Transfers to trusted, pre-approved addresses (whitelist) are executed instantly.
* **Security Queue:** Transfers to any **unknown address** are automatically placed in a 24-hour time-locked queue.
* **Emergency Undo:** The owner can use the **"Emergency Undo"** function (`undoTransfer()`) to cancel any queued, time-locked transaction, offering a critical second chance against key compromises or coercion.

### 3. Decentralized Real-Time Data
* **Chainlink Price Feeds:** Integrates Chainlink Oracles to fetch the real-time, tamper-proof **USD valuation** of the vault's ETH balance directly on the dashboard, ensuring accurate and resilient financial monitoring.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Blockchain** | Solidity (v0.8.19) | Smart Contract Logic |
| **Development** | Hardhat / Foundry | Contract Compilation & Deployment |
| **Oracles** | Chainlink Price Feeds | ETH/USD Real-Time Data |
| **Frontend** | React, TypeScript | User Interface & Application Logic |
| **Web3** | Viem / Wagmi | Wallet and Contract Interaction |
| **Styling** | Tailwind CSS | Modern, Responsive UI Design |
| **Network** | Sepolia Testnet | Deployment Environment |

---

## ⚙️ Setup and Installation

### Prerequisites
* Node.js (v18+)
* Metamask Wallet (Configured for Sepolia Testnet)
* The `AegisVault.sol` contract must be deployed on Sepolia.

### Installation

```bash
# Clone the repository
git clone [YOUR_GITHUB_REPO_LINK]
cd aegis-protocol-dashboard

# Install all dependencies
npm install

# --- IMPORTANT CONFIGURATION STEP ---
# 1. Open src/constants.ts and replace the values:
#
# export const AEGIS_CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"
# export const AEGIS_ABI = [...] # Paste the full new contract ABI JSON

# 2. Start the application
npm run dev
# or
npm start

'''bash
##👨‍💻 Team
This project was developed by:

Siddharth Kumar Jena

Ashutosh Nayak

Ayutayam Sutar
