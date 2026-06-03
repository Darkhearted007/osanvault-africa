import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("LandRegistry", function () {
  let landRegistry: any;
  let admin: Signer, registrar: Signer, gov: Signer, indigenous: Signer, user: Signer;

  beforeEach(async function () {
    [admin, registrar, gov, indigenous, user] = await ethers.getSigners();
    landRegistry = await deployUUPS("LandRegistry", admin, admin.address);

    const REGISTRAR_ROLE = await landRegistry.REGISTRAR_ROLE();
    const GOVERNMENT_ROLE = await landRegistry.GOVERNMENT_ROLE();
    const INDIGENOUS_REP_ROLE = await landRegistry.INDIGENOUS_REP_ROLE();
    await landRegistry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await landRegistry.connect(admin).grantRole(GOVERNMENT_ROLE, gov.address);
    await landRegistry.connect(admin).grantRole(INDIGENOUS_REP_ROLE, indigenous.address);
  });

  async function registerParcel() {
    return landRegistry.connect(registrar).registerParcel("Lagos", "Nigeria", "QmTitleDeed", 1000, "6.45,3.39");
  }

  async function fullyVerifyParcel() {
    await (await registerParcel()).wait();
    await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
    await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
    await (await landRegistry.connect(indigenous).verifyIndigenous(1)).wait();
  }

  describe("registerParcel", function () {
    it("should register a parcel with all fields", async function () {
      const tx = await registerParcel();
      await tx.wait();

      const parcel = await landRegistry.getParcel(1);
      expect(parcel.parcelId).to.equal(1n);
      expect(parcel.location).to.equal("Lagos");
      expect(parcel.jurisdiction).to.equal("Nigeria");
      expect(parcel.titleDeedCID).to.equal("QmTitleDeed");
      expect(parcel.area).to.equal(1000n);
      expect(parcel.coordinates).to.equal("6.45,3.39");
      expect(parcel.status).to.equal(0);
    });

    it("should emit ParcelRegistered event", async function () {
      await expect(registerParcel())
        .to.emit(landRegistry, "ParcelRegistered")
        .withArgs(1, "Lagos", "Nigeria", registrar.address);
    });

    it("should revert with zero area", async function () {
      await expect(
        landRegistry.connect(registrar).registerParcel("Lagos", "NG", "CID", 0, "0,0")
      ).to.be.revertedWith("area zero");
    });

    it("should revert with empty location", async function () {
      await expect(
        landRegistry.connect(registrar).registerParcel("", "NG", "CID", 100, "0,0")
      ).to.be.revertedWith("empty location");
    });

    it("should revert with empty jurisdiction", async function () {
      await expect(
        landRegistry.connect(registrar).registerParcel("Lagos", "", "CID", 100, "0,0")
      ).to.be.revertedWith("empty jurisdiction");
    });

    it("should revert without REGISTRAR_ROLE", async function () {
      await expect(
        landRegistry.connect(user).registerParcel("Lagos", "NG", "CID", 100, "0,0")
      ).to.be.revertedWithCustomError(landRegistry, "AccessControlUnauthorizedAccount");
    });

    it("should auto-increment parcel IDs", async function () {
      await (await registerParcel()).wait();
      await (await landRegistry.connect(registrar).registerParcel("Abuja", "NG", "C2", 200, "9.0,7.0")).wait();
      expect(await landRegistry.getParcelCount()).to.equal(2n);
    });
  });

  describe("applyForVerification", function () {
    beforeEach(async function () {
      await (await registerParcel()).wait();
    });

    it("should transition from REGISTERED to PENDING", async function () {
      await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(1);
    });

    it("should emit ParcelVerificationApplied event", async function () {
      await expect(landRegistry.connect(registrar).applyForVerification(1))
        .to.emit(landRegistry, "ParcelVerificationApplied").withArgs(1, registrar.address);
    });

    it("should revert if not REGISTERED", async function () {
      await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
      await expect(
        landRegistry.connect(registrar).applyForVerification(1)
      ).to.be.revertedWith("not registered");
    });

    it("should revert for non-existent parcel", async function () {
      await expect(
        landRegistry.connect(registrar).applyForVerification(99)
      ).to.be.revertedWith("parcel not found");
    });
  });

  describe("verifyGovernment", function () {
    beforeEach(async function () {
      await (await registerParcel()).wait();
      await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
    });

    it("should set governmentVerified flag", async function () {
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      const parcel = await landRegistry.getParcel(1);
      expect(parcel.governmentVerified).to.be.true;
    });

    it("should remain PENDING after single verification", async function () {
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(1);
    });

    it("should revert for non-PENDING parcel", async function () {
      // Register a new parcel without applying
      await (await landRegistry.connect(registrar).registerParcel("Abuja", "NG", "C2", 200, "0,0")).wait();
      await expect(
        landRegistry.connect(gov).verifyGovernment(2)
      ).to.be.revertedWith("not pending");
    });

    it("should revert if already gov verified", async function () {
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      await expect(
        landRegistry.connect(gov).verifyGovernment(1)
      ).to.be.revertedWith("gov already verified");
    });

    it("should revert without GOVERNMENT_ROLE", async function () {
      await expect(
        landRegistry.connect(user).verifyGovernment(1)
      ).to.be.revertedWithCustomError(landRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("verifyIndigenous", function () {
    beforeEach(async function () {
      await (await registerParcel()).wait();
      await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
    });

    it("should set indigenousVerified flag", async function () {
      await (await landRegistry.connect(indigenous).verifyIndigenous(1)).wait();
      const parcel = await landRegistry.getParcel(1);
      expect(parcel.indigenousVerified).to.be.true;
    });

    it("should revert without INDIGENOUS_REP_ROLE", async function () {
      await expect(
        landRegistry.connect(user).verifyIndigenous(1)
      ).to.be.revertedWithCustomError(landRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("dual verification", function () {
    beforeEach(async function () {
      await (await registerParcel()).wait();
      await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
    });

    it("should transition to VERIFIED after both gov and indigenous verification", async function () {
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      await (await landRegistry.connect(indigenous).verifyIndigenous(1)).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(2);
    });

    it("should transition to VERIFIED regardless of verification order", async function () {
      await (await landRegistry.connect(indigenous).verifyIndigenous(1)).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(1);
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(2);
    });

    it("should emit ParcelStatusChanged on verification", async function () {
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      await expect(landRegistry.connect(indigenous).verifyIndigenous(1))
        .to.emit(landRegistry, "ParcelStatusChanged").withArgs(1, 1, 2);
    });
  });

  describe("assignSPV", function () {
    beforeEach(async function () {
      await (await registerParcel()).wait();
      await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      await (await landRegistry.connect(indigenous).verifyIndigenous(1)).wait();
    });

    it("should transition to TOKENIZED", async function () {
      await (await landRegistry.connect(registrar).assignSPV(1, 42)).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(4);
    });

    it("should store the SPV ID", async function () {
      await (await landRegistry.connect(registrar).assignSPV(1, 42)).wait();
      expect(await landRegistry.getParcelSPVId(1)).to.equal(42n);
    });

    it("should emit SPVAssigned event", async function () {
      await expect(landRegistry.connect(registrar).assignSPV(1, 42))
        .to.emit(landRegistry, "SPVAssigned").withArgs(1, 42, registrar.address);
    });

    it("should revert if not VERIFIED", async function () {
      // Register new parcel without verifying
      await (await landRegistry.connect(registrar).registerParcel("Abuja", "NG", "C2", 200, "0,0")).wait();
      await expect(
        landRegistry.connect(registrar).assignSPV(2, 1)
      ).to.be.revertedWith("not verified");
    });

    it("should revert with invalid SPV ID", async function () {
      await expect(
        landRegistry.connect(registrar).assignSPV(1, 0)
      ).to.be.revertedWith("invalid spv");
    });
  });

  describe("raiseDispute / resolveDispute", function () {
    beforeEach(async function () {
      await (await registerParcel()).wait();
      await (await landRegistry.connect(registrar).applyForVerification(1)).wait();
      await (await landRegistry.connect(gov).verifyGovernment(1)).wait();
      await (await landRegistry.connect(indigenous).verifyIndigenous(1)).wait();
    });

    it("should raise a dispute on a verified parcel", async function () {
      await (await landRegistry.connect(user).raiseDispute(1, "Land ownership contested")).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(3);
    });

    it("should store the dispute reason", async function () {
      await (await landRegistry.connect(user).raiseDispute(1, "Boundary dispute")).wait();
      expect(await landRegistry.getDisputeReason(1)).to.equal("Boundary dispute");
    });

    it("should emit ParcelDisputed event", async function () {
      await expect(landRegistry.connect(user).raiseDispute(1, "Disputed"))
        .to.emit(landRegistry, "ParcelDisputed").withArgs(1, "Disputed", user.address);
    });

    it("should revert if already disputed", async function () {
      await (await landRegistry.connect(user).raiseDispute(1, "Reason")).wait();
      await expect(
        landRegistry.connect(user).raiseDispute(1, "Again")
      ).to.be.revertedWith("already disputed");
    });

    it("should revert if already tokenized", async function () {
      await (await landRegistry.connect(registrar).assignSPV(1, 5)).wait();
      await expect(
        landRegistry.connect(user).raiseDispute(1, "Late dispute")
      ).to.be.revertedWith("already tokenized");
    });

    it("should resolve a dispute back to VERIFIED", async function () {
      await (await landRegistry.connect(user).raiseDispute(1, "Issue")).wait();
      await (await landRegistry.connect(gov).resolveDispute(1)).wait();
      expect(await landRegistry.getParcelStatus(1)).to.equal(2);
    });

    it("should emit ParcelDisputeResolved event", async function () {
      await (await landRegistry.connect(user).raiseDispute(1, "Issue")).wait();
      await expect(landRegistry.connect(gov).resolveDispute(1))
        .to.emit(landRegistry, "ParcelDisputeResolved").withArgs(1, gov.address);
    });

    it("should revert resolving non-disputed parcel", async function () {
      await expect(
        landRegistry.connect(gov).resolveDispute(1)
      ).to.be.revertedWith("not disputed");
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent registration", async function () {
      await (await landRegistry.connect(admin).pause()).wait();
      await expect(registerParcel())
        .to.be.revertedWithCustomError(landRegistry, "EnforcedPause");
    });
  });
});
