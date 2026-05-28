import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("FeeRouter", function () {
  async function deployFeeFixture() {
    const [admin, configurer, collector, treasury, staking, vesting, user] = await ethers.getSigners();

    const FeeRouter = await ethers.getContractFactory("FeeRouter");
    const feeRouter = await FeeRouter.deploy(
      admin.address, configurer.address, collector.address,
      treasury.address, staking.address, vesting.address
    );
    await feeRouter.waitForDeployment();

    return { feeRouter, admin, configurer, collector, treasury, staking, vesting, user };
  }

  describe("Deployment", function () {
    it("should set roles correctly", async function () {
      const { feeRouter, admin, configurer, collector } = await loadFixture(deployFeeFixture);
      const DEFAULT_ADMIN = await feeRouter.DEFAULT_ADMIN_ROLE();
      const CONFIGURER_ROLE = await feeRouter.CONFIGURER_ROLE();
      const COLLECTOR_ROLE = await feeRouter.COLLECTOR_ROLE();
      expect(await feeRouter.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await feeRouter.hasRole(CONFIGURER_ROLE, configurer.address)).to.be.true;
      expect(await feeRouter.hasRole(COLLECTOR_ROLE, collector.address)).to.be.true;
    });

    it("should initialize fee split (30% treasury, 20% burn, 40% staking, 10% team)", async function () {
      const { feeRouter } = await loadFixture(deployFeeFixture);
      const split = await feeRouter.feeSplit();
      expect(split.treasuryBps).to.equal(3000);
      expect(split.burnBps).to.equal(2000);
      expect(split.stakingBps).to.equal(4000);
      expect(split.teamBps).to.equal(1000);
    });
  });

  describe("Fee Distribution", function () {
    it("should allow collector to distribute fees", async function () {
      const { feeRouter, collector, admin } = await loadFixture(deployFeeFixture);
      const burnAddr = await feeRouter.burnAddress();

      const OSANVToken = await ethers.getContractFactory("OSANVToken");
      const token = await OSANVToken.deploy(admin.address, admin.address, admin.address, admin.address);
      await token.waitForDeployment();

      const amount = ethers.parseEther("10000");
      await token.connect(admin).mint(collector.address, amount);
      await token.connect(collector).approve(await feeRouter.getAddress(), amount);

      const treasuryBalBefore = await token.balanceOf(feeRouter.treasuryVault());
      const burnBalBefore = await token.balanceOf(burnAddr);
      const stakingBalBefore = await token.balanceOf(feeRouter.stakingVault());
      const teamBalBefore = await token.balanceOf(feeRouter.teamVesting());

      await feeRouter.connect(collector).distributeFees(await token.getAddress(), amount);

      // 30% treasury, 20% burn, 40% staking, 10% team
      const treasuryAmount = amount * 3000n / 10000n;
      const burnAmount = amount * 2000n / 10000n;
      const stakingAmount = amount * 4000n / 10000n;
      const teamAmount = amount * 1000n / 10000n;

      expect(await token.balanceOf(feeRouter.treasuryVault())).to.equal(treasuryBalBefore + treasuryAmount);
      expect(await token.balanceOf(burnAddr)).to.equal(burnBalBefore + burnAmount);
      expect(await token.balanceOf(feeRouter.stakingVault())).to.equal(stakingBalBefore + stakingAmount);
      expect(await token.balanceOf(feeRouter.teamVesting())).to.equal(teamBalBefore + teamAmount);
    });

    it("should reject distribution by non-collector", async function () {
      const { feeRouter, user, admin } = await loadFixture(deployFeeFixture);
      const OSANVToken = await ethers.getContractFactory("OSANVToken");
      const token = await OSANVToken.deploy(admin.address, admin.address, admin.address, admin.address);
      await token.waitForDeployment();
      await expect(
        feeRouter.connect(user).distributeFees(await token.getAddress(), ethers.parseEther("100"))
      ).to.be.reverted;
    });
  });

  describe("Configuration", function () {
    it("should allow configurer to update fee split", async function () {
      const { feeRouter, configurer } = await loadFixture(deployFeeFixture);
      await feeRouter.connect(configurer).setFeeSplit(2500, 1500, 5000, 1000);
      const split = await feeRouter.feeSplit();
      expect(split.treasuryBps).to.equal(2500);
      expect(split.burnBps).to.equal(1500);
      expect(split.stakingBps).to.equal(5000);
    });

    it("should reject split that doesn't sum to 100%", async function () {
      const { feeRouter, configurer } = await loadFixture(deployFeeFixture);
      await expect(
        feeRouter.connect(configurer).setFeeSplit(3000, 2000, 3000, 1000)
      ).to.be.revertedWith("must sum to 100%");
    });

    it("should allow configurer to update recipients", async function () {
      const { feeRouter, configurer, user } = await loadFixture(deployFeeFixture);
      await feeRouter.connect(configurer).setRecipient("treasury", user.address);
      expect(await feeRouter.treasuryVault()).to.equal(user.address);
    });
  });
});
