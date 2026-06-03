import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("PPPRegistry", function () {
  let ppp: any;
  let admin: Signer, pppAdmin: Signer, user: Signer;
  let partnerId: bigint;

  beforeEach(async function () {
    [admin, pppAdmin, user] = await ethers.getSigners();
    ppp = await deployUUPS("PPPRegistry", admin, admin.address);

    const PPP_ADMIN_ROLE = await ppp.PPP_ADMIN_ROLE();
    await ppp.connect(admin).grantRole(PPP_ADMIN_ROLE, pppAdmin.address);
  });

  describe("initialization", function () {
    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await ppp.hasRole(await ppp.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should grant PPP_ADMIN_ROLE to admin", async function () {
      expect(await ppp.hasRole(await ppp.PPP_ADMIN_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("registerPartner", function () {
    it("should register a government partner", async function () {
      const tx = await ppp.connect(pppAdmin).registerPartner(
        "Ministry of Environment", "Nigeria", "Lagos", "Climate",
        "0x1234567890123456789012345678901234567890", "QmAgreementCID"
      );
      await tx.wait();

      const partner = await ppp.getPartner(1);
      expect(partner.partnerId).to.equal(1n);
      expect(partner.name).to.equal("Ministry of Environment");
      expect(partner.country).to.equal("Nigeria");
      expect(partner.region).to.equal("Lagos");
      expect(partner.department).to.equal("Climate");
      expect(partner.verified).to.be.false;
    });

    it("should emit PartnerRegistered event", async function () {
      await expect(
        ppp.connect(pppAdmin).registerPartner(
          "Ministry", "Nigeria", "Lagos", "Dept",
          "0x1234567890123456789012345678901234567890", "QmCID"
        )
      ).to.emit(ppp, "PartnerRegistered").withArgs(1, "Ministry", "Nigeria", pppAdmin.address);
    });

    it("should auto-increment partner IDs", async function () {
      await (await ppp.connect(pppAdmin).registerPartner("A", "NG", "Lagos", "D1", ethers.ZeroAddress, "C1")).wait();
      await (await ppp.connect(pppAdmin).registerPartner("B", "GH", "Accra", "D2", ethers.ZeroAddress, "C2")).wait();
      expect(await ppp.getPartnerCount()).to.equal(2n);
    });

    it("should revert without PPP_ADMIN_ROLE", async function () {
      await expect(
        ppp.connect(user).registerPartner("M", "NG", "L", "D", ethers.ZeroAddress, "C")
      ).to.be.revertedWithCustomError(ppp, "AccessControlUnauthorizedAccount");
    });
  });

  describe("verifyPartner", function () {
    beforeEach(async function () {
      await (await ppp.connect(pppAdmin).registerPartner(
        "Ministry", "Nigeria", "Lagos", "Dept", ethers.ZeroAddress, "QmCID"
      )).wait();
    });

    it("should verify a partner", async function () {
      await (await ppp.connect(pppAdmin).verifyPartner(1)).wait();
      const partner = await ppp.getPartner(1);
      expect(partner.verified).to.be.true;
    });

    it("should emit PartnerVerified event", async function () {
      await expect(
        ppp.connect(pppAdmin).verifyPartner(1)
      ).to.emit(ppp, "PartnerVerified").withArgs(1, pppAdmin.address);
    });

    it("should revert verifying already verified partner", async function () {
      await (await ppp.connect(pppAdmin).verifyPartner(1)).wait();
      await expect(
        ppp.connect(pppAdmin).verifyPartner(1)
      ).to.be.revertedWith("already verified");
    });

    it("should revert for non-existent partner", async function () {
      await expect(
        ppp.connect(pppAdmin).verifyPartner(99)
      ).to.be.revertedWith("partner not found");
    });
  });

  describe("registerProject", function () {
    beforeEach(async function () {
      await (await ppp.connect(pppAdmin).registerPartner(
        "Ministry", "Nigeria", "Lagos", "Dept", ethers.ZeroAddress, "QmCID"
      )).wait();
      await (await ppp.connect(pppAdmin).verifyPartner(1)).wait();
    });

    it("should register a PPP project under a verified partner", async function () {
      const tx = await ppp.connect(pppAdmin).registerProject(
        1, "Reforestation Lagos", "Plant 1M trees", 1_000_000, 500_000, 1000, 2000
      );
      await tx.wait();

      const project = await ppp.getProject(1);
      expect(project.projectId).to.equal(1n);
      expect(project.partnerId).to.equal(1n);
      expect(project.name).to.equal("Reforestation Lagos");
      expect(project.totalInvestment).to.equal(1_000_000n);
      expect(project.carbonTarget).to.equal(500_000n);
      expect(project.active).to.be.true;
    });

    it("should emit PPPProjectRegistered event", async function () {
      await expect(
        ppp.connect(pppAdmin).registerProject(1, "Project", "Desc", 100, 50, 1000, 2000)
      ).to.emit(ppp, "PPPProjectRegistered").withArgs(1, "Project", 1);
    });

    it("should revert for unverified partner", async function () {
      await (await ppp.connect(pppAdmin).registerPartner(
        "Unverified", "NG", "Lagos", "Dept", ethers.ZeroAddress, "CID"
      )).wait();
      await expect(
        ppp.connect(pppAdmin).registerProject(2, "P", "D", 100, 50, 1000, 2000)
      ).to.be.revertedWith("partner not verified");
    });

    it("should revert for non-existent partner", async function () {
      await expect(
        ppp.connect(pppAdmin).registerProject(99, "P", "D", 100, 50, 1000, 2000)
      ).to.be.revertedWith("partner not found");
    });
  });

  describe("recordInvestment", function () {
    beforeEach(async function () {
      await (await ppp.connect(pppAdmin).registerPartner("M", "NG", "L", "D", ethers.ZeroAddress, "C")).wait();
      await (await ppp.connect(pppAdmin).verifyPartner(1)).wait();
      await (await ppp.connect(pppAdmin).registerProject(1, "Proj", "Desc", 100, 50, 1000, 2000)).wait();
    });

    it("should record additional investment", async function () {
      await (await ppp.connect(pppAdmin).recordInvestment(1, 500_000)).wait();
      const project = await ppp.getProject(1);
      expect(project.totalInvestment).to.equal(600_000n);
    });

    it("should emit InvestmentRecorded event", async function () {
      await expect(
        ppp.connect(pppAdmin).recordInvestment(1, 200_000)
      ).to.emit(ppp, "InvestmentRecorded").withArgs(1, 200_000);
    });

    it("should revert for non-existent project", async function () {
      await expect(
        ppp.connect(pppAdmin).recordInvestment(99, 100)
      ).to.be.revertedWith("project not found");
    });
  });

  describe("recordCarbonOutput", function () {
    beforeEach(async function () {
      await (await ppp.connect(pppAdmin).registerPartner("M", "NG", "L", "D", ethers.ZeroAddress, "C")).wait();
      await (await ppp.connect(pppAdmin).verifyPartner(1)).wait();
      await (await ppp.connect(pppAdmin).registerProject(1, "Proj", "Desc", 100, 50, 1000, 2000)).wait();
    });

    it("should record carbon output", async function () {
      await (await ppp.connect(pppAdmin).recordCarbonOutput(1, 25_000)).wait();
      const project = await ppp.getProject(1);
      expect(project.carbonAchieved).to.equal(25_000n);
    });

    it("should accumulate carbon outputs", async function () {
      await (await ppp.connect(pppAdmin).recordCarbonOutput(1, 10_000)).wait();
      await (await ppp.connect(pppAdmin).recordCarbonOutput(1, 15_000)).wait();
      const project = await ppp.getProject(1);
      expect(project.carbonAchieved).to.equal(25_000n);
    });

    it("should emit CarbonOutputRecorded event", async function () {
      await expect(
        ppp.connect(pppAdmin).recordCarbonOutput(1, 30_000)
      ).to.emit(ppp, "CarbonOutputRecorded").withArgs(1, 30_000);
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent partner registration", async function () {
      await (await ppp.connect(admin).pause()).wait();
      await expect(
        ppp.connect(pppAdmin).registerPartner("M", "NG", "L", "D", ethers.ZeroAddress, "C")
      ).to.be.revertedWithCustomError(ppp, "EnforcedPause");
    });
  });
});
