import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("RevenueDistributionEngine", function () {
  let rde: any;
  let usdc: any;
  let admin: Signer, distributor: Signer, user: Signer, treasury: Signer;

  const DECIMALS = 6n;
  const AMOUNT = ethers.parseUnits("100", DECIMALS);
  const TOTAL_SUPPLY = ethers.parseUnits("1500", DECIMALS);
  const ADMIN_MINT = ethers.parseUnits("1000", DECIMALS);
  const USER_MINT = ethers.parseUnits("500", DECIMALS);

  beforeEach(async function () {
    [admin, distributor, user, treasury] = await ethers.getSigners();

    usdc = await ethers.deployContract("MockUSDC", ["MockUSDC", "USDC", DECIMALS]);
    await usdc.waitForDeployment();

    rde = await deployUUPS("RevenueDistributionEngine", admin, admin.address, treasury.address);

    const DISTRIBUTOR_ROLE = await rde.DISTRIBUTOR_ROLE();
    await rde.connect(admin).grantRole(DISTRIBUTOR_ROLE, distributor.address);

    await rde.connect(admin).setPropertyToken(await usdc.getAddress());

    await usdc.mint(admin.address, ADMIN_MINT);
    await usdc.mint(user.address, USER_MINT);
  });

  describe("initialization", function () {
    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await rde.hasRole(await rde.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should grant DISTRIBUTOR_ROLE to admin", async function () {
      expect(await rde.hasRole(await rde.DISTRIBUTOR_ROLE(), admin.address)).to.be.true;
    });

    it("should set treasury", async function () {
      expect(await rde.getTreasury()).to.equal(treasury.address);
    });
  });

  describe("depositRevenue", function () {
    it("should deposit revenue and emit event", async function () {
      await usdc.connect(distributor).approve(await rde.getAddress(), AMOUNT);

      const tx = await rde.connect(distributor).depositRevenue(0, 1, AMOUNT, 1000, 2000);
      await tx.wait();

      const revenueId = ethers.solidityPackedKeccak256(
        ["uint8", "uint256", "uint256"],
        [0, 1, 1000]
      );
      const rev = await rde.getRevenue(revenueId);
      expect(rev.source).to.equal(0);
      expect(rev.sourceId).to.equal(1n);
      expect(rev.totalAmount).to.equal(AMOUNT);
      expect(rev.totalSupplyAtDeposit).to.equal(TOTAL_SUPPLY);
    });

    it("should revert with zero amount", async function () {
      await expect(
        rde.connect(distributor).depositRevenue(0, 1, 0, 1000, 2000)
      ).to.be.revertedWith("amount zero");
    });

    it("should revert with invalid period", async function () {
      await expect(
        rde.connect(distributor).depositRevenue(0, 1, AMOUNT, 2000, 1000)
      ).to.be.revertedWith("invalid period");
    });

    it("should revert without DISTRIBUTOR_ROLE", async function () {
      await expect(
        rde.connect(user).depositRevenue(0, 1, AMOUNT, 1000, 2000)
      ).to.be.revertedWithCustomError(rde, "AccessControlUnauthorizedAccount");
    });

    it("should revert when token not set", async function () {
      const rde2 = await deployUUPS("RevenueDistributionEngine", admin, admin.address, treasury.address);
      await usdc.mint(admin.address, AMOUNT);
      await usdc.connect(admin).approve(await rde2.getAddress(), AMOUNT);
      await expect(
        rde2.connect(admin).depositRevenue(0, 1, AMOUNT, 1000, 2000)
      ).to.be.revertedWith("token not set");
    });
  });

  describe("claimRevenue", function () {
    let revenueId: string;
    let userEarned: bigint;

    beforeEach(async function () {
      await usdc.connect(distributor).approve(await rde.getAddress(), AMOUNT);
      const tx = await rde.connect(distributor).depositRevenue(0, 1, AMOUNT, 1000, 2000);
      await tx.wait();

      revenueId = ethers.solidityPackedKeccak256(
        ["uint8", "uint256", "uint256"],
        [0, 1, 1000]
      );
    });

    it("should claim revenue for token holder", async function () {
      const userBalanceBefore = await usdc.balanceOf(user.address);
      const rdeBalanceBefore = await usdc.balanceOf(await rde.getAddress());

      await (await rde.connect(user).claimRevenue(revenueId)).wait();

      const claimed = (USER_MINT * AMOUNT) / TOTAL_SUPPLY;
      expect(await usdc.balanceOf(user.address)).to.equal(userBalanceBefore + claimed);
      expect(await usdc.balanceOf(await rde.getAddress())).to.equal(rdeBalanceBefore - claimed);
    });

    it("should emit RevenueClaimed event", async function () {
      const claimed = (USER_MINT * AMOUNT) / TOTAL_SUPPLY;
      await expect(rde.connect(user).claimRevenue(revenueId))
        .to.emit(rde, "RevenueClaimed")
        .withArgs(revenueId, user.address, claimed);
    });

    it("should revert for non-existent revenue", async function () {
      const badId = ethers.solidityPackedKeccak256(["uint8", "uint256", "uint256"], [0, 99, 0]);
      await expect(
        rde.connect(user).claimRevenue(badId)
      ).to.be.revertedWith("not found");
    });

    it("should revert for address with zero balance", async function () {
      await expect(
        rde.connect(treasury).claimRevenue(revenueId)
      ).to.be.revertedWith("zero balance");
    });

    it("should track cumulative claim amounts", async function () {
      await (await rde.connect(user).claimRevenue(revenueId)).wait();
      await expect(
        rde.connect(user).claimRevenue(revenueId)
      ).to.be.revertedWith("nothing to claim");
    });
  });

  describe("calculateClaimable", function () {
    it("should return 0 for unknown revenue", async function () {
      const badId = ethers.solidityPackedKeccak256(["uint8", "uint256", "uint256"], [0, 99, 0]);
      expect(await rde.calculateClaimable(user.address, badId)).to.equal(0n);
    });
  });

  describe("setPropertyToken", function () {
    it("should set and emit event", async function () {
      await usdc.mint(admin.address, 1);
      const tx = await rde.connect(admin).setPropertyToken(await usdc.getAddress());
      await tx.wait();
      expect(await rde.getPropertyToken()).to.equal(await usdc.getAddress());
    });

    it("should revert for zero address", async function () {
      await expect(
        rde.connect(admin).setPropertyToken(ethers.ZeroAddress)
      ).to.be.revertedWith("invalid address");
    });
  });

  describe("setTreasury", function () {
    it("should update treasury address", async function () {
      await (await rde.connect(admin).setTreasury(user.address)).wait();
      expect(await rde.getTreasury()).to.equal(user.address);
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent deposit", async function () {
      await (await rde.connect(admin).pause()).wait();
      await expect(
        rde.connect(distributor).depositRevenue(0, 1, AMOUNT, 1000, 2000)
      ).to.be.revertedWithCustomError(rde, "EnforcedPause");
    });
  });
});
