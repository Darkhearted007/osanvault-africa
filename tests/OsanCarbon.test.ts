import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { OsanCarbon } from "../typechain-types";

const BASE_URI = "https://api.osanvault.africa/metadata/";

describe("OsanCarbon", function () {
  let contract: OsanCarbon;
  let admin: HardhatEthersSigner;
  let verifier: HardhatEthersSigner;
  let verifier2: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  beforeEach(async () => {
    [admin, verifier, verifier2, user, other] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("OsanCarbon");
    contract = (await Factory.deploy(
      admin.address,
      verifier.address,
      BASE_URI
    )) as OsanCarbon;
    await contract.waitForDeployment();
  });

  // ──────────────────────────────────────────────
  // Deployment
  // ──────────────────────────────────────────────

  describe("Deployment", function () {
    it("grants DEFAULT_ADMIN_ROLE to admin", async () => {
      const role = await contract.DEFAULT_ADMIN_ROLE();
      expect(await contract.hasRole(role, admin.address)).to.be.true;
    });

    it("grants VERIFIER_ROLE to initial verifier", async () => {
      const role = await contract.VERIFIER_ROLE();
      expect(await contract.hasRole(role, verifier.address)).to.be.true;
    });

    it("grants PAUSER_ROLE to admin", async () => {
      const role = await contract.PAUSER_ROLE();
      expect(await contract.hasRole(role, admin.address)).to.be.true;
    });

    it("reverts with zero admin address", async () => {
      const Factory = await ethers.getContractFactory("OsanCarbon");
      await expect(
        Factory.deploy(ethers.ZeroAddress, verifier.address, BASE_URI)
      ).to.be.revertedWith("invalid admin");
    });

    it("reverts with zero verifier address", async () => {
      const Factory = await ethers.getContractFactory("OsanCarbon");
      await expect(
        Factory.deploy(admin.address, ethers.ZeroAddress, BASE_URI)
      ).to.be.revertedWith("invalid verifier");
    });
  });

  // ──────────────────────────────────────────────
  // createProject
  // ──────────────────────────────────────────────

  describe("createProject", function () {
    it("creates a project and increments counter", async () => {
      await contract
        .connect(verifier)
        .createProject("Mangrove Kenya", "VM0007", "East Africa", 2024, "ipfs://abc");

      expect(await contract.getProjectCount()).to.equal(1n);
    });

    it("records project verifier correctly", async () => {
      await contract
        .connect(verifier)
        .createProject("Savanna Tanzania", "ACM0001", "East Africa", 2024, "ipfs://def");

      expect(await contract.projectVerifier(1n)).to.equal(verifier.address);
    });

    it("stores project metadata correctly", async () => {
      await contract
        .connect(verifier)
        .createProject("Solar Zambia", "AMS0002", "Southern Africa", 2023, "ipfs://ghi");

      const p = await contract.getProject(1n);
      expect(p.name).to.equal("Solar Zambia");
      expect(p.methodology).to.equal("AMS0002");
      expect(p.region).to.equal("Southern Africa");
      expect(p.vintage).to.equal(2023n);
      expect(p.verified).to.be.false;
      expect(p.totalIssued).to.equal(0n);
    });

    it("emits ProjectCreated event", async () => {
      await expect(
        contract
          .connect(verifier)
          .createProject("Wind Nigeria", "ACM0002", "West Africa", 2024, "ipfs://xyz")
      )
        .to.emit(contract, "ProjectCreated")
        .withArgs(1n, "Wind Nigeria", "ACM0002", "West Africa", 2024n, verifier.address);
    });

    it("reverts if caller lacks VERIFIER_ROLE", async () => {
      await expect(
        contract
          .connect(other)
          .createProject("X", "Y", "Z", 2024, "ipfs://0")
      ).to.be.reverted;
    });

    it("reverts when contract is paused", async () => {
      await contract.connect(admin).pause();
      await expect(
        contract
          .connect(verifier)
          .createProject("X", "Y", "Z", 2024, "ipfs://0")
      ).to.be.reverted;
    });
  });

  // ──────────────────────────────────────────────
  // verifyProject
  // ──────────────────────────────────────────────

  describe("verifyProject", function () {
    beforeEach(async () => {
      await contract
        .connect(verifier)
        .createProject("Mangrove Kenya", "VM0007", "East Africa", 2024, "ipfs://abc");
    });

    it("marks a project as verified", async () => {
      await contract.connect(verifier).verifyProject(1n);
      const p = await contract.getProject(1n);
      expect(p.verified).to.be.true;
    });

    it("emits ProjectVerified event", async () => {
      await expect(contract.connect(verifier).verifyProject(1n))
        .to.emit(contract, "ProjectVerified")
        .withArgs(1n, verifier.address);
    });

    it("reverts if project not found", async () => {
      await expect(contract.connect(verifier).verifyProject(99n)).to.be.revertedWith(
        "project not found"
      );
    });

    it("reverts if already verified", async () => {
      await contract.connect(verifier).verifyProject(1n);
      await expect(contract.connect(verifier).verifyProject(1n)).to.be.revertedWith(
        "already verified"
      );
    });

    it("reverts if caller is not the project verifier", async () => {
      const role = await contract.VERIFIER_ROLE();
      await contract.connect(admin).grantRole(role, verifier2.address);
      await expect(contract.connect(verifier2).verifyProject(1n)).to.be.revertedWith(
        "not project verifier"
      );
    });
  });

  // ──────────────────────────────────────────────
  // issueCredits
  // ──────────────────────────────────────────────

  describe("issueCredits", function () {
    const AMOUNT = ethers.parseEther("1000");

    beforeEach(async () => {
      await contract
        .connect(verifier)
        .createProject("Mangrove Kenya", "VM0007", "East Africa", 2024, "ipfs://abc");
      await contract.connect(verifier).verifyProject(1n);
    });

    it("mints credits to recipient", async () => {
      await contract.connect(verifier).issueCredits(1n, AMOUNT, user.address);
      expect(await contract.balanceOf(user.address, 1n)).to.equal(AMOUNT);
    });

    it("updates totalIssued on project", async () => {
      await contract.connect(verifier).issueCredits(1n, AMOUNT, user.address);
      const p = await contract.getProject(1n);
      expect(p.totalIssued).to.equal(AMOUNT);
    });

    it("emits CreditsIssued event", async () => {
      await expect(contract.connect(verifier).issueCredits(1n, AMOUNT, user.address))
        .to.emit(contract, "CreditsIssued")
        .withArgs(1n, AMOUNT, user.address);
    });

    it("reverts if project not verified", async () => {
      await contract
        .connect(verifier)
        .createProject("Unverified", "VM0007", "Africa", 2024, "ipfs://uv");
      await expect(
        contract.connect(verifier).issueCredits(2n, AMOUNT, user.address)
      ).to.be.revertedWith("project not verified");
    });

    it("reverts if amount is zero", async () => {
      await expect(
        contract.connect(verifier).issueCredits(1n, 0n, user.address)
      ).to.be.revertedWith("amount zero");
    });

    it("reverts if recipient is zero address", async () => {
      await expect(
        contract.connect(verifier).issueCredits(1n, AMOUNT, ethers.ZeroAddress)
      ).to.be.revertedWith("invalid recipient");
    });

    it("reverts if exceeds project cap", async () => {
      const cap = await contract.MAX_SUPPLY_PER_PROJECT();
      await expect(
        contract.connect(verifier).issueCredits(1n, cap + 1n, user.address)
      ).to.be.revertedWith("exceeds project cap");
    });
  });

  // ──────────────────────────────────────────────
  // retireCredits
  // ──────────────────────────────────────────────

  describe("retireCredits", function () {
    const ISSUE = ethers.parseEther("5000");
    const RETIRE = ethers.parseEther("500");

    beforeEach(async () => {
      await contract
        .connect(verifier)
        .createProject("Mangrove Kenya", "VM0007", "East Africa", 2024, "ipfs://abc");
      await contract.connect(verifier).verifyProject(1n);
      await contract.connect(verifier).issueCredits(1n, ISSUE, user.address);
    });

    it("burns credits from holder", async () => {
      await contract.connect(user).retireCredits(1n, RETIRE, "Offset 2024");
      expect(await contract.balanceOf(user.address, 1n)).to.equal(ISSUE - RETIRE);
    });

    it("emits CreditsRetired event", async () => {
      await expect(contract.connect(user).retireCredits(1n, RETIRE, "Annual offset"))
        .to.emit(contract, "CreditsRetired")
        .withArgs(1n, RETIRE, user.address, user.address, "Annual offset");
    });

    it("reverts if balance insufficient", async () => {
      await expect(
        contract.connect(other).retireCredits(1n, RETIRE, "Offset")
      ).to.be.revertedWith("insufficient balance");
    });

    it("reverts if amount is zero", async () => {
      await expect(
        contract.connect(user).retireCredits(1n, 0n, "Offset")
      ).to.be.revertedWith("amount zero");
    });
  });

  // ──────────────────────────────────────────────
  // retireCreditsFrom (delegation)
  // ──────────────────────────────────────────────

  describe("retireCreditsFrom", function () {
    const ISSUE = ethers.parseEther("2000");
    const RETIRE = ethers.parseEther("200");

    beforeEach(async () => {
      await contract
        .connect(verifier)
        .createProject("Mangrove Kenya", "VM0007", "East Africa", 2024, "ipfs://abc");
      await contract.connect(verifier).verifyProject(1n);
      await contract.connect(verifier).issueCredits(1n, ISSUE, user.address);
    });

    it("retires on behalf of holder with approval", async () => {
      await contract.connect(user).setApprovalForAll(other.address, true);
      await contract
        .connect(other)
        .retireCreditsFrom(user.address, 1n, RETIRE, "Delegated offset");
      expect(await contract.balanceOf(user.address, 1n)).to.equal(ISSUE - RETIRE);
    });

    it("allows holder to retire for themselves without approval", async () => {
      await contract
        .connect(user)
        .retireCreditsFrom(user.address, 1n, RETIRE, "Self retire");
      expect(await contract.balanceOf(user.address, 1n)).to.equal(ISSUE - RETIRE);
    });

    it("reverts if caller not approved", async () => {
      await expect(
        contract
          .connect(other)
          .retireCreditsFrom(user.address, 1n, RETIRE, "Unauthorized")
      ).to.be.revertedWith("not approved");
    });
  });

  // ──────────────────────────────────────────────
  // getProjectRemainingCap
  // ──────────────────────────────────────────────

  describe("getProjectRemainingCap", function () {
    const ISSUE = ethers.parseEther("1000000");

    beforeEach(async () => {
      await contract
        .connect(verifier)
        .createProject("Mangrove Kenya", "VM0007", "East Africa", 2024, "ipfs://abc");
      await contract.connect(verifier).verifyProject(1n);
      await contract.connect(verifier).issueCredits(1n, ISSUE, user.address);
    });

    it("returns correct remaining cap after issuance", async () => {
      const cap = await contract.MAX_SUPPLY_PER_PROJECT();
      expect(await contract.getProjectRemainingCap(1n)).to.equal(cap - ISSUE);
    });

    it("returns full cap for a fresh project", async () => {
      await contract
        .connect(verifier)
        .createProject("Solar Zambia", "AMS0002", "Southern Africa", 2023, "ipfs://s");
      const cap = await contract.MAX_SUPPLY_PER_PROJECT();
      expect(await contract.getProjectRemainingCap(2n)).to.equal(cap);
    });

    it("reverts for non-existent project", async () => {
      await expect(contract.getProjectRemainingCap(99n)).to.be.revertedWith(
        "project not found"
      );
    });
  });

  // ──────────────────────────────────────────────
  // Pause / unpause
  // ──────────────────────────────────────────────

  describe("Pause", function () {
    it("admin can pause and unpause", async () => {
      await contract.connect(admin).pause();
      expect(await contract.paused()).to.be.true;
      await contract.connect(admin).unpause();
      expect(await contract.paused()).to.be.false;
    });

    it("non-pauser cannot pause", async () => {
      await expect(contract.connect(other).pause()).to.be.reverted;
    });
  });

  // ──────────────────────────────────────────────
  // Role management
  // ──────────────────────────────────────────────

  describe("Role management", function () {
    it("admin can grant VERIFIER_ROLE", async () => {
      const role = await contract.VERIFIER_ROLE();
      await contract.connect(admin).grantRole(role, verifier2.address);
      expect(await contract.hasRole(role, verifier2.address)).to.be.true;
    });

    it("admin can revoke VERIFIER_ROLE", async () => {
      const role = await contract.VERIFIER_ROLE();
      await contract.connect(admin).revokeRole(role, verifier.address);
      expect(await contract.hasRole(role, verifier.address)).to.be.false;
    });
  });
});
