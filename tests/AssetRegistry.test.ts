import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("AssetRegistry", function () {
  let assetRegistry: any;
  let admin: Signer, registrar: Signer, user: Signer;

  beforeEach(async function () {
    [admin, registrar, user] = await ethers.getSigners();
    assetRegistry = await deployUUPS("AssetRegistry", admin, admin.address);

    const REGISTRAR_ROLE = await assetRegistry.REGISTRAR_ROLE();
    await assetRegistry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
  });

  describe("initialization", function () {
    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await assetRegistry.hasRole(await assetRegistry.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should grant REGISTRAR_ROLE to admin", async function () {
      expect(await assetRegistry.hasRole(await assetRegistry.REGISTRAR_ROLE(), admin.address)).to.be.true;
    });

    it("should grant UPGRADER_ROLE to admin", async function () {
      expect(await assetRegistry.hasRole(await assetRegistry.UPGRADER_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("registerAsset", function () {
    it("should register REAL_ESTATE asset type", async function () {
      const tx = await assetRegistry.connect(registrar).registerAsset(0, "uri://realestate", 0);
      await tx.wait();

      const asset = await assetRegistry.getAsset(1);
      expect(asset.assetId).to.equal(1n);
      expect(asset.assetType).to.equal(0);
      expect(asset.metadataURI).to.equal("uri://realestate");
      expect(asset.linkedSPV).to.equal(0n);
      expect(asset.status).to.equal(0);
    });

    it("should register LAND asset type", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(1, "uri://land", 0)).wait();
      const asset = await assetRegistry.getAsset(1);
      expect(asset.assetType).to.equal(1);
    });

    it("should register CARBON asset type", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(2, "uri://carbon", 0)).wait();
      const asset = await assetRegistry.getAsset(1);
      expect(asset.assetType).to.equal(2);
    });

    it("should register MINERAL asset type", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(3, "uri://mineral", 0)).wait();
      const asset = await assetRegistry.getAsset(1);
      expect(asset.assetType).to.equal(3);
    });

    it("should register REIT asset type", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(4, "uri://reit", 0)).wait();
      const asset = await assetRegistry.getAsset(1);
      expect(asset.assetType).to.equal(4);
    });

    it("should auto-increment asset IDs", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(0, "uri://a", 0)).wait();
      await (await assetRegistry.connect(registrar).registerAsset(1, "uri://b", 0)).wait();
      expect(await assetRegistry.getAssetCount()).to.equal(2n);
    });

    it("should emit AssetRegistered event", async function () {
      await expect(
        assetRegistry.connect(registrar).registerAsset(0, "uri://event", 0)
      ).to.emit(assetRegistry, "AssetRegistered").withArgs(1, 0, registrar.address);
    });

    it("should revert when called without REGISTRAR_ROLE", async function () {
      await expect(
        assetRegistry.connect(user).registerAsset(0, "uri://test", 0)
      ).to.be.revertedWithCustomError(assetRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("updateAsset", function () {
    it("should update metadata URI", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(0, "uri://old", 0)).wait();
      await (await assetRegistry.connect(registrar).updateAsset(1, "uri://new")).wait();

      const asset = await assetRegistry.getAsset(1);
      expect(asset.metadataURI).to.equal("uri://new");
    });

    it("should emit AssetUpdated event", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(0, "uri://old", 0)).wait();
      await expect(
        assetRegistry.connect(registrar).updateAsset(1, "uri://new")
      ).to.emit(assetRegistry, "AssetUpdated").withArgs(1, "uri://new");
    });

    it("should revert for non-existent asset", async function () {
      await expect(
        assetRegistry.connect(registrar).updateAsset(99, "uri://test")
      ).to.be.revertedWith("asset not found");
    });
  });

  describe("deactivateAsset / activateAsset", function () {
    beforeEach(async function () {
      await (await assetRegistry.connect(registrar).registerAsset(0, "uri://test", 0)).wait();
    });

    it("should deactivate an active asset", async function () {
      await (await assetRegistry.connect(registrar).deactivateAsset(1)).wait();
      const asset = await assetRegistry.getAsset(1);
      expect(asset.status).to.equal(1);
    });

    it("should emit AssetDeactivated event", async function () {
      await expect(
        assetRegistry.connect(registrar).deactivateAsset(1)
      ).to.emit(assetRegistry, "AssetDeactivated").withArgs(1);
    });

    it("should revert deactivating an already inactive asset", async function () {
      await (await assetRegistry.connect(registrar).deactivateAsset(1)).wait();
      await expect(
        assetRegistry.connect(registrar).deactivateAsset(1)
      ).to.be.revertedWith("already inactive");
    });

    it("should reactivate a deactivated asset", async function () {
      await (await assetRegistry.connect(registrar).deactivateAsset(1)).wait();
      await (await assetRegistry.connect(registrar).activateAsset(1)).wait();
      const asset = await assetRegistry.getAsset(1);
      expect(asset.status).to.equal(0);
    });

    it("should emit AssetActivated event", async function () {
      await (await assetRegistry.connect(registrar).deactivateAsset(1)).wait();
      await expect(
        assetRegistry.connect(registrar).activateAsset(1)
      ).to.emit(assetRegistry, "AssetActivated").withArgs(1);
    });

    it("should revert activating an already active asset", async function () {
      await expect(
        assetRegistry.connect(registrar).activateAsset(1)
      ).to.be.revertedWith("already active");
    });
  });

  describe("getAsset", function () {
    it("should revert for asset ID 0", async function () {
      await expect(assetRegistry.getAsset(0)).to.be.revertedWith("asset not found");
    });

    it("should revert for non-existent asset ID", async function () {
      await expect(assetRegistry.getAsset(99)).to.be.revertedWith("asset not found");
    });
  });

  describe("getAssetsByType", function () {
    it("should return empty array when no assets of type", async function () {
      const assets = await assetRegistry.getAssetsByType(0);
      expect(assets.length).to.equal(0);
    });

    it("should return correct asset IDs grouped by type", async function () {
      await (await assetRegistry.connect(registrar).registerAsset(0, "uri://re1", 0)).wait();
      await (await assetRegistry.connect(registrar).registerAsset(1, "uri://land1", 0)).wait();
      await (await assetRegistry.connect(registrar).registerAsset(0, "uri://re2", 0)).wait();

      const realEstate = await assetRegistry.getAssetsByType(0);
      const land = await assetRegistry.getAssetsByType(1);

      expect(realEstate).to.deep.equal([1n, 3n]);
      expect(land).to.deep.equal([2n]);
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent registration", async function () {
      await (await assetRegistry.connect(admin).pause()).wait();
      await expect(
        assetRegistry.connect(registrar).registerAsset(0, "uri://test", 0)
      ).to.be.revertedWithCustomError(assetRegistry, "EnforcedPause");
    });

    it("should unpause and allow registration", async function () {
      await (await assetRegistry.connect(admin).pause()).wait();
      await (await assetRegistry.connect(admin).unpause()).wait();
      await (await assetRegistry.connect(registrar).registerAsset(0, "uri://test", 0)).wait();
      expect(await assetRegistry.getAssetCount()).to.equal(1n);
    });

    it("should revert pause from non-admin", async function () {
      await expect(
        assetRegistry.connect(user).pause()
      ).to.be.revertedWithCustomError(assetRegistry, "AccessControlUnauthorizedAccount");
    });
  });
});
