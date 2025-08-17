import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

async function main() {
  // Constants
  const GITHUB_VERIFIER_ADDRESS = "0x..."; // Replace with your deployed GitHubVerifier address
  const GITHUB_ISSUE_URL = "https://github.com/emilypmendez/ethjobs/issues/6"; // Your actual GitHub issue
  
  console.log("🔍 Verifying GitHub Issue with Chainlink Functions...");
  console.log("Verifier Address:", GITHUB_VERIFIER_ADDRESS);
  console.log("GitHub Issue:", GITHUB_ISSUE_URL);
  
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
          "inputs": [{"name": "githubIssue", "type": "string"}],
          "name": "verifyGitHubIssue",
          "outputs": [{"name": "", "type": "bytes32"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: "verifyGitHubIssue",
      args: [GITHUB_ISSUE_URL]
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
