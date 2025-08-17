import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

async function main() {
  // Constants
  const GITHUB_VERIFIER_ADDRESS = "0x..."; // Replace with your deployed GitHubVerifier address
  const GITHUB_ISSUE_URL = "https://github.com/emilypmendez/ethjobs/issues/6"; // Your actual GitHub issue
  
  // Chainlink Functions parameters
  const SUBSCRIPTION_ID = 5464; // Your subscription ID
  const GAS_LIMIT = 300000; // Gas limit for the callback (300k gas)
  const DON_ID = "0x66756e2d657468657265756d2d7365706f6c69612d31000000000000000000"; // Sepolia DON ID
  
  console.log("🔍 Verifying GitHub Issue with Chainlink Functions...");
  console.log("Verifier Address:", GITHUB_VERIFIER_ADDRESS);
  console.log("GitHub Issue:", GITHUB_ISSUE_URL);
  console.log("Subscription ID:", SUBSCRIPTION_ID);
  console.log("Gas Limit:", GAS_LIMIT);
  console.log("DON ID:", DON_ID);
  
  try {
    // Get the private key from environment
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("SEPOLIA_PRIVATE_KEY environment variable not set");
    }
    
    // Add 0x prefix if missing
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    // Validate private key format
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
    
    // Check current verification status
    try {
      const issueStatus = await client.readContract({
        address: GITHUB_VERIFIER_ADDRESS as `0x${string}`,
        abi: [
          {
            "inputs": [{"name": "githubIssue", "type": "string"}],
            "name": "checkIssueStatus",
            "outputs": [
              {"name": "isPayable", "type": "bool"},
              {"name": "isVerified", "type": "bool"}
            ],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        functionName: "checkIssueStatus",
        args: [GITHUB_ISSUE_URL]
      }) as [boolean, boolean];
      
      const [isPayable, isVerified] = issueStatus;
      console.log("\n📋 Current Issue Status:");
      console.log("   Is Verified:", isVerified ? "✅ Yes" : "❌ No");
      console.log("   Is Payable:", isPayable ? "✅ Yes" : "❌ No");
      
      if (isVerified) {
        console.log("✅ Issue already verified! No need to send new request.");
        return;
      }
      
    } catch (error) {
      console.log("❌ Could not check issue status:", error);
    }
    
    // Send verification request
    console.log("\n🚀 Sending verification request...");
    
    const verifyTx = await client.writeContract({
      address: GITHUB_VERIFIER_ADDRESS as `0x${string}`,
      abi: [
        {
          "inputs": [
            {"name": "githubIssue", "type": "string"},
            {"name": "subscriptionId", "type": "uint64"},
            {"name": "gasLimit", "type": "uint32"},
            {"name": "donID", "type": "bytes32"}
          ],
          "name": "verifyGitHubIssue",
          "outputs": [{"name": "", "type": "bytes32"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: "verifyGitHubIssue",
      args: [GITHUB_ISSUE_URL, BigInt(SUBSCRIPTION_ID), BigInt(GAS_LIMIT), DON_ID as `0x${string}`]
    });
    
    console.log("📝 Verification transaction hash:", verifyTx);
    
    // Wait for transaction confirmation
    const receipt = await client.waitForTransactionReceipt({ hash: verifyTx });
    console.log("✅ Verification request confirmed in block:", receipt.blockNumber);
    
    console.log("\n⏳ Waiting for Chainlink Functions response...");
    console.log("This may take a few minutes. The response will be sent to the contract.");
    console.log("\n📝 To check the result later, use the checkIssueStatus function.");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
