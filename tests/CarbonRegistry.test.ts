import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("CarbonRegistry", function () {
  let carbonRegistry: any;
  let admin: Signer, registrar: Signer, verifier: Signer, user: Signer;

  beforeEach(async function () {
    [admin, registrar, verifier, user] = await ethers.getSigners();
    carbonRegistry = await deployUUPS("CarbonRegistry", admin, admin.address);

    const REGISTRAR_ROLE = await carbonRegistry.REGISTRAR_ROLE();
    const VERIFIER_ROLE = await carbonRegistry.VERIFIER_ROLE();
    await carbonRegistry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await carbonRegistry.connect(admin).grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("initialization", function () {
    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await carbonRegistry.hasRole(await carbonRegistry.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("registerProject", function () {
    it("should register a project with VCS standard", async function () {
      const tx = await carbonRegistry.connect(registrar).registerProject(
        "Reforestation", "VM0003", "Nigeria", 2024, 0, 0
      );
      await tx.wait();

      const project = await carbonRegistry.getProject(1);
      expect(project.projectId).to.equal(1n);
      expect(project.name).to.equal("Reforestation");
      expect(project.methodology).to.equal("VM0003");
      expect(project.region).to.equal("Nigeria");
      expect(project.vintage).to.equal(2024n);
      expect(project.standard).to.equal(0);
      expect(project.totalIssued).to.equal(0n);
      expect(project.verified).to.be.false;
    });

    it("should register with GoldStandard standard", async function () {
      await (await carbonRegistry.connect(registrar).registerProject(
        "Solar", "GS-V1", "Ghana", 2023, 1, 0
      )).wait();
      const project = await carbonRegistry.getProject(1);
      expect(project.standard).to.equal(1);
    });

    it("should register with PlanVivo standard", async function () {
      await (await carbonRegistry.connect(registrar).registerProject(
        "Agroforestry", "PV-1", "Kenya", 2025, 2, 0
      )).wait();
      const project = await carbonRegistry.getProject(1);
      expect(project.standard).to.equal(2);
    });

    it("should register with Other standard", async function () {
      await (await carbonRegistry.connect(registrar).registerProject(
        "Mangrove", "CUSTOM", "Senegal", 2024, 3, 0
      )).wait();
      const project = await carbonRegistry.getProject(1);
      expect(project.standard).to.equal(3);
    });

    it("should revert with empty name", async function () {
      await expect(
        carbonRegistry.connect(registrar).registerProject("", "VM0003", "NG", 2024, 0, 0)
      ).to.be.revertedWith("empty name");
    });

    it("should revert without REGISTRAR_ROLE", async function () {
      await expect(
        carbonRegistry.connect(user).registerProject("Test", "VM", "NG", 2024, 0, 0)
      ).to.be.revertedWithCustomError(carbonRegistry, "AccessControlUnauthorizedAccount");
    });

    it("should auto-increment project IDs", async function () {
      await (await carbonRegistry.connect(registrar).registerProject("A", "M1", "NG", 2024, 0, 0)).wait();
      await (await carbonRegistry.connect(registrar).registerProject("B", "M2", "GH", 2025, 1, 0)).wait();
      expect(await carbonRegistry.getProjectCount()).to.equal(2n);
    });
  });

  describe("verifyProject", function () {
    beforeEach(async function () {
      await (await carbonRegistry.connect(registrar).registerProject(
        "Reforestation", "VM0003", "Nigeria", 2024, 0, 0
      )).wait();
    });

    it("should verify a project", async function () {
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      const project = await carbonRegistry.getProject(1);
      expect(project.verified).to.be.true;
      expect(project.verifier).to.equal(verifier.address);
    });

    it("should emit ProjectVerified event", async function () {
      await expect(
        carbonRegistry.connect(verifier).verifyProject(1)
      ).to.emit(carbonRegistry, "ProjectVerified").withArgs(1, verifier.address);
    });

    it("should revert verifying already verified project", async function () {
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      await expect(
        carbonRegistry.connect(verifier).verifyProject(1)
      ).to.be.revertedWith("already verified");
    });

    it("should revert for non-existent project", async function () {
      await expect(
        carbonRegistry.connect(verifier).verifyProject(99)
      ).to.be.revertedWith("project not found");
    });
  });

  describe("issueCredits", function () {
    beforeEach(async function () {
      await (await carbonRegistry.connect(registrar).registerProject(
        "Reforestation", "VM0003", "Nigeria", 2024, 0, 0
      )).wait();
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
    });

    it("should issue credits to a recipient", async function () {
      await (await carbonRegistry.connect(verifier).issueCredits(1, 1000, user.address)).wait();
      const project = await carbonRegistry.getProject(1);
      expect(project.totalIssued).to.equal(1000n);
    });

    it("should emit CreditsIssued event", async function () {
      await expect(
        carbonRegistry.connect(verifier).issueCredits(1, 500, user.address)
      ).to.emit(carbonRegistry, "CreditsIssued").withArgs(1, 500, user.address);
    });

    it("should accumulate totalIssued", async function () {
      await (await carbonRegistry.connect(verifier).issueCredits(1, 500, user.address)).wait();
      await (await carbonRegistry.connect(verifier).issueCredits(1, 300, user.address)).wait();
      expect((await carbonRegistry.getProject(1)).totalIssued).to.equal(800n);
    });

    it("should revert for unverified project", async function () {
      await (await carbonRegistry.connect(registrar).registerProject(
        "Unverified", "M1", "NG", 2024, 0, 0
      )).wait();
      await expect(
        carbonRegistry.connect(verifier).issueCredits(2, 100, user.address)
      ).to.be.revertedWith("not verified");
    });

    it("should revert with zero amount", async function () {
      await expect(
        carbonRegistry.connect(verifier).issueCredits(1, 0, user.address)
      ).to.be.revertedWith("amount zero");
    });

    it("should revert with zero recipient", async function () {
      await expect(
        carbonRegistry.connect(verifier).issueCredits(1, 100, ethers.ZeroAddress)
      ).to.be.revertedWith("invalid recipient");
    });
  });

  describe("retireCredits", function () {
    beforeEach(async function () {
      await (await carbonRegistry.connect(registrar).registerProject("R", "M1", "NG", 2024, 0, 0)).wait();
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      await (await carbonRegistry.connect(verifier).issueCredits(1, 1000, user.address)).wait();
    });

    it("should retire credits from available pool", async function () {
      await (await carbonRegistry.connect(user).retireCredits(1, 300)).wait();
      const project = await carbonRegistry.getProject(1);
      expect(project.totalRetired).to.equal(300n);
    });

    it("should update available credits", async function () {
      await (await carbonRegistry.connect(user).retireCredits(1, 300)).wait();
      expect(await carbonRegistry.getAvailableCredits(1)).to.equal(700n);
    });

    it("should revert retiring more than available", async function () {
      await expect(
        carbonRegistry.connect(user).retireCredits(1, 2000)
      ).to.be.revertedWith("insufficient credits");
    });

    it("should emit CreditsRetired event", async function () {
      await expect(
        carbonRegistry.connect(user).retireCredits(1, 100)
      ).to.emit(carbonRegistry, "CreditsRetired").withArgs(1, 100, user.address);
    });
  });

  describe("getAvailableCredits", function () {
    it("should return 0 for new project", async function () {
      await (await carbonRegistry.connect(registrar).registerProject("R", "M1", "NG", 2024, 0, 0)).wait();
      expect(await carbonRegistry.getAvailableCredits(1)).to.equal(0n);
    });

    it("should return issued minus retired", async function () {
      await (await carbonRegistry.connect(registrar).registerProject("R", "M1", "NG", 2024, 0, 0)).wait();
      await (await carbonRegistry.connect(verifier).verifyProject(1)).wait();
      await (await carbonRegistry.connect(verifier).issueCredits(1, 1000, user.address)).wait();
      await (await carbonRegistry.connect(user).retireCredits(1, 400)).wait();
      expect(await carbonRegistry.getAvailableCredits(1)).to.equal(600n);
    });

    it("should revert for non-existent project", async function () {
      await expect(
        carbonRegistry.getAvailableCredits(99)
      ).to.be.revertedWith("project not found");
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent registration", async function () {
      await (await carbonRegistry.connect(admin).pause()).wait();
      await expect(
        carbonRegistry.connect(registrar).registerProject("R", "M1", "NG", 2024, 0, 0)
      ).to.be.revertedWithCustomError(carbonRegistry, "EnforcedPause");
    });
  });
});
