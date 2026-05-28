import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("OsanCarbon", function () {
  async function deployCarbonFixture() {
    const [admin, verifier, verifier2, user1, user2] = await ethers.getSigners();
    const baseURI = "https://api.osanvault.africa/metadata/carbon/";

    const OsanCarbon = await ethers.getContractFactory("OsanCarbon");
    const carbon = await OsanCarbon.deploy(admin.address, verifier.address, baseURI);
    await carbon.waitForDeployment();

    return { carbon, admin, verifier, verifier2, user1, user2 };
  }

  describe("Deployment", function () {
    it("should set roles correctly", async function () {
      const { carbon, admin, verifier } = await loadFixture(deployCarbonFixture);
      const DEFAULT_ADMIN = await carbon.DEFAULT_ADMIN_ROLE();
      const VERIFIER_ROLE = await carbon.VERIFIER_ROLE();
      const PAUSER_ROLE = await carbon.PAUSER_ROLE();

      expect(await carbon.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
      expect(await carbon.hasRole(VERIFIER_ROLE, verifier.address)).to.be.true;
      expect(await carbon.hasRole(PAUSER_ROLE, admin.address)).to.be.true;
    });

    it("should start with zero projects", async function () {
      const { carbon } = await loadFixture(deployCarbonFixture);
      expect(await carbon.getProjectCount()).to.equal(0);
    });
  });

  describe("Project Lifecycle", function () {
    it("should allow verifier to create a project", async function () {
      const { carbon, verifier } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject(
        "Mangrove Restoration Kenya",
        "VM0033",
        "Kenya",
        2025,
        "ipfs://carbon/1"
      );
      expect(await carbon.getProjectCount()).to.equal(1);
    });

    it("should reject creation by non-verifier", async function () {
      const { carbon, user1 } = await loadFixture(deployCarbonFixture);
      await expect(
        carbon.connect(user1).createProject("Test", "Meth", "Region", 2025, "")
      ).to.be.reverted;
    });

    it("should allow verifier to verify project", async function () {
      const { carbon, verifier } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await carbon.connect(verifier).verifyProject(1);
      const project = await carbon.getProject(1);
      expect(project.verified).to.be.true;
    });

    it("should reject verification by wrong verifier", async function () {
      const { carbon, admin, verifier, verifier2 } = await loadFixture(deployCarbonFixture);
      // Grant verifier2 the VERIFIER_ROLE so they pass role check but fail project ownership
      const VERIFIER_ROLE = await carbon.VERIFIER_ROLE();
      await carbon.connect(admin).grantRole(VERIFIER_ROLE, verifier2.address);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await expect(
        carbon.connect(verifier2).verifyProject(1)
      ).to.be.revertedWith("not project verifier");
    });
  });

  describe("Credits", function () {
    it("should issue credits to recipient", async function () {
      const { carbon, verifier, user1 } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await carbon.connect(verifier).verifyProject(1);
      await carbon.connect(verifier).issueCredits(1, ethers.parseEther("1000"), user1.address);
      expect(await carbon.balanceOf(user1.address, 1)).to.equal(ethers.parseEther("1000"));
    });

    it("should reject issuing to unverified project", async function () {
      const { carbon, verifier, user1 } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await expect(
        carbon.connect(verifier).issueCredits(1, ethers.parseEther("1000"), user1.address)
      ).to.be.revertedWith("project not verified");
    });

    it("should reject issuing above project cap", async function () {
      const { carbon, verifier, user1 } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await carbon.connect(verifier).verifyProject(1);
      const MAX = await carbon.MAX_SUPPLY_PER_PROJECT();
      await carbon.connect(verifier).issueCredits(1, MAX, user1.address);
      await expect(
        carbon.connect(verifier).issueCredits(1, 1, user1.address)
      ).to.be.revertedWith("exceeds project cap");
    });
  });

  describe("Retirement", function () {
    it("should allow holder to retire credits", async function () {
      const { carbon, verifier, user1 } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await carbon.connect(verifier).verifyProject(1);
      await carbon.connect(verifier).issueCredits(1, ethers.parseEther("1000"), user1.address);
      await carbon.connect(user1).retireCredits(1, ethers.parseEther("500"), "Offsetting travel");
      expect(await carbon.balanceOf(user1.address, 1)).to.equal(ethers.parseEther("500"));
    });

    it("should reject retire with insufficient balance", async function () {
      const { carbon, user1 } = await loadFixture(deployCarbonFixture);
      await expect(
        carbon.connect(user1).retireCredits(1, ethers.parseEther("100"), "test")
      ).to.be.revertedWith("insufficient balance");
    });
  });

  describe("retireCreditsFrom", function () {
    it("should allow approved operator to retire on behalf", async function () {
      const { carbon, verifier, user1, user2 } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await carbon.connect(verifier).verifyProject(1);
      await carbon.connect(verifier).issueCredits(1, ethers.parseEther("1000"), user1.address);

      // User1 approves User2 as operator
      await carbon.connect(user1).setApprovalForAll(user2.address, true);
      await carbon.connect(user2).retireCreditsFrom(user1.address, 1, ethers.parseEther("300"), "Relayed retirement");

      expect(await carbon.balanceOf(user1.address, 1)).to.equal(ethers.parseEther("700"));
    });

    it("should allow holder to call retireCreditsFrom directly", async function () {
      const { carbon, verifier, user1 } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await carbon.connect(verifier).verifyProject(1);
      await carbon.connect(verifier).issueCredits(1, ethers.parseEther("1000"), user1.address);

      await carbon.connect(user1).retireCreditsFrom(user1.address, 1, ethers.parseEther("100"), "Self-retire via from");
      expect(await carbon.balanceOf(user1.address, 1)).to.equal(ethers.parseEther("900"));
    });

    it("should reject unapproved operator", async function () {
      const { carbon, verifier, user1, user2 } = await loadFixture(deployCarbonFixture);
      await carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "");
      await carbon.connect(verifier).verifyProject(1);
      await carbon.connect(verifier).issueCredits(1, ethers.parseEther("1000"), user1.address);

      await expect(
        carbon.connect(user2).retireCreditsFrom(user1.address, 1, ethers.parseEther("100"), "Unauthorized")
      ).to.be.revertedWith("not approved");
    });
  });

  describe("Fee Config", function () {
    it("should allow admin to set fee config", async function () {
      const { carbon, admin, user1 } = await loadFixture(deployCarbonFixture);

      const OSANVToken = await ethers.getContractFactory("OSANVToken");
      const token = await OSANVToken.deploy(admin.address, admin.address, admin.address, admin.address);
      await token.waitForDeployment();

      const FeeRouter = await ethers.getContractFactory("FeeRouter");
      const feeRouter = await FeeRouter.deploy(admin.address, admin.address, admin.address, user1.address, user1.address, user1.address);
      await feeRouter.waitForDeployment();

      await carbon.connect(admin).setFeeConfig(await feeRouter.getAddress(), await token.getAddress(), ethers.parseEther("0.01"));
      expect(await carbon.retirementFeePerCredit()).to.equal(ethers.parseEther("0.01"));
    });

    it("should reject fee config by non-admin", async function () {
      const { carbon, verifier } = await loadFixture(deployCarbonFixture);
      await expect(
        carbon.connect(verifier).setFeeConfig(ethers.ZeroAddress, ethers.ZeroAddress, 0)
      ).to.be.reverted;
    });
  });

  describe("Pausing", function () {
    it("should allow pauser to pause", async function () {
      const { carbon, admin } = await loadFixture(deployCarbonFixture);
      await carbon.connect(admin).pause();
      expect(await carbon.paused()).to.be.true;
      await carbon.connect(admin).unpause();
      expect(await carbon.paused()).to.be.false;
    });

    it("should block actions when paused", async function () {
      const { carbon, admin, verifier } = await loadFixture(deployCarbonFixture);
      await carbon.connect(admin).pause();
      await expect(
        carbon.connect(verifier).createProject("Test", "Meth", "Region", 2025, "")
      ).to.be.reverted;
    });
  });
});
