import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("TreasuryVault", function () {
  async function deployTreasuryFixture() {
    const [admin, executor, guardian, recipient] = await ethers.getSigners();

    const TreasuryVault = await ethers.getContractFactory("TreasuryVault");
    const treasury = await TreasuryVault.deploy(admin.address, executor.address, guardian.address);
    await treasury.waitForDeployment();

    // Fund with native token
    await admin.sendTransaction({
      to: await treasury.getAddress(),
      value: ethers.parseEther("100"),
    });

    return { treasury, admin, executor, guardian, recipient };
  }

  describe("Deployment", function () {
    it("should set roles correctly", async function () {
      const { treasury, admin, executor, guardian } = await loadFixture(deployTreasuryFixture);
      const DEFAULT_ADMIN = await treasury.DEFAULT_ADMIN_ROLE();
      const EXECUTOR_ROLE = await treasury.EXECUTOR_ROLE();
      const GUARDIAN_ROLE = await treasury.GUARDIAN_ROLE();

      expect(await treasury.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await treasury.hasRole(EXECUTOR_ROLE, executor.address)).to.be.true;
      expect(await treasury.hasRole(GUARDIAN_ROLE, guardian.address)).to.be.true;
    });

    it("should set default timelock to 2 days", async function () {
      const { treasury } = await loadFixture(deployTreasuryFixture);
      expect(await treasury.withdrawalTimelock()).to.equal(2 * 24 * 3600);
    });
  });

  describe("Withdrawal Flow", function () {
    it("should create withdrawal request", async function () {
      const { treasury, executor, recipient } = await loadFixture(deployTreasuryFixture);
      const amount = ethers.parseEther("10");
      await treasury.connect(executor).requestWithdrawal(
        recipient.address,
        ethers.ZeroAddress,
        amount
      );
      const request = await treasury.requests(0);
      expect(request.recipient).to.equal(recipient.address);
      expect(request.amount).to.equal(amount);
      expect(request.executed).to.be.false;
    });

    it("should reject request by non-executor", async function () {
      const { treasury, recipient } = await loadFixture(deployTreasuryFixture);
      await expect(
        treasury.connect(recipient).requestWithdrawal(recipient.address, ethers.ZeroAddress, 1)
      ).to.be.revertedWith("not executor");
    });

    it("should execute withdrawal after timelock", async function () {
      const { treasury, executor, recipient } = await loadFixture(deployTreasuryFixture);
      const amount = ethers.parseEther("10");
      const treasuryAddr = await treasury.getAddress();

      await treasury.connect(executor).requestWithdrawal(recipient.address, ethers.ZeroAddress, amount);
      await time.increase(3 * 24 * 3600);

      const balanceBefore = await ethers.provider.getBalance(recipient.address);
      await treasury.connect(executor).executeWithdrawal(0);
      const balanceAfter = await ethers.provider.getBalance(recipient.address);

      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("should reject execution before timelock expires", async function () {
      const { treasury, executor, recipient } = await loadFixture(deployTreasuryFixture);
      const amount = ethers.parseEther("10");

      await treasury.connect(executor).requestWithdrawal(recipient.address, ethers.ZeroAddress, amount);
      await expect(
        treasury.connect(executor).executeWithdrawal(0)
      ).to.be.revertedWith("timelock not expired");
    });

    it("should reject execution exceeding daily limit", async function () {
      const { treasury, executor, guardian, recipient, admin } = await loadFixture(deployTreasuryFixture);
      // Set a low daily limit for this test
      await treasury.connect(guardian).setDailyWithdrawalLimit(ethers.parseEther("5"));
      // Instead of sending more ETH to vault, create a withdrawal below vault balance
      // but above the new daily limit
      const amount = ethers.parseEther("10");

      await treasury.connect(executor).requestWithdrawal(recipient.address, ethers.ZeroAddress, amount);
      await time.increase(3 * 24 * 3600);

      await expect(
        treasury.connect(executor).executeWithdrawal(0)
      ).to.be.revertedWith("exceeds daily limit");
    });
  });

  describe("Withdrawal Cancellation", function () {
    it("should allow guardian to cancel withdrawal", async function () {
      const { treasury, executor, guardian, recipient } = await loadFixture(deployTreasuryFixture);
      await treasury.connect(executor).requestWithdrawal(recipient.address, ethers.ZeroAddress, ethers.parseEther("10"));
      await treasury.connect(guardian).cancelWithdrawal(0);
      const request = await treasury.requests(0);
      expect(request.executed).to.be.true;
    });
  });

  describe("Configuration", function () {
    it("should allow guardian to update timelock", async function () {
      const { treasury, guardian } = await loadFixture(deployTreasuryFixture);
      await treasury.connect(guardian).setWithdrawalTimelock(3 * 24 * 3600);
      expect(await treasury.withdrawalTimelock()).to.equal(3 * 24 * 3600);
    });

    it("should allow guardian to update daily limit", async function () {
      const { treasury, guardian } = await loadFixture(deployTreasuryFixture);
      await treasury.connect(guardian).setDailyWithdrawalLimit(ethers.parseEther("100000"));
      expect(await treasury.dailyWithdrawalLimit()).to.equal(ethers.parseEther("100000"));
    });

    it("should allow guardian to add supported token", async function () {
      const { treasury, guardian, admin } = await loadFixture(deployTreasuryFixture);
      const dummyToken = await (await ethers.getContractFactory("OSANVToken")).deploy(
        admin.address, admin.address, admin.address, admin.address
      );
      const tokenAddr = await dummyToken.getAddress();
      await treasury.connect(guardian).addSupportedToken(tokenAddr);
      expect(await treasury.supportedTokens(tokenAddr)).to.be.true;
    });
  });

  describe("Pausing", function () {
    it("should allow guardian to pause", async function () {
      const { treasury, guardian } = await loadFixture(deployTreasuryFixture);
      await treasury.connect(guardian).pause();
      expect(await treasury.paused()).to.be.true;
      await treasury.connect(guardian).unpause();
      expect(await treasury.paused()).to.be.false;
    });
  });
});
