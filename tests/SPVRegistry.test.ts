import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("SPVRegistry", function () {
  let spvRegistry: any;
  let admin: Signer, registrar: Signer, verifier: Signer, user: Signer;

  beforeEach(async function () {
    [admin, registrar, verifier, user] = await ethers.getSigners();
    spvRegistry = await deployUUPS("SPVRegistry", admin, admin.address);

    const REGISTRAR_ROLE = await spvRegistry.REGISTRAR_ROLE();
    const VERIFIER_ROLE = await spvRegistry.VERIFIER_ROLE();
    await spvRegistry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await spvRegistry.connect(admin).grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("initialization", function () {
    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await spvRegistry.hasRole(await spvRegistry.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should grant UPGRADER_ROLE to admin", async function () {
      expect(await spvRegistry.hasRole(await spvRegistry.UPGRADER_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("registerSPV", function () {
    it("should register an SPV with all fields", async function () {
      const tx = await spvRegistry.connect(registrar).registerSPV(
        "Test SPV", "Nigeria", "RC12345", "QmTestCID"
      );
      await tx.wait();

      const spv = await spvRegistry.getSPV(1);
      expect(spv.spvId).to.equal(1n);
      expect(spv.name).to.equal("Test SPV");
      expect(spv.jurisdiction).to.equal("Nigeria");
      expect(spv.registrationNumber).to.equal("RC12345");
      expect(spv.legalDocumentCID).to.equal("QmTestCID");
      expect(spv.verified).to.be.false;
    });

    it("should auto-increment SPV IDs", async function () {
      await (await spvRegistry.connect(registrar).registerSPV("SPV1", "NG", "R1", "C1")).wait();
      await (await spvRegistry.connect(registrar).registerSPV("SPV2", "GH", "R2", "C2")).wait();
      expect(await spvRegistry.getSPVCount()).to.equal(2n);
    });

    it("should emit SPVRegistered event", async function () {
      await expect(
        spvRegistry.connect(registrar).registerSPV("SPV", "NG", "R1", "CID")
      ).to.emit(spvRegistry, "SPVRegistered").withArgs(1, "SPV", "NG", registrar.address);
    });

    it("should revert when called without REGISTRAR_ROLE", async function () {
      await expect(
        spvRegistry.connect(user).registerSPV("SPV", "NG", "R1", "CID")
      ).to.be.revertedWithCustomError(spvRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("verifySPV", function () {
    beforeEach(async function () {
      await (await spvRegistry.connect(registrar).registerSPV("Test SPV", "NG", "RC1", "CID")).wait();
    });

    it("should verify an unverified SPV", async function () {
      await (await spvRegistry.connect(verifier).verifySPV(1)).wait();
      const spv = await spvRegistry.getSPV(1);
      expect(spv.verified).to.be.true;
    });

    it("should emit SPVVerified event", async function () {
      await expect(
        spvRegistry.connect(verifier).verifySPV(1)
      ).to.emit(spvRegistry, "SPVVerified").withArgs(1, verifier.address);
    });

    it("should revert verifying an already verified SPV", async function () {
      await (await spvRegistry.connect(verifier).verifySPV(1)).wait();
      await expect(
        spvRegistry.connect(verifier).verifySPV(1)
      ).to.be.revertedWith("already verified");
    });

    it("should revert for non-existent SPV", async function () {
      await expect(
        spvRegistry.connect(verifier).verifySPV(99)
      ).to.be.revertedWith("SPV not found");
    });

    it("should revert when called without VERIFIER_ROLE", async function () {
      await expect(
        spvRegistry.connect(user).verifySPV(1)
      ).to.be.revertedWithCustomError(spvRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("linkAssetToSPV", function () {
    beforeEach(async function () {
      await (await spvRegistry.connect(registrar).registerSPV("SPV", "NG", "RC1", "CID")).wait();
    });

    it("should link an asset to an SPV", async function () {
      await (await spvRegistry.connect(registrar).linkAssetToSPV(1, 42)).wait();
      const assets = await spvRegistry.getLinkedAssets(1);
      expect(assets).to.deep.equal([42n]);
    });

    it("should link multiple assets", async function () {
      await (await spvRegistry.connect(registrar).linkAssetToSPV(1, 10)).wait();
      await (await spvRegistry.connect(registrar).linkAssetToSPV(1, 20)).wait();
      const assets = await spvRegistry.getLinkedAssets(1);
      expect(assets).to.deep.equal([10n, 20n]);
    });

    it("should emit AssetLinkedToSPV event", async function () {
      await expect(
        spvRegistry.connect(registrar).linkAssetToSPV(1, 42)
      ).to.emit(spvRegistry, "AssetLinkedToSPV").withArgs(1, 42);
    });

    it("should revert for non-existent SPV", async function () {
      await expect(
        spvRegistry.connect(registrar).linkAssetToSPV(99, 1)
      ).to.be.revertedWith("SPV not found");
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent registration", async function () {
      await (await spvRegistry.connect(admin).pause()).wait();
      await expect(
        spvRegistry.connect(registrar).registerSPV("SPV", "NG", "R1", "CID")
      ).to.be.revertedWithCustomError(spvRegistry, "EnforcedPause");
    });

    it("should unpause and allow registration", async function () {
      await (await spvRegistry.connect(admin).pause()).wait();
      await (await spvRegistry.connect(admin).unpause()).wait();
      await (await spvRegistry.connect(registrar).registerSPV("SPV", "NG", "R1", "CID")).wait();
      expect(await spvRegistry.getSPVCount()).to.equal(1n);
    });
  });
});
