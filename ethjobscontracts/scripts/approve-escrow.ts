import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

async function main() {
  // Constants
  const PYUSD_TOKEN = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const ESCROW_ADDRESS = "0x62aed97998B2BB16977EdD4638506DcC137840C2";
  const APPROVAL_AMOUNT = 10000n * 10n ** 6n; // 10,000 PYUSD (6 decimals)
  
  console.log("🚀 Starting PYUSD approval for escrow contract...");
  console.log("PYUSD Token:", PYUSD_TOKEN);
  console.log("Escrow Address:", ESCROW_ADDRESS);
  console.log("Approval Amount:", Number(APPROVAL_AMOUNT) / 1e6, "PYUSD");
  
  try {
    // Get the private key from environment
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("SEPOLIA_PRIVATE_KEY environment variable not set");
    }
    
    // Add 0x prefix if missing
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Validate private key format (should be 32 bytes = 64 hex chars + 0x prefix = 66 total)
    if (formattedPrivateKey.length !== 66) {
      throw new Error("Invalid private key format. Must be a 32-byte hex string (64 characters + 0x prefix)");
    }
    
    // Create account from private key
    const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
    console.log("Signer Address:", account.address);
    
    // Create wallet client with public actions extended
    const client = createWalletClient({
      account,
      chain: sepolia,
      transport: http()
    }).extend(publicActions);
    
    // Check current PYUSD balance
    const balance = await client.readContract({
      address: PYUSD_TOKEN as `0x${string}`,
      abi: [
        {
          "inputs": [{"name": "account", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: "balanceOf",
      args: [account.address]
    }) as bigint;
    
    console.log("Current PYUSD Balance:", Number(balance) / 1e6, "PYUSD");
    
    if (balance < APPROVAL_AMOUNT) {
      console.log("⚠️  Warning: Insufficient PYUSD balance for approval amount");
      console.log("Consider reducing the approval amount or getting more PYUSD");
    }
    
    // Check current allowance for the escrow contract
    const currentAllowance = await client.readContract({
      address: PYUSD_TOKEN as `0x${string}`,
      abi: [
        {
          "inputs": [
            {"name": "owner", "type": "address"},
            {"name": "spender", "type": "address"}
          ],
          "name": "allowance",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: "allowance",
      args: [account.address, ESCROW_ADDRESS as `0x${string}`]
    }) as bigint;
    
    console.log("Current Allowance:", Number(currentAllowance) / 1e6, "PYUSD");
    
    if (currentAllowance >= APPROVAL_AMOUNT) {
      console.log("✅ Already have sufficient allowance!");
      return;
    }
    
    // Approve PYUSD spending for the escrow contract
    console.log("🔐 Approving PYUSD spending for escrow contract...");
    
    const approveTx = await client.writeContract({
      address: PYUSD_TOKEN as `0x${string}`,
      abi: [
        {
          "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"}
          ],
          "name": "approve",
          "outputs": [{"name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: "approve",
      args: [ESCROW_ADDRESS as `0x${string}`, APPROVAL_AMOUNT]
    });
    
    console.log("📝 Approval transaction hash:", approveTx);
    
    // Wait for transaction confirmation
    const receipt = await client.waitForTransactionReceipt({ hash: approveTx });
    console.log("✅ Approval transaction confirmed in block:", receipt.blockNumber);
    
    // Verify the new allowance
    const newAllowance = await client.readContract({
      address: PYUSD_TOKEN as `0x${string}`,
      abi: [
        {
          "inputs": [
            {"name": "owner", "type": "address"},
            {"name": "spender", "type": "address"}
          ],
          "name": "allowance",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: "allowance",
      args: [account.address, ESCROW_ADDRESS as `0x${string}`]
    }) as bigint;
    
    console.log("🎉 New allowance:", Number(newAllowance) / 1e6, "PYUSD");
    console.log("✅ PYUSD approval successful! You can now create and fund jobs.");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
