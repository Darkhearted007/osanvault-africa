import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("CarbonRetirement", function () {
  let carbonRegistry: any;
  let carbonRetirement: any;
  let admin: Signer, registrar: Signer, verifier: Signer, user: Signer;

  beforeEach(async function () {
    [admin, registrar, verifier, user] = await ethers.getSigners();

    carbonRegistry = await deployUUPS("CarbonRegistry", admin, admin.address);
    carbonRetirement = await deployUUPS(
      "CarbonRetirement", admin, admin.address, await carbonRegistry.getAddress()
    );

    const REGISTRAR_ROLE = await carbonRegistry.REGISTRAR_ROLE();
    const VERIFIER_ROLE = await carbonRegistry.VERIFIER_ROLE();
    await carbonRegistry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await carbonRegistry.connect(admin).grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("initialization", function () {
    it("should set carbon registry address", async function () {
      expect(await carbonRetirement.carbonRegistry()).to.equal(await carbonRegistry.getAddress());
    });

    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await carbonRetirement.hasRole(await carbonRetirement.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should grant VERIFIER_ROLE to admin", async function () {
      expect(await carbonRetirement.hasRole(await carbonRetirement.VERIFIER_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("setCarbonRegistry", function () {
    it("should update the carbon registry address", async function () {
      await (await carbonRetirement.connect(admin).setCarbonRegistry(verifier.address)).wait();
      expect(await carbonRetirement.carbonRegistry()).to.equal(verifier.address);
    });

    it("should revert with zero address", async function () {
      await expect(
        carbonRetirement.connect(admin).setCarbonRegistry(ethers.ZeroAddress)
      ).to.be.revertedWith("invalid registry");
    });
  });

  describe("retireCredits", function () {
    beforeEach(async function () {
      await (await carbonRegistry.connect(registrar).registerProject(
        "Reforestation", "VM0003", "Nigeria", 2024, 0, 0
      )).wait();
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      await (await carbonRegistry.connect(verifier).issueCredits(1, 1000, user.address)).wait();
    });

    it("should retire credits with beneficiary details", async function () {
      const tx = await carbonRetirement.connect(admin).retireCredits(
        1, 100, "Green Corp", "Offsetting Q1 emissions"
      );
      await tx.wait();

      const project = await carbonRegistry.getProject(1);
      expect(project.totalRetired).to.equal(100n);
    });

    it("should create a retirement record with serial number", async function () {
      await (await carbonRetirement.connect(admin).retireCredits(
        1, 200, "Beneficiary A", "Carbon offset"
      )).wait();

      const retirement = await carbonRetirement.getRetirement(1);
      expect(retirement.retirementId).to.equal(1n);
      expect(retirement.retirer).to.equal(admin.address);
      expect(retirement.projectId).to.equal(1n);
      expect(retirement.amount).to.equal(200n);
      expect(retirement.beneficiary).to.equal("Beneficiary A");
      expect(retirement.reason).to.equal("Carbon offset");
      expect(retirement.serialNumber).to.include("OSV-");
    });

    it("should generate unique serial numbers", async function () {
      await (await carbonRetirement.connect(admin).retireCredits(1, 100, "B1", "R1")).wait();
      await (await carbonRetirement.connect(admin).retireCredits(1, 100, "B2", "R2")).wait();

      const r1 = await carbonRetirement.getRetirement(1);
      const r2 = await carbonRetirement.getRetirement(2);
      expect(r1.serialNumber).to.not.equal(r2.serialNumber);
    });

    it("should emit CreditsRetired event", async function () {
      await expect(
        carbonRetirement.connect(admin).retireCredits(1, 150, "Green Corp", "Offsetting")
      ).to.emit(carbonRetirement, "CreditsRetired");
    });

    it("should revert with zero beneficiary", async function () {
      await expect(
        carbonRetirement.connect(admin).retireCredits(1, 100, "", "Reason")
      ).to.be.revertedWith("empty beneficiary");
    });

    it("should revert with zero amount", async function () {
      await expect(
        carbonRetirement.connect(admin).retireCredits(1, 0, "Ben", "Reason")
      ).to.be.revertedWith("amount zero");
    });

    it("should revert if not enough credits in CarbonRegistry", async function () {
      await expect(
        carbonRetirement.connect(admin).retireCredits(1, 9999, "Ben", "Reason")
      ).to.be.revertedWith("insufficient credits");
    });
  });

  describe("setCertificateCID", function () {
    beforeEach(async function () {
      await (await carbonRegistry.connect(registrar).registerProject("R", "M1", "NG", 2024, 0, 0)).wait();
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      await (await carbonRegistry.connect(verifier).issueCredits(1, 500, user.address)).wait();
      await (await carbonRetirement.connect(admin).retireCredits(1, 50, "Ben", "Reason")).wait();
    });

    it("should set certificate CID", async function () {
      await (await carbonRetirement.connect(admin).setCertificateCID(1, "QmCertificateCID")).wait();
      const retirement = await carbonRetirement.getRetirement(1);
      expect(retirement.certificateCID).to.equal("QmCertificateCID");
    });

    it("should revert with empty CID", async function () {
      await expect(
        carbonRetirement.connect(admin).setCertificateCID(1, "")
      ).to.be.revertedWith("empty CID");
    });

    it("should revert for non-existent retirement", async function () {
      await expect(
        carbonRetirement.connect(admin).setCertificateCID(99, "QmCID")
      ).to.be.revertedWith("retirement not found");
    });
  });

  describe("getRetirementsByRetirer", function () {
    it("should return retirement IDs for a retirer", async function () {
      await (await carbonRegistry.connect(registrar).registerProject("R", "M1", "NG", 2024, 0, 0)).wait();
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      await (await carbonRegistry.connect(verifier).issueCredits(1, 500, user.address)).wait();

      await (await carbonRetirement.connect(admin).retireCredits(1, 100, "B1", "R1")).wait();
      await (await carbonRetirement.connect(admin).retireCredits(1, 100, "B2", "R2")).wait();

      const retirements = await carbonRetirement.getRetirementsByRetirer(admin.address);
      expect(retirements).to.deep.equal([1n, 2n]);
    });
  });

  describe("isSerialNumberUsed", function () {
    it("should return false for unused serial", async function () {
      expect(await carbonRetirement.isSerialNumberUsed("OSV-1-1-1-1000")).to.be.false;
    });
  });

  describe("retirement count", function () {
    it("should increment on each retirement", async function () {
      await (await carbonRegistry.connect(registrar).registerProject("R", "M1", "NG", 2024, 0, 0)).wait();
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      await (await carbonRegistry.connect(verifier).issueCredits(1, 500, user.address)).wait();

      await (await carbonRetirement.connect(admin).retireCredits(1, 100, "B", "R")).wait();
      expect(await carbonRetirement.getRetirementCount()).to.equal(1n);
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent retirement", async function () {
      await (await carbonRetirement.connect(admin).pause()).wait();
      await expect(
        carbonRetirement.connect(admin).retireCredits(1, 100, "Ben", "Reason")
      ).to.be.revertedWithCustomError(carbonRetirement, "EnforcedPause");
    });
  });
});
