# EthJobs Escrow Contract

A decentralized escrow system for job payments using PYUSD tokens on Ethereum Sepolia testnet.



## Overview

This project implements a smart contract system for job escrows using PYUSD tokens with integrated GitHub issue verification.

**Key Components:**
1. **EthJobsEscrow**: Main escrow contract for job payments - 0x84c823a0E11ad6c0Da9021e8311e4A031E4256F4
2. **GitHubVerifier**: Chainlink Functions integration for GitHub issue verification - 0xBdfA8353BB214Fe6b52f68C59d7C662464f96C81

## How It Works

### 1. Job Lifecycle Flow
```
Create Job → Verify GitHub Issue → Approve PYUSD → Fund Job → Complete/Refund
```

1. **Create Job**: Call `createJob()` to create a new job escrow
2. **Verify Issue**: Use `GitHubVerifier` to check if the issue is payable
3. **Approve PYUSD**: Approve the escrow contract to spend your PYUSD tokens
4. **Fund Job**: Call `fundJob()` to transfer PYUSD into the contract
5. **Complete/Refund**: Release funds to employee (with automatic verification) or refund to employer

**Note**: When calling `releaseFunds()`, the contract automatically verifies the GitHub issue is payable before releasing funds.

### 2. Job States
- **Created**: Job is created but not yet funded
- **Funded**: PYUSD has been transferred to the contract
- **Completed**: Funds released to employee
- **Refunded**: Funds returned to employer (after deadline)

## Contract Features

### EthJobsEscrow
- ✅ **Multiple Jobs**: Single contract handles unlimited jobs
- ✅ **Job Management**: Create, fund, release, and refund jobs
- ✅ **PYUSD Integration**: Full ERC20 token support
- ✅ **Access Control**: Only employers can manage their own jobs
- ✅ **Deadline Enforcement**: Automatic refund eligibility
- ✅ **Event Emission**: Full transparency for all actions
- ✅ **Query Functions**: Get job details, employer/employee jobs
- ✅ **Automatic GitHub Verification**: Calls GitHubVerifier before releasing funds

### GitHubVerifier
- ✅ **Chainlink Functions Integration**: Decentralized oracle network for external API calls
- ✅ **GitHub Issue Verification**: Checks if GitHub issues are payable via API
- ✅ **Automated Verification**: Uses JavaScript code executed by Chainlink Functions
- ✅ **Result Storage**: Stores verification results on-chain
- ✅ **Event Tracking**: Emits events for verification requests and results
- ✅ **Owner Controls**: Only contract owner can initiate verifications

## Usage

### 1. Deploy Contracts
```bash
# Deploy both escrow and GitHub verifier contracts
npx hardhat ignition deploy ignition/modules/EthJobsEscrow.ts --network sepolia
```

### 2. Set Up Chainlink Functions
1. **Create Subscription**: Visit [Chainlink Functions](https://functions.chain.link/) to create a subscription
2. **Fund Subscription**: Add LINK tokens to your subscription
3. **Get Subscription ID**: Note your subscription ID (already hardcoded in contract)

### 2. Create New Job
```solidity
// Call on escrow contract
createJob(
    employeeAddress,    // Employee's wallet address
    deadlineTimestamp,  // Unix timestamp for deadline
    amount,            // PYUSD amount (in wei, 6 decimals)
    githubIssue        // GitHub issue URL or reference
)
// Returns: jobId (uint256)
```

### 3. Verify GitHub Issue
```bash
# Update GITHUB_VERIFIER_ADDRESS in scripts/verify-github-issue.ts
npx hardhat run scripts/verify-github-issue.ts --network sepolia
```

**Note**: The subscription ID, gas limit, and DON ID are now hardcoded in the contract for simplicity.

### 4. Approve PYUSD Spending
```bash
# Update ESCROW_ADDRESS in scripts/approve-escrow.ts
npx hardhat run scripts/approve-escrow.ts --network sepolia
```

### 5. Fund the Job
```solidity
// Call on escrow contract
fundJob(jobId)  // Transfers PYUSD from employer to contract
```

### 6. Complete or Refund
```solidity
// Release funds to employee (job completed)
releaseFunds(jobId)

// Refund to employer (deadline passed)
refund(jobId)
```

## Key Functions

### Job Management
- `createJob(employee, deadline, amount, githubIssue)` → `jobId`
- `fundJob(jobId)` - Fund a job with PYUSD
- `releaseFunds(jobId)` - Pay employee
- `refund(jobId)` - Return funds to employer

### Query Functions
- `getJob(jobId)` - Get complete job details (including GitHub issue)
- `getEmployerJobs(employer)` - Get all jobs for an employer
- `getEmployeeJobs(employee)` - Get all jobs for an employee
- `getTotalJobs()` - Get total number of jobs
- `getPYUSDBalance()` - Get contract's PYUSD balance

## Scripts

### approve-escrow.ts
- Approves PYUSD spending for the escrow contract
- Checks balance and current allowance
- Provides detailed logging of the approval process

### verify-github-issue.ts
- Verifies GitHub issues using Chainlink Functions
- Sends verification requests to the decentralized oracle network
- Checks verification status and results
- Requires Chainlink Functions subscription setup

## Contract Addresses

- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (Sepolia)
- **Escrow Contract**: Deploy and update this address
- **GitHub Verifier**: Deploy and update this address

## Testing

```bash
# Run tests
npx hardhat test

# Run specific test file
npx hardhat test test/EthJobsEscrow.ts
```

## Key Benefits

1. **Single Contract**: Everything in one place, easier to manage
2. **Multiple Jobs**: Handle unlimited jobs with unique IDs
3. **Gas Efficient**: No need to deploy new contracts per job
4. **Enhanced Workflow**: Create → Verify → Approve → Fund → Complete/Refund
5. **Full Control**: Employers manage their own jobs independently
6. **Scalable**: Mapping-based storage for unlimited jobs
7. **External Verification**: Chainlink Functions integration for GitHub issue validation

## Security Features

- ✅ Access control modifiers (`onlyEmployer`)
- ✅ Job existence validation (`jobExists`)
- ✅ Funding state checks (`onlyWhenFunded`)
- ✅ Deadline validation
- ✅ PYUSD transfer safety checks
- ✅ Event emission for transparency
- ✅ No direct ETH acceptance (PYUSD only)
- ✅ Owner-only GitHub verification controls

## Development

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat ignition deploy ignition/modules/EthJobsEscrow.ts --network sepolia
npx hardhat ignition deploy ignition/modules/GitHubVerifier.ts --network sepolia
```

## Environment Variables

```bash
export SEPOLIA_PRIVATE_KEY="your_private_key_here"
export SEPOLIA_RPC_URL="your_rpc_url_here"
export ETHERSCAN_API_KEY="your_etherscan_api_key_here"
```

## Example Workflow

1. **Deploy**: Deploy both escrow and GitHub verifier contracts
2. **Create Job**: Call `createJob()` with employee address, deadline, amount, and GitHub issue
3. **Verify Issue**: Use `GitHubVerifier` to check if the issue is payable
4. **Approve**: Approve PYUSD spending for the escrow contract
5. **Fund**: Call `fundJob(jobId)` to transfer PYUSD
6. **Complete**: Call `releaseFunds(jobId)` when job is done
7. **Or Refund**: Call `refund(jobId)` if deadline passes

This enhanced architecture provides automated GitHub issue verification while maintaining the simplicity and security of your escrow system!