import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("Governance", function () {
  async function deployGovFixture() {
    const [admin, proposer, executor, voter1, voter2] = await ethers.getSigners();

    const OSANVToken = await ethers.getContractFactory("OSANVToken");
    const token = await OSANVToken.deploy(admin.address, admin.address, admin.address, admin.address);
    await token.waitForDeployment();

    const Governance = await ethers.getContractFactory("Governance");
    const gov = await Governance.deploy(admin.address, proposer.address, executor.address, await token.getAddress());
    await gov.waitForDeployment();

    // Mint tokens for voting (keep under 250M floor)
    await token.connect(admin).mint(voter1.address, ethers.parseEther("5000000"));
    await token.connect(admin).mint(voter2.address, ethers.parseEther("5000000"));
    await token.connect(admin).mint(proposer.address, ethers.parseEther("5000000"));

    return { gov, token, admin, proposer, executor, voter1, voter2 };
  }

  describe("Deployment", function () {
    it("should set roles correctly", async function () {
      const { gov, admin, proposer, executor } = await loadFixture(deployGovFixture);
      const DEFAULT_ADMIN = await gov.DEFAULT_ADMIN_ROLE();
      const PROPOSER_ROLE = await gov.PROPOSER_ROLE();
      const EXECUTOR_ROLE = await gov.EXECUTOR_ROLE();

      expect(await gov.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await gov.hasRole(PROPOSER_ROLE, proposer.address)).to.be.true;
      expect(await gov.hasRole(EXECUTOR_ROLE, executor.address)).to.be.true;
    });
  });

  describe("Proposals", function () {
    it("should allow proposer to create a proposal", async function () {
      const { gov, proposer } = await loadFixture(deployGovFixture);
      const calldatas = ["0x"];
      const targets = [ethers.ZeroAddress];
      await gov.connect(proposer).propose("Test proposal", calldatas, targets);
      expect(await gov.proposalCount()).to.equal(1);
    });

    it("should reject proposal from non-proposer", async function () {
      const { gov, voter1 } = await loadFixture(deployGovFixture);
      await expect(
        gov.connect(voter1).propose("Test", ["0x"], [ethers.ZeroAddress])
      ).to.be.reverted;
    });

    it("should reject proposal with mismatched lengths", async function () {
      const { gov, proposer } = await loadFixture(deployGovFixture);
      await expect(
        gov.connect(proposer).propose("Test", ["0x", "0x"], [ethers.ZeroAddress])
      ).to.be.revertedWith("length mismatch");
    });
  });

  describe("Voting", function () {
    it("should allow voting after voting delay", async function () {
      const { gov, proposer, voter1 } = await loadFixture(deployGovFixture);
      await gov.connect(proposer).propose("Test", ["0x"], [ethers.ZeroAddress]);
      await time.increase(2 * 24 * 3600);

      await gov.connect(voter1).castVote(1, true);
      const proposal = await gov.getProposal(1);
      expect(proposal.forVotes).to.equal(ethers.parseEther("5000000"));
    });

    it("should reject double voting", async function () {
      const { gov, proposer, voter1 } = await loadFixture(deployGovFixture);
      await gov.connect(proposer).propose("Test", ["0x"], [ethers.ZeroAddress]);
      await time.increase(2 * 24 * 3600);

      await gov.connect(voter1).castVote(1, true);
      await expect(gov.connect(voter1).castVote(1, false)).to.be.revertedWith("already voted");
    });

    it("should reject voting before voting delay", async function () {
      const { gov, proposer, voter1 } = await loadFixture(deployGovFixture);
      await gov.connect(proposer).propose("Test", ["0x"], [ethers.ZeroAddress]);
      await expect(gov.connect(voter1).castVote(1, true)).to.be.revertedWith("voting not started");
    });
  });

  describe("Execution", function () {
    it("should queue and execute a passed proposal", async function () {
      const { gov, proposer, executor, voter1 } = await loadFixture(deployGovFixture);
      await gov.connect(proposer).propose("Test", ["0x"], [ethers.ZeroAddress]);
      await time.increase(2 * 24 * 3600);
      await gov.connect(voter1).castVote(1, true);
      await time.increase(8 * 24 * 3600); // Past voting + timelock

      await gov.connect(proposer).queue(1);
      await gov.connect(executor).execute(1);

      const proposal = await gov.getProposal(1);
      expect(proposal.executed).to.be.true;
      expect(proposal.state).to.equal(5); // Executed
    });

    it("should allow cancellation", async function () {
      const { gov, proposer } = await loadFixture(deployGovFixture);
      await gov.connect(proposer).propose("Test", ["0x"], [ethers.ZeroAddress]);
      await gov.connect(proposer).cancel(1);
      const proposal = await gov.getProposal(1);
      expect(proposal.state).to.equal(6); // Cancelled
    });
  });
});
