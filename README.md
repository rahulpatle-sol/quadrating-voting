# 🗳️ Quadratic Voting on Solana

<div align="center">

![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Anchor](https://img.shields.io/badge/Anchor-6F4E37?style=for-the-badge&logo=anchor&logoColor=white)

**A decentralized voting system implementing quadratic voting on the Solana blockchain**

[Features](#-features) •
[Demo](#-demo) •
[Installation](#-installation) •
[Usage](#-usage) •
[Testing](#-testing) •
[Documentation](#-documentation)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [What is Quadratic Voting?](#-what-is-quadratic-voting)
- [Features](#-features)
- [Demo](#-demo)
- [How It Works](#-how-it-works)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

This project implements a **quadratic voting system** on the Solana blockchain using the Anchor framework. Quadratic voting is a more democratic voting mechanism where voters can express not just **what** they prefer, but **how much** they care about each option.

### Why Quadratic Voting?

Traditional voting (one person, one vote) doesn't capture preference intensity. With quadratic voting:
- ✅ Express **how strongly** you feel about issues
- ✅ Prevent **tyranny of the majority**
- ✅ More **efficient** collective decision-making
- ✅ **Fair** allocation of voting power

---

## 🧮 What is Quadratic Voting?

In quadratic voting, the **cost** to cast votes increases quadratically:

| Votes Cast | Credits Cost | Formula |
|------------|--------------|---------|
| 1 vote | 1 credit | 1² = 1 |
| 2 votes | 4 credits | 2² = 4 |
| 3 votes | 9 credits | 3² = 9 |
| 5 votes | 25 credits | 5² = 25 |
| 10 votes | 100 credits | 10² = 100 |

### Example Scenario

**Traditional Voting:**
- 51 people slightly prefer Option A → **Option A wins**
- 49 people strongly prefer Option B → **Option B loses**

**Quadratic Voting:**
- 51 people cast 1 vote each for A = 51 votes (51 credits)
- 49 people cast 3 votes each for B = 147 votes (441 credits)
- **Option B wins** because people cared more!

---

## ✨ Features

### Core Functionality
- 🗳️ **Create Polls** - Create polls with up to 10 voting options
- 👥 **Register Voters** - Voters register with allocated vote credits
- 🎯 **Cast Votes** - Vote using quadratic cost formula
- 🔒 **Close Polls** - Authority can close polls and view results
- 📊 **Real-time Results** - Track votes on-chain in real-time

### Technical Features
- ⚡ **Fast** - Built on Solana for high-speed transactions
- 🔐 **Secure** - Anchor framework with built-in safety checks
- 💰 **Cost-effective** - Low transaction fees on Solana
- 🏗️ **Decentralized** - No central authority controls voting
- ✅ **Auditable** - All votes recorded on-chain permanently

### Smart Contract Features
- 🛡️ **Overflow Protection** - Checked arithmetic operations
- 🔑 **Access Control** - Only poll creators can close polls
- 📝 **State Management** - Efficient PDA-based account structure
- 🎨 **Error Handling** - Comprehensive error messages

---

## 🎬 Demo

### Live Program
```
Program ID: 2QSbhTqaFrhpKKvyNVB9UucJ5gJzdyqjRA6i7CATNLut
Network: Localnet/Devnet
```

### Test Results
```
🏆 FINAL POLL RESULTS
==================================================
📊 Poll: "Best Programming Language"
📝 Description: "Vote for your favorite programming language"
──────────────────────────────────────────────────
🦀 Option 0 (Rust):       7 votes
📘 Option 1 (TypeScript): 7 votes
🐍 Option 2 (Python):     3 votes
🔷 Option 3 (Go):         0 votes
==================================================

✅ 11 passing tests
⚡ 5 seconds execution time
```

---

## ⚙️ How It Works

### 1. Create a Poll
```rust
// Poll creator initializes a poll with options
create_poll(
    title: "Favorite Language",
    description: "Vote for your favorite",
    option_count: 4
)
```

### 2. Register Voters
```rust
// Each voter registers with vote credits
register_voter(credits: 100)
```

### 3. Cast Votes (Quadratic Cost)
```rust
// Cast 5 votes on option 0
cast_vote(option_index: 0, votes: 5)
// Cost = 5² = 25 credits

// Add 2 more votes on option 0
cast_vote(option_index: 0, votes: 2)
// Cost = 7² - 5² = 24 credits
```

### 4. View Results
```rust
// Poll authority closes poll
close_poll()
// Results displayed on-chain
```

---

## 📥 Installation

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install) (1.75.0+)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (1.18.0+)
- [Anchor](https://www.anchor-lang.com/docs/installation) (0.29.0+)
- [Node.js](https://nodejs.org/) (18.0.0+)
- [Yarn](https://yarnpkg.com/getting-started/install)

### Clone Repository
```bash
git clone https://github.com/yourusername/quadratic-voting-solana.git
cd quadratic-voting-solana
```

### Install Dependencies
```bash
# Install Node packages
yarn install

# Build the program
anchor build
```

### Configure Solana
```bash
# Set to localnet for development
solana config set --url localhost

# Or use devnet for testing
solana config set --url devnet

# Create a keypair if you don't have one
solana-keygen new
```

---

## 🚀 Usage

### Start Local Validator
```bash
solana-test-validator
```

### Deploy Program
```bash
# Build
anchor build

# Deploy to localnet
anchor deploy

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Run Tests
```bash
# Run all tests
anchor test

# Run tests (skip deployment)
anchor test --skip-deploy

# Use automated script
./run_tests.sh
```

### Interact with Program

#### Using Anchor Client (TypeScript)
```typescript
import * as anchor from "@coral-xyz/anchor";

// Connect to program
const program = anchor.workspace.QuadraticVoting;

// Create a poll
await program.methods
  .createPoll("Best Language", "Vote for your favorite", 3)
  .accounts({ ... })
  .rpc();

// Register as voter
await program.methods
  .registerVoter(new anchor.BN(100))
  .accounts({ ... })
  .rpc();

// Cast votes
await program.methods
  .castVote(0, new anchor.BN(5))
  .accounts({ ... })
  .rpc();
```

---

## 📁 Project Structure

```
quadratic-voting/
├── programs/
│   └── quadratic_voting/
│       ├── src/
│       │   ├── lib.rs              # Main program entry
│       │   ├── contexts/           # Instruction contexts
│       │   │   ├── create_poll.rs
│       │   │   ├── register_voter.rs
│       │   │   ├── cast_vote.rs
│       │   │   └── close_poll.rs
│       │   └── state/              # State structs
│       │       ├── poll.rs         # Poll account
│       │       └── voter.rs        # Voter account
│       ├── Cargo.toml
│       └── Xfg.toml
├── tests/
│   └── quadratic_voting.ts        # Integration tests
├── Anchor.toml                     # Anchor configuration
├── package.json
└── README.md
```

---

## 🧪 Testing

### Run All Tests
```bash
anchor test
```

### Test Coverage
- ✅ **Poll Creation** - Create polls with options
- ✅ **Voter Registration** - Register with credits
- ✅ **Vote Casting** - Cast votes with quadratic cost
- ✅ **Incremental Voting** - Add more votes to existing choices
- ✅ **Credit Validation** - Reject votes with insufficient credits
- ✅ **Poll Closure** - Close polls and prevent further voting
- ✅ **Access Control** - Only authority can close polls
- ✅ **Error Handling** - All edge cases covered

### Test Results
```bash
  quadratic_voting
    ✔ Creates a poll (512ms)
    ✔ Registers voter 1 with 100 credits (423ms)
    ✔ Registers voter 2 with 50 credits (401ms)
    ✔ Voter 1 casts 5 votes for Rust (445ms)
    ✔ Voter 1 adds 2 more votes for Rust (432ms)
    ✔ Voter 1 casts 3 votes for Python (418ms)
    ✔ Voter 2 casts 7 votes for TypeScript (441ms)
    ✔ Fails when voter has insufficient credits (392ms)
    ✔ Closes the poll (405ms)
    ✔ Fails to vote on closed poll (371ms)
    ✔ Displays final results (198ms)

  11 passing (5s)
```

---

## 🌐 Deployment

### Deploy to Devnet
```bash
# Configure devnet
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Build and deploy
anchor build
anchor deploy --provider.cluster devnet

# Upload IDL
anchor idl init -f target/idl/quadratic_voting.json <PROGRAM_ID> --provider.cluster devnet
```

### Deploy to Mainnet
```bash
# Configure mainnet
solana config set --url mainnet-beta

# Ensure you have SOL for deployment
solana balance

# Build
anchor build

# Deploy (requires ~2-5 SOL)
anchor deploy --provider.cluster mainnet-beta
```

### View on Explorers
- **Solana Explorer**: `https://explorer.solana.com/address/<PROGRAM_ID>`
- **SolScan**: `https://solscan.io/account/<PROGRAM_ID>`
- **Solana Beach**: `https://solanabeach.io/address/<PROGRAM_ID>`

---

## 📚 API Reference

### Instructions

#### `create_poll`
Creates a new poll.

**Parameters:**
- `title: String` - Poll title (max 100 chars)
- `description: String` - Poll description (max 500 chars)
- `option_count: u8` - Number of options (1-10)

**Accounts:**
- `poll: Account<Poll>` - Poll PDA (initialized)
- `authority: Signer` - Poll creator
- `system_program: Program`

**Example:**
```rust
create_poll(
    "Best Framework",
    "Vote for your favorite web framework",
    4
)
```

---

#### `register_voter`
Registers a voter for a poll.

**Parameters:**
- `credits: u64` - Vote credits to allocate

**Accounts:**
- `voter_account: Account<Voter>` - Voter PDA (initialized)
- `poll: Account<Poll>` - Target poll
- `voter: Signer` - Voter public key
- `system_program: Program`

**Example:**
```rust
register_voter(100)  // 100 vote credits
```

---

#### `cast_vote`
Casts votes on a poll option.

**Parameters:**
- `option_index: u8` - Option to vote for (0-based)
- `votes: u64` - Number of votes to cast

**Accounts:**
- `voter_account: Account<Voter>` - Voter PDA
- `poll: Account<Poll>` - Target poll
- `voter: Signer` - Voter public key

**Cost Formula:**
```
Cost = (current_votes + new_votes)² - current_votes²
```

**Example:**
```rust
cast_vote(0, 5)  // Cast 5 votes on option 0 (costs 25 credits)
```

---

#### `close_poll`
Closes a poll (authority only).

**Parameters:** None

**Accounts:**
- `poll: Account<Poll>` - Poll to close
- `authority: Signer` - Poll authority (must match)

**Example:**
```rust
close_poll()
```

---

### State Accounts

#### `Poll`
Stores poll information.

**Fields:**
- `authority: Pubkey` - Poll creator
- `title: String` - Poll title
- `description: String` - Poll description
- `option_count: u8` - Number of options
- `votes: Vec<u64>` - Vote counts per option
- `is_active: bool` - Poll status
- `bump: u8` - PDA bump seed

**PDA Seeds:** `["poll", authority, title]`

---

#### `Voter`
Stores voter information.

**Fields:**
- `poll: Pubkey` - Associated poll
- `voter: Pubkey` - Voter public key
- `credits_remaining: u64` - Unused credits
- `total_credits: u64` - Initial allocation
- `votes_cast: Vec<u64>` - Votes per option
- `bump: u8` - PDA bump seed

**PDA Seeds:** `["voter", poll, voter_pubkey]`

---

## 💡 Examples

### Example 1: Community Feature Voting
```typescript
// DAO wants to prioritize 3 features from 5 options
// Each member gets 100 credits

// Alice really wants dark mode
await castVote(0, 10);  // Dark mode: 10 votes = 100 credits

// Bob wants multiple features
await castVote(0, 5);   // Dark mode: 5 votes = 25 credits
await castVote(1, 5);   // API: 5 votes = 25 credits
await castVote(2, 5);   // Mobile: 5 votes = 25 credits
await castVote(3, 5);   // Plugins: 5 votes = 25 credits

// Result: Both preferences counted, weighted by intensity
```

### Example 2: Budget Allocation
```typescript
// Allocate $1M across 4 projects
// 100 members, each with 100 credits

// Project priorities reflected in vote distribution
// High passion = more votes = more budget
```

### Example 3: Governance Proposals
```typescript
// Vote on multiple proposals simultaneously
// Express strong support on critical issues
// Moderate support on less important issues
```

---

## 🔧 Configuration

### Anchor.toml
```toml
[programs.localnet]
quadratic_voting = "<PROGRAM_ID>"

[programs.devnet]
quadratic_voting = "<PROGRAM_ID>"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"
```

### Environment Variables
```bash
# Set Solana cluster
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899

# Set wallet
export ANCHOR_WALLET=~/.config/solana/id.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow Rust best practices
- Add tests for new features
- Update documentation
- Run `anchor test` before submitting

---

## 🐛 Known Issues

- **Airdrop failures**: Retry mechanism implemented in tests
- **Rate limiting**: Wait 2s between airdrops on localnet

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourtwitter](https://twitter.com/yourtwitter)

---

## 🙏 Acknowledgments

- [Solana Labs](https://solana.com/) - For the amazing blockchain
- [Coral/Anchor](https://www.anchor-lang.com/) - For the Anchor framework
- [Glen Weyl](https://www.radicalxchange.org/) - For quadratic voting research
- [Gitcoin](https://gitcoin.co/) - For popularizing quadratic funding

---

## 📖 Resources

### Learn More About Quadratic Voting
- [Radical Markets Book](https://www.radicalmarkets.com/)
- [Vitalik Buterin on QV](https://vitalik.ca/general/2019/12/07/quadratic.html)
- [RadicalxChange Foundation](https://www.radicalxchange.org/)
- [Gitcoin Grants](https://gitcoin.co/grants/)

### Solana Development
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Stack Exchange](https://solana.stackexchange.com/)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Built with ❤️ on Solana**

![Made with Rust](https://img.shields.io/badge/Made%20with-Rust-orange?style=flat-square)
![Powered by Solana](https://img.shields.io/badge/Powered%20by-Solana-purple?style=flat-square)
![Uses Anchor](https://img.shields.io/badge/Uses-Anchor-brown?style=flat-square)

</div>