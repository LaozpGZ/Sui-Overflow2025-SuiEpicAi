# SuiEpicAi - AI-powered Blockchain Agent Platform

SuiEpicAi is a cutting-edge AI agent platform built on blockchain technology. It seamlessly integrates AI chat agents, social interaction features, and a unique tokenized incentive mechanism. Our goal is to empower users to easily create, discover, and trade AI agents, thereby making blockchain operations more intelligent and accessible.

**This project is being prepared for submission to the Sui Overflow 2025 hackathon.**

## Product Overview

SuiEpicAi combines three core elements:

- **AI Chat Agents**: Users can interact with and customize AI agents for various tasks, especially those related to blockchain.
- **Social Platform Integration**: Agents can be integrated into social platforms (like Telegram) for broader reach and interaction.
- **Tokenized Incentives**: A shares trading system allows users to invest in and benefit from the success of AI agents.

### Core Value Proposition

- **AI-Assisted Blockchain Interaction**: Simplifying complex blockchain tasks through intuitive AI agents.
- **Tokenizing User Value**: Turning contributions to the AI agent ecosystem into tradable digital assets.
- **Community-Driven Growth**: Fostering an ecosystem through social interaction and economic incentives.

## Key Features

- **AI Agent Creation & Management**: Tools to build and configure your own AI agents.
- **Agent Discovery & Trading**: A marketplace to find new agents and trade their shares.
- **Blockchain Integration**: Connect your wallet and perform on-chain operations seamlessly.
- **Social Connectivity**: Link agents to social platforms for interactive use.

## Project Structure

This project is organized as a monorepo using pnpm:

- `packages/frontend`: User interface built with Next.js, TypeScript, and Tailwind CSS.
- `packages/backend`: Rust-based backend service for APIs, database, and blockchain sync.
- `packages/contracts`: Sui Move smart contracts for core logic (shares, agents).
- `Docs`: Product documentation and analysis reports.

## Getting Started

To run SuiEpicAi locally:

### Prerequisites

- Suibase: [Installation Guide](https://suibase.io/how-to/install.html)
- Node.js (>= 20)
- pnpm (>= 9)

### Installation

```bash
git clone https://github.com/LaozpGZ/Sui-Overflow2025-SuiEpicAi.git
cd Sui-Overflow2025-SuiEpicAi
pnpm install
```

### Running

1.  **Start Local Sui Network:** `pnpm localnet:start`
2.  **Deploy Contracts:** `pnpm contracts:deploy` (Customize script in `packages/contracts/package.json`)
3.  **Fund Account:** `pnpm localnet:faucet 0xYOURADDRESS`
4.  **Run Backend:** Navigate to `packages/backend/server` and run `cargo run`.
5.  **Run Frontend:** `pnpm frontend:dev` (Access at [http://localhost:3000](http://localhost:3000))

## Documentation

- Product Analysis Report (中文): [Docs/产品经理视角项目分析报告.md](/Docs/产品经理视角项目分析报告.md)
- Frontend Specifics: [packages/frontend/README.md](/packages/frontend/README.md)
- Backend Specifics: [packages/backend/README.md](/packages/backend/README.md)
- Contracts Specifics: [packages/contracts/README.md](/packages/contracts/README.md)

## License

This project is licensed under the MIT License. Graphics are under CC-BY 4.0. See [LICENSE](/LICENSE) and [LICENSE-GRAPHICS](/LICENSE-GRAPHICS) for details.

## Contact

- GitHub Issues: [https://github.com/LaozpGZ/Sui-Overflow2025-SuiEpicAi/issues](https://github.com/LaozpGZ/Sui-Overflow2025-SuiEpicAi/issues)
- Discord: (Add your Discord link here if you have one)
