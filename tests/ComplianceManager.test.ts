import { expect } from "chai";
import { ethers } from "hardhat";
import { deployUUPS } from "./helpers/deploy";
import { Signer } from "ethers";

describe("ComplianceManager", function () {
  let compliance: any;
  let admin: Signer, complianceOfficer: Signer, investor: Signer, user: Signer;

  beforeEach(async function () {
    [admin, complianceOfficer, investor, user] = await ethers.getSigners();
    compliance = await deployUUPS("ComplianceManager", admin, admin.address);

    const COMPLIANCE_ROLE = await compliance.COMPLIANCE_ROLE();
    await compliance.connect(admin).grantRole(COMPLIANCE_ROLE, complianceOfficer.address);
  });

  describe("initialization", function () {
    it("should grant DEFAULT_ADMIN_ROLE to admin", async function () {
      expect(await compliance.hasRole(await compliance.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it("should grant COMPLIANCE_ROLE to admin", async function () {
      expect(await compliance.hasRole(await compliance.COMPLIANCE_ROLE(), admin.address)).to.be.true;
    });
  });

  describe("setInvestorKYC", function () {
    it("should set BASIC KYC level", async function () {
      const tx = await compliance.connect(complianceOfficer).setInvestorKYC(investor.address, 1);
      await tx.wait();

      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.kycLevel).to.equal(1);
    });

    it("should set ADVANCED KYC level", async function () {
      await (await compliance.connect(complianceOfficer).setInvestorKYC(investor.address, 2)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.kycLevel).to.equal(2);
    });

    it("should set INSTITUTIONAL KYC level", async function () {
      await (await compliance.connect(complianceOfficer).setInvestorKYC(investor.address, 3)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.kycLevel).to.equal(3);
    });

    it("should emit KYCLevelUpdated event", async function () {
      await expect(
        compliance.connect(complianceOfficer).setInvestorKYC(investor.address, 1)
      ).to.emit(compliance, "KYCLevelUpdated").withArgs(investor.address, 1, complianceOfficer.address);
    });

    it("should revert for zero address", async function () {
      await expect(
        compliance.connect(complianceOfficer).setInvestorKYC(ethers.ZeroAddress, 1)
      ).to.be.revertedWith("invalid address");
    });

    it("should revert without COMPLIANCE_ROLE", async function () {
      await expect(
        compliance.connect(user).setInvestorKYC(investor.address, 1)
      ).to.be.revertedWithCustomError(compliance, "AccessControlUnauthorizedAccount");
    });
  });

  describe("setInvestorType", function () {
    it("should set RETAIL investor type", async function () {
      await (await compliance.connect(complianceOfficer).setInvestorType(investor.address, 0)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.investorType).to.equal(0);
    });

    it("should set INSTITUTIONAL investor type", async function () {
      await (await compliance.connect(complianceOfficer).setInvestorType(investor.address, 2)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.investorType).to.equal(2);
    });
  });

  describe("approveInvestor / rejectInvestor / suspendInvestor", function () {
    it("should approve an investor and set whitelisted", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.status).to.equal(1);
      expect(status.whitelisted).to.be.true;
    });

    it("should emit InvestorApproved event", async function () {
      await expect(
        compliance.connect(complianceOfficer).approveInvestor(investor.address)
      ).to.emit(compliance, "InvestorApproved").withArgs(investor.address, complianceOfficer.address);
    });

    it("should reject an investor and remove whitelisted", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      await (await compliance.connect(complianceOfficer).rejectInvestor(investor.address)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.status).to.equal(2);
      expect(status.whitelisted).to.be.false;
    });

    it("should emit InvestorRejected event", async function () {
      await expect(
        compliance.connect(complianceOfficer).rejectInvestor(investor.address)
      ).to.emit(compliance, "InvestorRejected").withArgs(investor.address, complianceOfficer.address);
    });

    it("should suspend an approved investor", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      await (await compliance.connect(complianceOfficer).suspendInvestor(investor.address)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.status).to.equal(3);
      expect(status.whitelisted).to.be.false;
    });

    it("should emit InvestorSuspended event", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      await expect(
        compliance.connect(complianceOfficer).suspendInvestor(investor.address)
      ).to.emit(compliance, "InvestorSuspended").withArgs(investor.address, complianceOfficer.address);
    });

    it("should reject for zero address", async function () {
      await expect(
        compliance.connect(complianceOfficer).approveInvestor(ethers.ZeroAddress)
      ).to.be.revertedWith("invalid address");
    });
  });

  describe("setInvestmentCap", function () {
    it("should set an investment cap", async function () {
      await (await compliance.connect(complianceOfficer).setInvestmentCap(investor.address, 100000)).wait();
      const status = await compliance.getInvestorStatus(investor.address);
      expect(status.investmentCap).to.equal(100000n);
    });

    it("should emit InvestmentCapUpdated event", async function () {
      await expect(
        compliance.connect(complianceOfficer).setInvestmentCap(investor.address, 50000)
      ).to.emit(compliance, "InvestmentCapUpdated").withArgs(investor.address, 50000, complianceOfficer.address);
    });
  });

  describe("isWhitelisted", function () {
    it("should return false for unknown investor", async function () {
      expect(await compliance.isWhitelisted(investor.address)).to.be.false;
    });

    it("should return true for approved investor", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      expect(await compliance.isWhitelisted(investor.address)).to.be.true;
    });
  });

  describe("canReceivePropertyToken", function () {
    it("should return false if not whitelisted", async function () {
      expect(await compliance.canReceivePropertyToken(investor.address, 100)).to.be.false;
    });

    it("should return false if not approved", async function () {
      await (await compliance.connect(complianceOfficer).setInvestorKYC(investor.address, 1)).wait();
      expect(await compliance.canReceivePropertyToken(investor.address, 100)).to.be.false;
    });

    it("should return false if amount exceeds cap", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      await (await compliance.connect(complianceOfficer).setInvestmentCap(investor.address, 50)).wait();
      expect(await compliance.canReceivePropertyToken(investor.address, 100)).to.be.false;
    });

    it("should return true when all conditions met", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      await (await compliance.connect(complianceOfficer).setInvestmentCap(investor.address, 1000)).wait();
      expect(await compliance.canReceivePropertyToken(investor.address, 500)).to.be.true;
    });

    it("should respect exact cap boundary", async function () {
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      await (await compliance.connect(complianceOfficer).setInvestmentCap(investor.address, 100)).wait();
      expect(await compliance.canReceivePropertyToken(investor.address, 100)).to.be.true;
      expect(await compliance.canReceivePropertyToken(investor.address, 101)).to.be.false;
    });
  });

  describe("pause / unpause", function () {
    it("should pause and prevent compliance actions", async function () {
      await (await compliance.connect(admin).pause()).wait();
      await expect(
        compliance.connect(complianceOfficer).approveInvestor(investor.address)
      ).to.be.revertedWithCustomError(compliance, "EnforcedPause");
    });

    it("should unpause and allow actions", async function () {
      await (await compliance.connect(admin).pause()).wait();
      await (await compliance.connect(admin).unpause()).wait();
      await (await compliance.connect(complianceOfficer).approveInvestor(investor.address)).wait();
      expect(await compliance.isWhitelisted(investor.address)).to.be.true;
    });
  });
});
