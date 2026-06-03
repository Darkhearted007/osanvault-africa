import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("MineralsModule", function () {
  let minerals: any;
  let admin: Signer, mineralAdmin: Signer, producer: Signer, user: Signer;

  beforeEach(async function () {
    [admin, mineralAdmin, producer, user] = await ethers.getSigners();
    minerals = await deployUUPS("MineralsModule", admin, admin.address, user.address);

    const MINERAL_ADMIN_ROLE = await minerals.MINERAL_ADMIN_ROLE();
    const PRODUCER_ROLE = await minerals.PRODUCER_ROLE();
    await minerals.connect(admin).grantRole(MINERAL_ADMIN_ROLE, mineralAdmin.address);
    await minerals.connect(admin).grantRole(PRODUCER_ROLE, producer.address);
  });

  describe("initialization", function () {
    it("should set revenue distribution engine", async function () {
      expect(await minerals.revenueDistributionEngine()).to.equal(user.address);
    });

    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await minerals.hasRole(await minerals.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("registerMineralAsset", function () {
    it("should register a GOLD asset", async function () {
      const tx = await minerals.connect(mineralAdmin).registerMineralAsset(
        "Gold Mine A", 0, "Lagos", "Nigeria", "QmLicense", 1_000_000, 0
      );
      await tx.wait();

      const asset = await minerals.getMineralAsset(1);
      expect(asset.assetId).to.equal(1n);
      expect(asset.name).to.equal("Gold Mine A");
      expect(asset.mineralType).to.equal(0);
      expect(asset.location).to.equal("Lagos");
      expect(asset.estimatedReserves).to.equal(1_000_000n);
      expect(asset.verified).to.be.false;
    });

    it("should register LITHIUM asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Lithium Deposit", 1, "Kitui", "Kenya", "QmCID", 500_000, 0
      )).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.mineralType).to.equal(1);
    });

    it("should register OIL asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Oil Field", 2, "Delta", "Nigeria", "QmCID", 10_000_000, 0
      )).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.mineralType).to.equal(2);
    });

    it("should register GAS asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Gas Field", 3, "Lagos", "Nigeria", "QmCID", 5_000_000, 0
      )).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.mineralType).to.equal(3);
    });

    it("should register QUARRY asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Quarry", 4, "Abeokuta", "Nigeria", "QmCID", 2_000_000, 0
      )).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.mineralType).to.equal(4);
    });

    it("should register COPPER asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Copper Mine", 5, "Zambia", "Zambia", "QmCID", 3_000_000, 0
      )).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.mineralType).to.equal(5);
    });

    it("should register COBALT asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Cobalt Mine", 6, "DRC", "DRC", "QmCID", 1_000_000, 0
      )).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.mineralType).to.equal(6);
    });

    it("should register OTHER asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Other Mineral", 7, "Accra", "Ghana", "QmCID", 100_000, 0
      )).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.mineralType).to.equal(7);
    });

    it("should emit MineralAssetRegistered event", async function () {
      await expect(
        minerals.connect(mineralAdmin).registerMineralAsset(
          "Gold", 0, "Lagos", "NG", "QmCID", 1000, 0
        )
      ).to.emit(minerals, "MineralAssetRegistered").withArgs(1, "Gold", 0, mineralAdmin.address);
    });

    it("should revert without MINERAL_ADMIN_ROLE", async function () {
      await expect(
        minerals.connect(user).registerMineralAsset("G", 0, "L", "NG", "C", 100, 0)
      ).to.be.revertedWithCustomError(minerals, "AccessControlUnauthorizedAccount");
    });

    it("should auto-increment asset IDs", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset("A", 0, "L", "NG", "C", 100, 0)).wait();
      await (await minerals.connect(mineralAdmin).registerMineralAsset("B", 1, "L", "GH", "C", 200, 0)).wait();
      expect(await minerals.getMineralAssetCount()).to.equal(2n);
    });
  });

  describe("verifyMineralAsset", function () {
    beforeEach(async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Gold Mine", 0, "Lagos", "Nigeria", "QmLicense", 1_000_000, 0
      )).wait();
    });

    it("should verify an unverified asset", async function () {
      await (await minerals.connect(mineralAdmin).verifyMineralAsset(1)).wait();
      const asset = await minerals.getMineralAsset(1);
      expect(asset.verified).to.be.true;
    });

    it("should emit MineralAssetVerified event", async function () {
      await expect(
        minerals.connect(mineralAdmin).verifyMineralAsset(1)
      ).to.emit(minerals, "MineralAssetVerified").withArgs(1, mineralAdmin.address);
    });

    it("should revert verifying already verified asset", async function () {
      await (await minerals.connect(mineralAdmin).verifyMineralAsset(1)).wait();
      await expect(
        minerals.connect(mineralAdmin).verifyMineralAsset(1)
      ).to.be.revertedWith("verified");
    });

    it("should revert for non-existent asset", async function () {
      await expect(
        minerals.connect(mineralAdmin).verifyMineralAsset(99)
      ).to.be.revertedWith("not found");
    });
  });

  describe("recordProduction", function () {
    beforeEach(async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Gold Mine", 0, "Lagos", "Nigeria", "QmCID", 1_000_000, 0
      )).wait();
      await (await minerals.connect(mineralAdmin).verifyMineralAsset(1)).wait();
    });

    it("should record production", async function () {
      await (await minerals.connect(producer).recordProduction(1, 5000)).wait();
      const history = await minerals.getProductionHistory(1);
      expect(history.length).to.equal(1);
      expect(history[0].amount).to.equal(5000n);
    });

    it("should emit ProductionRecorded event", async function () {
      await expect(
        minerals.connect(producer).recordProduction(1, 3000)
      ).to.emit(minerals, "ProductionRecorded").withArgs(1, 3000, 1);
    });

    it("should accumulate production records", async function () {
      await (await minerals.connect(producer).recordProduction(1, 1000)).wait();
      await (await minerals.connect(producer).recordProduction(1, 2000)).wait();
      const history = await minerals.getProductionHistory(1);
      expect(history.length).to.equal(2);
      expect(history[0].amount).to.equal(1000n);
      expect(history[1].amount).to.equal(2000n);
    });

    it("should revert for unverified asset", async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Unverified", 0, "L", "NG", "C", 100, 0
      )).wait();
      await expect(
        minerals.connect(producer).recordProduction(2, 100)
      ).to.be.revertedWith("not verified");
    });

    it("should revert without PRODUCER_ROLE", async function () {
      await expect(
        minerals.connect(user).recordProduction(1, 100)
      ).to.be.revertedWithCustomError(minerals, "AccessControlUnauthorizedAccount");
    });
  });

  describe("recordRoyaltyRevenue", function () {
    beforeEach(async function () {
      await (await minerals.connect(mineralAdmin).registerMineralAsset(
        "Gold Mine", 0, "Lagos", "Nigeria", "QmCID", 1_000_000, 0
      )).wait();
    });

    it("should record royalty revenue", async function () {
      await (await minerals.connect(mineralAdmin).recordRoyaltyRevenue(1, 50_000)).wait();
      const royalty = await minerals.getRoyaltyRevenue(1);
      expect(royalty.totalRevenue).to.equal(50_000n);
    });

    it("should accumulate royalty revenue", async function () {
      await (await minerals.connect(mineralAdmin).recordRoyaltyRevenue(1, 10_000)).wait();
      await (await minerals.connect(mineralAdmin).recordRoyaltyRevenue(1, 20_000)).wait();
      const royalty = await minerals.getRoyaltyRevenue(1);
      expect(royalty.totalRevenue).to.equal(30_000n);
    });

    it("should emit RoyaltyRevenueRecorded event", async function () {
      await expect(
        minerals.connect(mineralAdmin).recordRoyaltyRevenue(1, 25_000)
      ).to.emit(minerals, "RoyaltyRevenueRecorded").withArgs(1, 25_000);
    });

    it("should revert for non-existent asset", async function () {
      await expect(
        minerals.connect(mineralAdmin).recordRoyaltyRevenue(99, 100)
      ).to.be.revertedWith("not found");
    });

    it("should revert without MINERAL_ADMIN_ROLE", async function () {
      await expect(
        minerals.connect(user).recordRoyaltyRevenue(1, 100)
      ).to.be.revertedWithCustomError(minerals, "AccessControlUnauthorizedAccount");
    });
  });

  describe("setRevenueDistributionEngine", function () {
    it("should update the RDE address", async function () {
      await (await minerals.connect(admin).setRevenueDistributionEngine(producer.address)).wait();
      expect(await minerals.revenueDistributionEngine()).to.equal(producer.address);
    });

    it("should revert with zero address", async function () {
      await expect(
        minerals.connect(admin).setRevenueDistributionEngine(ethers.ZeroAddress)
      ).to.be.revertedWith("invalid");
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent registration", async function () {
      await (await minerals.connect(admin).pause()).wait();
      await expect(
        minerals.connect(mineralAdmin).registerMineralAsset("G", 0, "L", "NG", "C", 100, 0)
      ).to.be.revertedWithCustomError(minerals, "EnforcedPause");
    });
  });
});
