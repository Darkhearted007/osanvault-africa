import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("PayoutManager", function () {
  let payoutManager: any;
  let usdc: any;
  let admin: Signer, creator: Signer, approver1: Signer, approver2: Signer, recipient: Signer, user: Signer;

  const TIMELOCK = 86400n;
  const THRESHOLD = 2;
  const DECIMALS = 6n;
  const PAYOUT_AMOUNT = ethers.parseUnits("1000", DECIMALS);

  beforeEach(async function () {
    [admin, creator, approver1, approver2, recipient, user] = await ethers.getSigners();

    usdc = await ethers.deployContract("MockUSDC", ["MockUSDC", "USDC", DECIMALS]);
    await usdc.waitForDeployment();

    payoutManager = await deployUUPS(
      "PayoutManager", admin,
      admin.address, admin.address, TIMELOCK, THRESHOLD
    );

    const CREATOR_ROLE = await payoutManager.PAYOUT_CREATOR_ROLE();
    const APPROVER_ROLE = await payoutManager.PAYOUT_APPROVER_ROLE();
    await payoutManager.connect(admin).grantRole(CREATOR_ROLE, creator.address);
    await payoutManager.connect(admin).grantRole(APPROVER_ROLE, approver1.address);
    await payoutManager.connect(admin).grantRole(APPROVER_ROLE, approver2.address);

    await usdc.mint(admin.address, ethers.parseUnits("10000", DECIMALS));
    await usdc.connect(admin).approve(await payoutManager.getAddress(), ethers.parseUnits("10000", DECIMALS));
  });

  describe("initialization", function () {
    it("should set treasury vault", async function () {
      expect(await payoutManager.treasuryVault()).to.equal(admin.address);
    });

    it("should set timelock duration", async function () {
      expect(await payoutManager.timelockDuration()).to.equal(TIMELOCK);
    });

    it("should set approval threshold", async function () {
      expect(await payoutManager.approvalThreshold()).to.equal(THRESHOLD);
    });

    it("should grant DEFAULT_ADMIN_ROLE", async function () {
      expect(await payoutManager.hasRole(await payoutManager.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("submitPayout", function () {
    it("should submit a payout", async function () {
      const tx = await payoutManager.connect(creator).submitPayout(
        recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT
      );
      await tx.wait();

      const payout = await payoutManager.getPayout(1);
      expect(payout.payoutId).to.equal(1n);
      expect(payout.recipient).to.equal(recipient.address);
      expect(payout.token).to.equal(await usdc.getAddress());
      expect(payout.amount).to.equal(PAYOUT_AMOUNT);
      expect(payout.status).to.equal(0);
    });

    it("should emit PayoutSubmitted event", async function () {
      await expect(
        payoutManager.connect(creator).submitPayout(recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT)
      ).to.emit(payoutManager, "PayoutSubmitted").withArgs(1, recipient.address, PAYOUT_AMOUNT, creator.address);
    });

    it("should revert with zero recipient", async function () {
      await expect(
        payoutManager.connect(creator).submitPayout(ethers.ZeroAddress, await usdc.getAddress(), PAYOUT_AMOUNT)
      ).to.be.revertedWith("invalid recipient");
    });

    it("should revert with zero amount", async function () {
      await expect(
        payoutManager.connect(creator).submitPayout(recipient.address, await usdc.getAddress(), 0)
      ).to.be.revertedWith("amount zero");
    });

    it("should revert without PAYOUT_CREATOR_ROLE", async function () {
      await expect(
        payoutManager.connect(user).submitPayout(recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT)
      ).to.be.revertedWithCustomError(payoutManager, "AccessControlUnauthorizedAccount");
    });
  });

  describe("approvePayout", function () {
    beforeEach(async function () {
      await (await payoutManager.connect(creator).submitPayout(
        recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT
      )).wait();
    });

    it("should approve a payout", async function () {
      await (await payoutManager.connect(approver1).approvePayout(1)).wait();
      expect(await payoutManager.hasApproved(1, approver1.address)).to.be.true;
    });

    it("should increment approval count", async function () {
      await (await payoutManager.connect(approver1).approvePayout(1)).wait();
      const payout = await payoutManager.getPayout(1);
      expect(payout.approvalCount).to.equal(1n);
    });

    it("should transition to APPROVED after threshold met", async function () {
      await (await payoutManager.connect(approver1).approvePayout(1)).wait();
      await (await payoutManager.connect(approver2).approvePayout(1)).wait();
      const payout = await payoutManager.getPayout(1);
      expect(payout.status).to.equal(1);
    });

    it("should emit PayoutApproved event", async function () {
      await expect(
        payoutManager.connect(approver1).approvePayout(1)
      ).to.emit(payoutManager, "PayoutApproved").withArgs(1, approver1.address);
    });

    it("should revert double approval by same approver", async function () {
      await (await payoutManager.connect(approver1).approvePayout(1)).wait();
      await expect(
        payoutManager.connect(approver1).approvePayout(1)
      ).to.be.revertedWith("already approved");
    });

    it("should revert for non-existent payout", async function () {
      await expect(
        payoutManager.connect(approver1).approvePayout(99)
      ).to.be.revertedWith("payout not found");
    });

    it("should revert without PAYOUT_APPROVER_ROLE", async function () {
      await expect(
        payoutManager.connect(user).approvePayout(1)
      ).to.be.revertedWithCustomError(payoutManager, "AccessControlUnauthorizedAccount");
    });
  });

  describe("rejectPayout", function () {
    beforeEach(async function () {
      await (await payoutManager.connect(creator).submitPayout(
        recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT
      )).wait();
    });

    it("should reject a pending payout", async function () {
      await (await payoutManager.connect(approver1).rejectPayout(1)).wait();
      const payout = await payoutManager.getPayout(1);
      expect(payout.status).to.equal(2);
    });

    it("should emit PayoutRejected event", async function () {
      await expect(
        payoutManager.connect(approver1).rejectPayout(1)
      ).to.emit(payoutManager, "PayoutRejected").withArgs(1, approver1.address);
    });
  });

  describe("executePayout", function () {
    beforeEach(async function () {
      await (await payoutManager.connect(creator).submitPayout(
        recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT
      )).wait();

      await (await payoutManager.connect(approver1).approvePayout(1)).wait();
      await (await payoutManager.connect(approver2).approvePayout(1)).wait();
    });

    it("should execute an approved payout after timelock", async function () {
      const payout = await payoutManager.getPayout(1);
      await time.increaseTo(payout.timelockEnd + 1n);

      const recipientBalanceBefore = await usdc.balanceOf(recipient.address);
      await (await payoutManager.connect(creator).executePayout(1)).wait();
      expect(await usdc.balanceOf(recipient.address)).to.equal(recipientBalanceBefore + PAYOUT_AMOUNT);
    });

    it("should emit PayoutExecuted event", async function () {
      const payout = await payoutManager.getPayout(1);
      await time.increaseTo(payout.timelockEnd + 1n);

      await expect(
        payoutManager.connect(creator).executePayout(1)
      ).to.emit(payoutManager, "PayoutExecuted").withArgs(1, recipient.address, PAYOUT_AMOUNT);
    });

    it("should set status to EXECUTED", async function () {
      const payout = await payoutManager.getPayout(1);
      await time.increaseTo(payout.timelockEnd + 1n);

      await (await payoutManager.connect(creator).executePayout(1)).wait();
      const updated = await payoutManager.getPayout(1);
      expect(updated.status).to.equal(3);
    });

    it("should revert if timelock not expired", async function () {
      await expect(
        payoutManager.connect(creator).executePayout(1)
      ).to.be.revertedWith("timelock active");
    });

    it("should revert if not APPROVED", async function () {
      const p2 = await deployUUPS("PayoutManager", admin, admin.address, admin.address, TIMELOCK, 1);
      await usdc.connect(admin).approve(await p2.getAddress(), PAYOUT_AMOUNT);
      await (await p2.connect(admin).submitPayout(recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT)).wait();
      const payout2 = await p2.getPayout(1);
      await time.increaseTo(payout2.timelockEnd + 1n);
      await expect(
        p2.connect(admin).executePayout(1)
      ).to.be.revertedWith("not approved");
    });
  });

  describe("cancelPayout", function () {
    beforeEach(async function () {
      await (await payoutManager.connect(creator).submitPayout(
        recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT
      )).wait();
    });

    it("should cancel a pending payout", async function () {
      await (await payoutManager.connect(creator).cancelPayout(1)).wait();
      const payout = await payoutManager.getPayout(1);
      expect(payout.status).to.equal(4);
    });

    it("should emit PayoutCancelled event", async function () {
      await expect(
        payoutManager.connect(creator).cancelPayout(1)
      ).to.emit(payoutManager, "PayoutCancelled").withArgs(1);
    });

    it("should revert if not pending", async function () {
      await (await payoutManager.connect(creator).cancelPayout(1)).wait();
      await expect(
        payoutManager.connect(creator).cancelPayout(1)
      ).to.be.revertedWith("not pending");
    });
  });

  describe("configuration", function () {
    it("should update timelock duration", async function () {
      await (await payoutManager.connect(admin).setTimelockDuration(3600)).wait();
      expect(await payoutManager.timelockDuration()).to.equal(3600n);
    });

    it("should update treasury vault", async function () {
      await (await payoutManager.connect(admin).setTreasuryVault(recipient.address)).wait();
      expect(await payoutManager.treasuryVault()).to.equal(recipient.address);
    });

    it("should update approval threshold", async function () {
      await (await payoutManager.connect(admin).setApprovalThreshold(1)).wait();
      expect(await payoutManager.approvalThreshold()).to.equal(1n);
    });

    it("should revert threshold with 0", async function () {
      await expect(
        payoutManager.connect(admin).setApprovalThreshold(0)
      ).to.be.revertedWith("threshold must be > 0");
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent submission", async function () {
      await (await payoutManager.connect(admin).pause()).wait();
      await expect(
        payoutManager.connect(creator).submitPayout(recipient.address, await usdc.getAddress(), PAYOUT_AMOUNT)
      ).to.be.revertedWithCustomError(payoutManager, "EnforcedPause");
    });
  });
});
