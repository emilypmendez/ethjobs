import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EthJobsEscrowModule", (m) => {
  const escrow = m.contract("EthJobsEscrow");
  
  return { escrow };
});
