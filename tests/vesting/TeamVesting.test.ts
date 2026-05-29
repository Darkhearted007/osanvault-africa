import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("TeamVesting", function () {
  async function deployVestingFixture() {
    const [admin, manager, beneficiary1, beneficiary2] = await ethers.getSigners();

    const OSANVToken = await ethers.getContractFactory("OSANVToken");
    const token = await OSANVToken.deploy(admin.address, admin.address, admin.address, admin.address);
    await token.waitForDeployment();

    const TeamVesting = await ethers.getContractFactory("TeamVesting");
    const vesting = await TeamVesting.deploy(admin.address, manager.address, await token.getAddress());
    await vesting.waitForDeployment();

    // Fund vesting contract
    await token.connect(admin).mint(await vesting.getAddress(), ethers.parseEther("1000000"));

    return { vesting, token, admin, manager, beneficiary1, beneficiary2 };
  }

  describe("Deployment", function () {
    it("should set roles correctly", async function () {
      const { vesting, admin, manager } = await loadFixture(deployVestingFixture);
      const DEFAULT_ADMIN = await vesting.DEFAULT_ADMIN_ROLE();
      const MANAGER_ROLE = await vesting.MANAGER_ROLE();
      expect(await vesting.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await vesting.hasRole(MANAGER_ROLE, manager.address)).to.be.true;
    });
  });

  describe("Beneficiary Management", function () {
    it("should add a beneficiary with vesting schedule", async function () {
      const { vesting, manager, beneficiary1 } = await loadFixture(deployVestingFixture);
      const allocation = ethers.parseEther("100000");
      const cliff = 30 * 24 * 3600;
      const vestingDuration = 365 * 24 * 3600;

      await vesting.connect(manager).addBeneficiary(beneficiary1.address, allocation, cliff, vestingDuration);
      const info = await vesting.beneficiaries(beneficiary1.address);
      expect(info.totalAllocation).to.equal(allocation);
      expect(info.initialized).to.be.true;
    });

    it("should reject adding duplicate beneficiary", async function () {
      const { vesting, manager, beneficiary1 } = await loadFixture(deployVestingFixture);
      await vesting.connect(manager).addBeneficiary(beneficiary1.address, ethers.parseEther("100000"), 0, 365 * 24 * 3600);
      await expect(
        vesting.connect(manager).addBeneficiary(beneficiary1.address, ethers.parseEther("50000"), 0, 365 * 24 * 3600)
      ).to.be.revertedWith("already added");
    });
  });

  describe("Token Release", function () {
    it("should not release before cliff", async function () {
      const { vesting, manager, beneficiary1 } = await loadFixture(deployVestingFixture);
      await vesting.connect(manager).addBeneficiary(
        beneficiary1.address,
        ethers.parseEther("100000"),
        30 * 24 * 3600,
        365 * 24 * 3600
      );
      expect(await vesting.connect(beneficiary1).releasableAmount(beneficiary1.address)).to.equal(0);
    });

    it("should release after cliff", async function () {
      const { vesting, manager, beneficiary1 } = await loadFixture(deployVestingFixture);
      const allocation = ethers.parseEther("100000");
      await vesting.connect(manager).addBeneficiary(
        beneficiary1.address,
        allocation,
        30 * 24 * 3600,
        365 * 24 * 3600
      );
      await time.increase(60 * 24 * 3600);
      const releasable = await vesting.connect(beneficiary1).releasableAmount(beneficiary1.address);
      expect(releasable).to.be.gt(0);
    });

    it("should release all tokens after full vesting", async function () {
      const { vesting, manager, beneficiary1 } = await loadFixture(deployVestingFixture);
      const allocation = ethers.parseEther("100000");
      await vesting.connect(manager).addBeneficiary(
        beneficiary1.address,
        allocation,
        30 * 24 * 3600,
        365 * 24 * 3600
      );
      await time.increase(400 * 24 * 3600);
      const releasable = await vesting.connect(beneficiary1).releasableAmount(beneficiary1.address);
      expect(releasable).to.equal(allocation);
    });

    it("should allow beneficiary to release", async function () {
      const { vesting, manager, beneficiary1 } = await loadFixture(deployVestingFixture);
      const allocation = ethers.parseEther("100000");
      await vesting.connect(manager).addBeneficiary(
        beneficiary1.address,
        allocation,
        0,
        365 * 24 * 3600
      );
      await time.increase(100 * 24 * 3600);

      const balanceBefore = await vesting.vestingToken();
      await vesting.connect(beneficiary1).release();
      const released = await vesting.beneficiaries(beneficiary1.address);
      expect(released.released).to.be.gt(0);
    });
  });
});
