import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EthJobsEscrowModule", (m) => {
  // Deploy the simple escrow contract (no constructor parameters needed)
  const escrow = m.contract("EthJobsEscrow");
  
  // Deploy the GitHub verifier contract with Chainlink Functions router
  const ROUTER_ADDRESS = "0x6E2dc0F9DB014aE19888F539E59285D2EaB44A05"; // Sepolia testnet
  const githubVerifier = m.contract("GitHubVerifier", [ROUTER_ADDRESS]);
  
  return { escrow, githubVerifier };
});
