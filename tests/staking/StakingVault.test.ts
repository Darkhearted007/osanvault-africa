import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("StakingVault", function () {
  async function deployStakingFixture() {
    const [admin, governance, emergency, user1, user2] = await ethers.getSigners();

    const OSANVToken = await ethers.getContractFactory("OSANVToken");
    const token = await OSANVToken.deploy(admin.address, admin.address, admin.address, admin.address);
    await token.waitForDeployment();

    const StakingVault = await ethers.getContractFactory("StakingVault");
    const staking = await StakingVault.deploy(
      admin.address, governance.address, emergency.address, await token.getAddress()
    );
    await staking.waitForDeployment();

    await token.mint(user1.address, ethers.parseEther("100000"));
    await token.mint(user2.address, ethers.parseEther("100000"));

    return { staking, token, admin, governance, emergency, user1, user2 };
  }

  describe("Deployment", function () {
    it("should initialize four tiers", async function () {
      const { staking } = await loadFixture(deployStakingFixture);

      const bronze = await staking.tiers(0);
      expect(bronze.name).to.equal("Bronze");
      expect(bronze.aprBps).to.equal(800);
      expect(bronze.lockDuration).to.equal(30 * 24 * 3600);

      const silver = await staking.tiers(1);
      expect(silver.name).to.equal("Silver");
      expect(silver.aprBps).to.equal(1200);
      expect(silver.lockDuration).to.equal(90 * 24 * 3600);

      const gold = await staking.tiers(2);
      expect(gold.name).to.equal("Gold");
      expect(gold.aprBps).to.equal(1800);
      expect(gold.lockDuration).to.equal(180 * 24 * 3600);

      const platinum = await staking.tiers(3);
      expect(platinum.name).to.equal("Platinum");
      expect(platinum.aprBps).to.equal(2200);
      expect(platinum.lockDuration).to.equal(365 * 24 * 3600);
    });

    it("should set roles correctly", async function () {
      const { staking, admin, governance, emergency } = await loadFixture(deployStakingFixture);
      const DEFAULT_ADMIN = await staking.DEFAULT_ADMIN_ROLE();
      const GOVERNANCE_ROLE = await staking.GOVERNANCE_ROLE();
      const EMERGENCY_ROLE = await staking.EMERGENCY_ROLE();

      expect(await staking.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await staking.hasRole(GOVERNANCE_ROLE, governance.address)).to.be.true;
      expect(await staking.hasRole(EMERGENCY_ROLE, emergency.address)).to.be.true;
    });

    it("should set default early withdrawal penalty to 10%", async function () {
      const { staking } = await loadFixture(deployStakingFixture);
      expect(await staking.earlyWithdrawalPenaltyBps()).to.equal(1000);
    });
  });

  describe("Staking", function () {
    it("should allow staking in Bronze tier", async function () {
      const { staking, token, user1 } = await loadFixture(deployStakingFixture);
      const amount = ethers.parseEther("1000");
      await token.connect(user1).approve(await staking.getAddress(), amount);
      await staking.connect(user1).stake(0, amount);

      const info = await staking.getStakeInfo(user1.address);
      expect(info.tier).to.equal(0);
      expect(info.amount).to.equal(amount);
    });

    it("should reject staking in invalid tier", async function () {
      const { staking, token, user1 } = await loadFixture(deployStakingFixture);
      const amount = ethers.parseEther("1000");
      await token.connect(user1).approve(await staking.getAddress(), amount);
      await expect(staking.connect(user1).stake(4, amount)).to.be.revertedWith("invalid tier");
    });

    it("should reject staking zero amount", async function () {
      const { staking, token, user1 } = await loadFixture(deployStakingFixture);
      await token.connect(user1).approve(await staking.getAddress(), 0);
      await expect(staking.connect(user1).stake(0, 0)).to.be.revertedWith("amount zero");
    });

    it("should reject double staking", async function () {
      const { staking, token, user1 } = await loadFixture(deployStakingFixture);
      const amount = ethers.parseEther("1000");
      await token.connect(user1).approve(await staking.getAddress(), amount * 2n);
      await staking.connect(user1).stake(0, amount);
      await expect(staking.connect(user1).stake(0, amount)).to.be.revertedWith("already staked");
    });
  });

  describe("Withdrawal", function () {
    it("should allow early withdrawal with penalty", async function () {
      const { staking, token, user1 } = await loadFixture(deployStakingFixture);
      const amount = ethers.parseEther("1000");
      await token.connect(user1).approve(await staking.getAddress(), amount);
      await staking.connect(user1).stake(0, amount);

      await staking.connect(user1).withdraw(amount);

      const penalty = amount * 1000n / 10000n;
      const expectedReturn = amount - penalty;
      const finalBal = await token.balanceOf(user1.address);
      expect(finalBal).to.be.closeTo(
        ethers.parseEther("100000") - amount + expectedReturn,
        ethers.parseEther("0.01")
      );
    });

    it("should reject withdrawal exceeding stake", async function () {
      const { staking, token, user1 } = await loadFixture(deployStakingFixture);
      const amount = ethers.parseEther("1000");
      await token.connect(user1).approve(await staking.getAddress(), amount);
      await staking.connect(user1).stake(0, amount);
      await expect(staking.connect(user1).withdraw(amount + 1n)).to.be.revertedWith("invalid amount");
    });
  });

  describe("Rewards", function () {
    it("should accrue rewards over time", async function () {
      const { staking, token, user1, admin } = await loadFixture(deployStakingFixture);
      const amount = ethers.parseEther("10000");
      const stakingAddr = await staking.getAddress();

      await token.connect(user1).approve(stakingAddr, amount);
      await staking.connect(user1).stake(0, amount);

      // Fund rewards
      await token.connect(admin).mint(stakingAddr, ethers.parseEther("100000"));

      // Advance 30 days
      await time.increase(30 * 24 * 3600);

      const earned = await staking.earned(user1.address);
      expect(earned).to.be.gt(0);
    });

    it("should allow claiming rewards", async function () {
      const { staking, token, user1, admin } = await loadFixture(deployStakingFixture);
      const amount = ethers.parseEther("10000");
      const stakingAddr = await staking.getAddress();

      await token.connect(user1).approve(stakingAddr, amount);
      await staking.connect(user1).stake(0, amount);

      await token.connect(admin).mint(stakingAddr, ethers.parseEther("100000"));

      await time.increase(30 * 24 * 3600);

      const balanceBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).claimRewards();
      const balanceAfter = await token.balanceOf(user1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe("Governance", function () {
    it("should allow governance to configure tiers", async function () {
      const { staking, governance } = await loadFixture(deployStakingFixture);
      await staking.connect(governance).configureTier(0, 1000, 60 * 24 * 3600);
      const tier = await staking.tiers(0);
      expect(tier.aprBps).to.equal(1000);
      expect(tier.lockDuration).to.equal(60 * 24 * 3600);
    });

    it("should reject tier config by non-governance", async function () {
      const { staking, user1 } = await loadFixture(deployStakingFixture);
      await expect(
        staking.connect(user1).configureTier(0, 1000, 60 * 24 * 3600)
      ).to.be.reverted;
    });

    it("should allow governance to set early withdrawal penalty", async function () {
      const { staking, governance } = await loadFixture(deployStakingFixture);
      await staking.connect(governance).setEarlyWithdrawalPenalty(500);
      expect(await staking.earlyWithdrawalPenaltyBps()).to.equal(500);
    });
  });

  describe("Pausing", function () {
    it("should allow emergency role to pause", async function () {
      const { staking, emergency } = await loadFixture(deployStakingFixture);
      await staking.connect(emergency).pause();
      expect(await staking.paused()).to.be.true;
      await staking.connect(emergency).unpause();
      expect(await staking.paused()).to.be.false;
    });
  });
});
