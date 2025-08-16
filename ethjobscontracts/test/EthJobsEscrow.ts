// We don't have Ethereum specific assertions in Hardhat 3 yet
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("EthJobsEscrow", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should deploy with correct initial state", async function () {
    const employee = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Test employee address
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24 hours from now
    const amount = 1n * 10n ** 18n; // 1 ETH

    const escrow = await viem.deployContract("EthJobsEscrow", [employee, deadline], {
      value: amount,
    });

    // Get the actual employer address from the contract
    const actualEmployer = await escrow.read.employer();

    // Check initial state
    assert.equal(await escrow.read.employer(), actualEmployer);
    assert.equal(await escrow.read.employee(), employee);
    assert.equal(await escrow.read.amount(), amount);
    assert.equal(await escrow.read.deadline(), deadline);
  });

  it("Should return correct state from viewState function", async function () {
    const employee = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);
    const amount = 1n * 10n ** 18n;

    const escrow = await viem.deployContract("EthJobsEscrow", [employee, deadline], {
      value: amount,
    });

    const state = await escrow.read.viewState() as [string, string, bigint, bigint, bigint, boolean, boolean];
    console.log("hi state below")
    console.log(state)
    console.log("hi escrow contract below")
    console.log(escrow)
    // Get the actual employer address from the contract
    const actualEmployer = await escrow.read.employer();
    
    assert.equal(state[0], actualEmployer); // _employer
    assert.equal(state[1], employee);        // _employee
    assert.equal(state[2], amount);          // _amount
    assert.equal(state[3], deadline);        // _deadline
    assert(state[4] > 0n);                  // _currentTime
    assert.equal(state[5], false);           // _isDeadlinePassed
    assert.equal(state[6], true);            // _hasFunds
  });
});
