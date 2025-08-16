# EthJobs Escrow Contract

A decentralized escrow system for job payments using PYUSD tokens on Ethereum Sepolia testnet.

## Overview

This project implements a single smart contract that handles multiple job escrows using a mapping system. Each job has a unique ID and can be managed independently.

## How It Works

### 1. Job Lifecycle Flow
```
Create Job → Approve PYUSD → Fund Job → Complete/Refund
```

1. **Create Job**: Call `createJob()` to create a new job escrow
2. **Approve PYUSD**: Approve the escrow contract to spend your PYUSD tokens
3. **Fund Job**: Call `fundJob()` to transfer PYUSD into the contract
4. **Complete/Refund**: Release funds to employee or refund to employer

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
- ✅ **Access Control**: Only employers can manage their jobs
- ✅ **Deadline Enforcement**: Automatic refund eligibility
- ✅ **Event Emission**: Full transparency for all actions
- ✅ **Query Functions**: Get job details, employer/employee jobs

## Usage

### 1. Deploy Contract
```bash
# Deploy escrow contract
npx hardhat ignition deploy ignition/modules/EthJobsEscrow.ts --network sepolia
```

### 2. Create New Job
```solidity
// Call on escrow contract
createJob(
    employeeAddress,    // Employee's wallet address
    deadlineTimestamp,  // Unix timestamp for deadline
    amount             // PYUSD amount (in wei, 6 decimals)
)
// Returns: jobId (uint256)
```

### 3. Fund the Job
```solidity
// Call on escrow contract
fundJob(jobId)  // Transfers PYUSD from employer to contract
```

### 4. Complete or Refund
```solidity
// Release funds to employee (job completed)
releaseFunds(jobId)

// Refund to employer (deadline passed)
refund(jobId)
```

## Key Functions

### Job Management
- `createJob(employee, deadline, amount)` → `jobId`
- `fundJob(jobId)` - Fund a job with PYUSD
- `releaseFunds(jobId)` - Pay employee
- `refund(jobId)` - Return funds to employer

### Query Functions
- `getJob(jobId)` - Get complete job details
- `getEmployerJobs(employer)` - Get all jobs for an employer
- `getEmployeeJobs(employee)` - Get all jobs for an employee
- `getTotalJobs()` - Get total number of jobs
- `getPYUSDBalance()` - Get contract's PYUSD balance

## Scripts

### approve-escrow.ts
- Approves PYUSD spending for the escrow contract
- Checks balance and current allowance
- Provides detailed logging of the approval process

## Contract Addresses

- **PYUSD Token**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` (Sepolia)
- **Escrow Contract**: Deploy and update this address

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
4. **Simple Workflow**: Create → Approve → Fund → Complete/Refund
5. **Full Control**: Employers manage their own jobs independently
6. **Scalable**: Mapping-based storage for unlimited jobs

## Security Features

- ✅ Access control modifiers (`onlyEmployer`)
- ✅ Job existence validation (`jobExists`)
- ✅ Funding state checks (`onlyWhenFunded`)
- ✅ Deadline validation
- ✅ PYUSD transfer safety checks
- ✅ Event emission for transparency
- ✅ No direct ETH acceptance (PYUSD only)

## Development

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat ignition deploy ignition/modules/EthJobsEscrow.ts --network sepolia
```

## Environment Variables

```bash
export SEPOLIA_PRIVATE_KEY="your_private_key_here"
export SEPOLIA_RPC_URL="your_rpc_url_here"
export ETHERSCAN_API_KEY="your_etherscan_api_key_here"
```

## Example Workflow

1. **Deploy**: Deploy the escrow contract
2. **Create Job**: Call `createJob()` with employee address, deadline, and amount
3. **Approve**: Approve PYUSD spending for the escrow contract
4. **Fund**: Call `fundJob(jobId)` to transfer PYUSD
5. **Complete**: Call `releaseFunds(jobId)` when job is done
6. **Or Refund**: Call `refund(jobId)` if deadline passes

This simplified architecture makes it much easier to use and understand while maintaining all the security and functionality you need!
